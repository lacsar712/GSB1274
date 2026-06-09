import pool from '../config/database.js';
import Waybill from '../models/Waybill.js';

class StatisticsController {
  // 获取企业运营概览
  static async getOverview(req, res) {
    try {
      const { id } = req.params;

      // 获取企业信息
      const [companyRows] = await pool.execute(
        'SELECT id, name, status FROM companies WHERE id = ?',
        [id]
      );

      if (companyRows.length === 0) {
        return res.json({
          success: true,
          data: {
            company: {
              id,
              name: ''
            },
            waybills: {
              total: 0,
              pending: 0,
              inTransit: 0,
              arrived: 0,
              signed: 0,
              abnormal: 0,
              cancelled: 0
            },
            revenue: {
              total: 0,
              paid: 0,
              unpaid: 0
            },
            monthly: {
              waybills: 0,
              revenue: 0
            }
          }
        });
      }

      const company = companyRows[0];

      if (company.status !== 'approved') {
        return res.json({
          success: true,
          data: {
            company: {
              id: company.id,
              name: company.name
            },
            waybills: {
              total: 0,
              pending: 0,
              inTransit: 0,
              arrived: 0,
              signed: 0,
              abnormal: 0,
              cancelled: 0
            },
            revenue: {
              total: 0,
              paid: 0,
              unpaid: 0
            },
            monthly: {
              waybills: 0,
              revenue: 0
            }
          }
        });
      }

      let waybillStats = [];
      try {
        waybillStats = await Waybill.aggregate([
          { $match: { companyId: id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);
      } catch (_) {
        waybillStats = [];
      }

      // 转换为对象格式
      const statusCount = {
        total: 0,
        pending: 0,
        inTransit: 0,
        arrived: 0,
        signed: 0,
        abnormal: 0,
        cancelled: 0
      };

      waybillStats.forEach(stat => {
        statusCount.total += stat.count;
        switch (stat._id) {
          case '待发货':
            statusCount.pending = stat.count;
            break;
          case '运输中':
            statusCount.inTransit = stat.count;
            break;
          case '已到达':
            statusCount.arrived = stat.count;
            break;
          case '已签收':
            statusCount.signed = stat.count;
            break;
          case '异常':
            statusCount.abnormal = stat.count;
            break;
          case '已取消':
            statusCount.cancelled = stat.count;
            break;
        }
      });

      let revenueStats = [];
      try {
        revenueStats = await Waybill.aggregate([
          { $match: { companyId: id } },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$fee.total' },
              paidRevenue: {
                $sum: {
                  $cond: [{ $eq: ['$fee.paid', true] }, '$fee.total', 0]
                }
              },
              unpaidRevenue: {
                $sum: {
                  $cond: [{ $eq: ['$fee.paid', false] }, '$fee.total', 0]
                }
              }
            }
          }
        ]);
      } catch (_) {
        revenueStats = [];
      }

      const revenue = revenueStats.length > 0 ? revenueStats[0] : {
        totalRevenue: 0,
        paidRevenue: 0,
        unpaidRevenue: 0
      };

      // 获取本月运单数量
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      let monthlyWaybills = 0;
      try {
        monthlyWaybills = await Waybill.countDocuments({
          companyId: id,
          createdAt: { $gte: currentMonth }
        });
      } catch (_) {
        monthlyWaybills = 0;
      }

      let monthlyRevenueStats = [];
      try {
        monthlyRevenueStats = await Waybill.aggregate([
          {
            $match: {
              companyId: id,
              createdAt: { $gte: currentMonth }
            }
          },
          {
            $group: {
              _id: null,
              monthlyRevenue: { $sum: '$fee.total' }
            }
          }
        ]);
      } catch (_) {
        monthlyRevenueStats = [];
      }

      const monthlyRevenue = monthlyRevenueStats.length > 0 
        ? monthlyRevenueStats[0].monthlyRevenue 
        : 0;

      res.json({
        success: true,
        data: {
          company: {
            id: company.id,
            name: company.name
          },
          waybills: statusCount,
          revenue: {
            total: revenue.totalRevenue || 0,
            paid: revenue.paidRevenue || 0,
            unpaid: revenue.unpaidRevenue || 0
          },
          monthly: {
            waybills: monthlyWaybills,
            revenue: monthlyRevenue
          }
        }
      });
    } catch (error) {
      console.error('获取企业运营概览失败:', error);
      res.json({
        success: true,
        data: {
          company: {
            id: req.params.id,
            name: ''
          },
          waybills: {
            total: 0,
            pending: 0,
            inTransit: 0,
            arrived: 0,
            signed: 0,
            abnormal: 0,
            cancelled: 0
          },
          revenue: {
            total: 0,
            paid: 0,
            unpaid: 0
          },
          monthly: {
            waybills: 0,
            revenue: 0
          }
        }
      });
    }
  }

  // 获取收入统计数据
  static async getRevenue(req, res) {
    try {
      const { id } = req.params;
      const { startDate, endDate, groupBy = 'day' } = req.query;

      // 验证企业
      const [companyRows] = await pool.execute(
        'SELECT id, name, status FROM companies WHERE id = ?',
        [id]
      );

      if (companyRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: '企业不存在'
        });
      }

      if (companyRows[0].status !== 'approved') {
        return res.status(403).json({
          success: false,
          message: '企业未通过审核，无法查看统计数据'
        });
      }

      // 构建日期范围
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      // 根据groupBy参数设置分组格式
      let dateFormat;
      switch (groupBy) {
        case 'month':
          dateFormat = '%Y-%m';
          break;
        case 'week':
          dateFormat = '%Y-W%V';
          break;
        case 'day':
        default:
          dateFormat = '%Y-%m-%d';
          break;
      }

      let revenueData = [];
      try {
        revenueData = await Waybill.aggregate([
          {
            $match: {
              companyId: id,
              createdAt: { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: dateFormat, date: '$createdAt' }
              },
              totalRevenue: { $sum: '$fee.total' },
              paidRevenue: {
                $sum: {
                  $cond: [{ $eq: ['$fee.paid', true] }, '$fee.total', 0]
                }
              },
              unpaidRevenue: {
                $sum: {
                  $cond: [{ $eq: ['$fee.paid', false] }, '$fee.total', 0]
                }
              },
              waybillCount: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]);
      } catch (_) {
        revenueData = [];
      }

      // 按支付方式统计
      let paymentMethodStats = [];
      try {
        paymentMethodStats = await Waybill.aggregate([
          {
            $match: {
              companyId: id,
              createdAt: { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: '$fee.paymentMethod',
              count: { $sum: 1 },
              revenue: { $sum: '$fee.total' }
            }
          }
        ]);
      } catch (_) {
        paymentMethodStats = [];
      }

      // 按货物类型统计
      let cargoTypeStats = [];
      try {
        cargoTypeStats = await Waybill.aggregate([
          {
            $match: {
              companyId: id,
              createdAt: { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: '$cargo.type',
              count: { $sum: 1 },
              revenue: { $sum: '$fee.total' }
            }
          }
        ]);
      } catch (_) {
        cargoTypeStats = [];
      }

      res.json({
        success: true,
        data: {
          trend: revenueData,
          paymentMethod: paymentMethodStats,
          cargoType: cargoTypeStats,
          period: {
            start: start.toISOString(),
            end: end.toISOString(),
            groupBy
          }
        }
      });
    } catch (error) {
      console.error('获取收入统计数据失败:', error);
      const start = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = req.query.endDate ? new Date(req.query.endDate) : new Date();
      res.json({
        success: true,
        data: {
          trend: [],
          paymentMethod: [],
          cargoType: [],
          period: {
            start: start.toISOString(),
            end: end.toISOString(),
            groupBy: req.query.groupBy || 'day'
          }
        }
      });
    }
  }

  // 导出统计数据
  static async exportData(req, res) {
    try {
      const { id } = req.params;
      const { startDate, endDate, type = 'overview' } = req.query;

      // 验证企业
      const [companyRows] = await pool.execute(
        'SELECT id, name, status FROM companies WHERE id = ?',
        [id]
      );

      if (companyRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: '企业不存在'
        });
      }

      if (companyRows[0].status !== 'approved') {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        const filename = `${companyRows[0].name || '企业'}_统计数据_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.json`;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        return res.json({
          success: true,
          data: {},
          exportTime: new Date().toISOString()
        });
      }

      const company = companyRows[0];

      // 构建日期范围
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      let exportData = {};

      if (type === 'overview' || type === 'all') {
        let waybills = [];
        try {
          waybills = await Waybill.find({
            companyId: id,
            createdAt: { $gte: start, $lte: end }
          }).select('waybillNo status fee.total fee.paid createdAt');
        } catch (_) {
          waybills = [];
        }
        exportData.overview = {
          company: company.name,
          period: {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
          },
          waybills: waybills.map(w => ({
            waybillNo: w.waybillNo,
            status: w.status,
            amount: w.fee?.total || 0,
            paid: w.fee?.paid || false,
            date: w.createdAt.toISOString().split('T')[0]
          }))
        };
      }

      if (type === 'revenue' || type === 'all') {
        let revenueStats = [];
        try {
          revenueStats = await Waybill.aggregate([
            {
              $match: {
                companyId: id,
                createdAt: { $gte: start, $lte: end }
              }
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                totalRevenue: { $sum: '$fee.total' },
                paidRevenue: {
                  $sum: {
                    $cond: [{ $eq: ['$fee.paid', true] }, '$fee.total', 0]
                  }
                },
                waybillCount: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]);
        } catch (_) {
          revenueStats = [];
        }
        exportData.revenue = revenueStats.map(stat => ({
          date: stat._id,
          totalRevenue: stat.totalRevenue,
          paidRevenue: stat.paidRevenue,
          unpaidRevenue: stat.totalRevenue - stat.paidRevenue,
          waybillCount: stat.waybillCount
        }));
      }

      // 设置响应头，支持下载
      const filename = `${company.name}_统计数据_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

      res.json({
        success: true,
        data: exportData,
        exportTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('导出统计数据失败:', error);
      const start = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = req.query.endDate ? new Date(req.query.endDate) : new Date();
      const filename = `统计数据_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.json({
        success: true,
        data: {},
        exportTime: new Date().toISOString()
      });
    }
  }

  // 获取全局运营概览（不限企业）
  static async getOperationsOverview(req, res) {
    try {
      const { companyId, startDate, endDate } = req.query;

      // 构建日期范围
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      // 构建查询条件
      const matchCondition = {
        createdAt: { $gte: start, $lte: end }
      };
      if (companyId) {
        matchCondition.companyId = companyId;
      }

      // 获取运单统计
      const waybillStats = await Waybill.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const statusCount = {
        total: 0,
        pending: 0,
        inTransit: 0,
        arrived: 0,
        signed: 0,
        abnormal: 0,
        cancelled: 0
      };

      waybillStats.forEach(stat => {
        statusCount.total += stat.count;
        switch (stat._id) {
          case '待发货':
            statusCount.pending = stat.count;
            break;
          case '运输中':
            statusCount.inTransit = stat.count;
            break;
          case '已到达':
            statusCount.arrived = stat.count;
            break;
          case '已签收':
            statusCount.signed = stat.count;
            break;
          case '异常':
            statusCount.abnormal = stat.count;
            break;
          case '已取消':
            statusCount.cancelled = stat.count;
            break;
        }
      });

      // 获取收入统计
      const revenueStats = await Waybill.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$fee.total' },
            paidRevenue: {
              $sum: {
                $cond: [{ $eq: ['$fee.paid', true] }, '$fee.total', 0]
              }
            },
            unpaidRevenue: {
              $sum: {
                $cond: [{ $eq: ['$fee.paid', false] }, '$fee.total', 0]
              }
            }
          }
        }
      ]);

      const revenue = revenueStats.length > 0 ? revenueStats[0] : {
        totalRevenue: 0,
        paidRevenue: 0,
        unpaidRevenue: 0
      };

      // 获取企业数量
      const [companyCountRows] = await pool.execute(
        'SELECT COUNT(*) as count FROM companies WHERE status = ?',
        ['approved']
      );
      const companyCount = companyCountRows[0].count;

      // 获取活跃企业数（有运单的企业）
      const activeCompanies = await Waybill.distinct('companyId', matchCondition);

      res.json({
        success: true,
        data: {
          period: {
            start: start.toISOString(),
            end: end.toISOString()
          },
          companies: {
            total: companyCount,
            active: activeCompanies.length
          },
          waybills: statusCount,
          revenue: {
            total: revenue.totalRevenue || 0,
            paid: revenue.paidRevenue || 0,
            unpaid: revenue.unpaidRevenue || 0
          }
        }
      });
    } catch (error) {
      console.error('获取运营概览失败:', error);
      res.json({
        success: true,
        data: {
          period: {
            start: (req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).toISOString(),
            end: (req.query.endDate ? new Date(req.query.endDate) : new Date()).toISOString()
          },
          companies: {
            total: 0,
            active: 0
          },
          waybills: {
            total: 0,
            pending: 0,
            inTransit: 0,
            arrived: 0,
            signed: 0,
            abnormal: 0,
            cancelled: 0
          },
          revenue: {
            total: 0,
            paid: 0,
            unpaid: 0
          }
        }
      });
    }
  }

  // 获取全局收入统计
  static async getOperationsRevenue(req, res) {
    try {
      const { companyId, startDate, endDate, groupBy = 'day' } = req.query;

      // 构建日期范围
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      // 构建查询条件
      const matchCondition = {
        createdAt: { $gte: start, $lte: end }
      };
      if (companyId) {
        matchCondition.companyId = companyId;
      }

      // 根据groupBy参数设置分组格式
      let dateFormat;
      switch (groupBy) {
        case 'month':
          dateFormat = '%Y-%m';
          break;
        case 'week':
          dateFormat = '%Y-W%V';
          break;
        case 'day':
        default:
          dateFormat = '%Y-%m-%d';
          break;
      }

      let revenueData = [];
      try {
        revenueData = await Waybill.aggregate([
          { $match: matchCondition },
          {
            $group: {
              _id: {
                $dateToString: { format: dateFormat, date: '$createdAt' }
              },
              totalRevenue: { $sum: '$fee.total' },
              paidRevenue: {
                $sum: {
                  $cond: [{ $eq: ['$fee.paid', true] }, '$fee.total', 0]
                }
              },
              unpaidRevenue: {
                $sum: {
                  $cond: [{ $eq: ['$fee.paid', false] }, '$fee.total', 0]
                }
              },
              waybillCount: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]);
      } catch (_) {
        revenueData = [];
      }

      // 按企业统计（Top 10）
      let companyStats = [];
      try {
        companyStats = await Waybill.aggregate([
          { $match: matchCondition },
          {
            $group: {
              _id: '$companyId',
              waybillCount: { $sum: 1 },
              revenue: { $sum: '$fee.total' }
            }
          },
          { $sort: { revenue: -1 } },
          { $limit: 10 }
        ]);
      } catch (_) {
        companyStats = [];
      }

      // 获取企业名称
      const companyIds = companyStats.map(s => s._id);
      if (companyIds.length > 0) {
        try {
          const [companyRows] = await pool.execute(
            `SELECT id, name FROM companies WHERE id IN (${companyIds.map(() => '?').join(',')})`,
            companyIds
          );
          const companyMap = {};
          companyRows.forEach(c => {
            companyMap[c.id] = c.name;
          });
          companyStats.forEach(stat => {
            stat.companyName = companyMap[stat._id] || '未知企业';
          });
        } catch (_) {
          companyStats.forEach(stat => {
            stat.companyName = '未知企业';
          });
        }
      }

      // 按支付方式统计
      let paymentMethodStats = [];
      try {
        paymentMethodStats = await Waybill.aggregate([
          { $match: matchCondition },
          {
            $group: {
              _id: '$fee.paymentMethod',
              count: { $sum: 1 },
              revenue: { $sum: '$fee.total' }
            }
          }
        ]);
      } catch (_) {
        paymentMethodStats = [];
      }

      res.json({
        success: true,
        data: {
          trend: revenueData,
          topCompanies: companyStats,
          paymentMethod: paymentMethodStats,
          period: {
            start: start.toISOString(),
            end: end.toISOString(),
            groupBy
          }
        }
      });
    } catch (error) {
      console.error('获取收入统计失败:', error);
      const start = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = req.query.endDate ? new Date(req.query.endDate) : new Date();
      res.json({
        success: true,
        data: {
          trend: [],
          topCompanies: [],
          paymentMethod: [],
          period: {
            start: start.toISOString(),
            end: end.toISOString(),
            groupBy: req.query.groupBy || 'day'
          }
        }
      });
    }
  }

  // 导出全局运营数据
  static async exportOperationsData(req, res) {
    try {
      const { companyId, startDate, endDate, type = 'overview' } = req.query;

      // 构建日期范围
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      // 构建查询条件
      const matchCondition = {
        createdAt: { $gte: start, $lte: end }
      };
      if (companyId) {
        matchCondition.companyId = companyId;
      }

      let exportData = {};

      if (type === 'overview' || type === 'all') {
        // 导出概览数据
        const waybills = await Waybill.find(matchCondition)
          .select('waybillNo companyId status fee.total fee.paid createdAt')
          .limit(10000);

        exportData.overview = {
          period: {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
          },
          waybills: waybills.map(w => ({
            waybillNo: w.waybillNo,
            companyId: w.companyId,
            status: w.status,
            amount: w.fee?.total || 0,
            paid: w.fee?.paid || false,
            date: w.createdAt.toISOString().split('T')[0]
          }))
        };
      }

      if (type === 'revenue' || type === 'all') {
        // 导出收入数据
        const revenueStats = await Waybill.aggregate([
          { $match: matchCondition },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                companyId: '$companyId'
              },
              totalRevenue: { $sum: '$fee.total' },
              paidRevenue: {
                $sum: {
                  $cond: [{ $eq: ['$fee.paid', true] }, '$fee.total', 0]
                }
              },
              waybillCount: { $sum: 1 }
            }
          },
          { $sort: { '_id.date': 1 } }
        ]);

        exportData.revenue = revenueStats.map(stat => ({
          date: stat._id.date,
          companyId: stat._id.companyId,
          totalRevenue: stat.totalRevenue,
          paidRevenue: stat.paidRevenue,
          unpaidRevenue: stat.totalRevenue - stat.paidRevenue,
          waybillCount: stat.waybillCount
        }));
      }

      // 设置响应头，支持下载
      const filename = `运营统计数据_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

      res.json({
        success: true,
        data: exportData,
        exportTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('导出运营数据失败:', error);
      res.status(500).json({
        success: false,
        message: '导出运营数据失败',
        error: error.message
      });
    }
  }
}

export default StatisticsController;
