import Waybill from '../models/Waybill.js';
import Company from '../models/Company.js';
import pool from '../config/database.js';

// 获取企业运单列表
export const getCompanyWaybills = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      waybillNo, 
      senderPhone, 
      receiverPhone,
      startDate,
      endDate,
      cargoType,
      transportType
    } = req.query;

    // 验证企业是否存在
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: '企业不存在'
      });
    }

    // 构建查询条件
    const query = { companyId: id };
    
    if (status) {
      query.status = status;
    }
    
    if (waybillNo) {
      query.waybillNo = new RegExp(waybillNo, 'i');
    }
    
    if (senderPhone) {
      query['sender.phone'] = new RegExp(senderPhone, 'i');
    }
    
    if (receiverPhone) {
      query['receiver.phone'] = new RegExp(receiverPhone, 'i');
    }
    
    if (cargoType) {
      query['cargo.type'] = cargoType;
    }
    
    if (transportType) {
      query['transport.type'] = transportType;
    }
    
    // 日期范围查询
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // 分页查询
    const skip = (page - 1) * limit;
    const waybills = await Waybill.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('companyId', 'name');

    const total = await Waybill.countDocuments(query);

    // 统计信息
    const stats = await Waybill.aggregate([
      { $match: { companyId: company._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = {};
    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        waybills,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        },
        stats: {
          total,
          statusStats
        }
      }
    });
  } catch (error) {
    console.error('获取运单列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取运单列表失败',
      error: error.message
    });
  }
};

// 获取运单详情
export const getWaybillDetail = async (req, res) => {
  try {
    const { id, waybillId } = req.params;

    // 验证企业是否存在
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: '企业不存在'
      });
    }

    // 查询运单
    const waybill = await Waybill.findOne({
      _id: waybillId,
      companyId: id
    }).populate('companyId', 'name contactPerson contactPhone');

    if (!waybill) {
      return res.status(404).json({
        success: false,
        message: '运单不存在'
      });
    }

    res.json({
      success: true,
      data: waybill
    });
  } catch (error) {
    console.error('获取运单详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取运单详情失败',
      error: error.message
    });
  }
};

// 创建运单
export const createWaybill = async (req, res) => {
  try {
    const { id } = req.params;
    const waybillData = req.body;

    // 验证企业是否存在
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: '企业不存在'
      });
    }

    // 生成运单编号
    const waybillNo = await Waybill.generateWaybillNo();

    // 计算总费用
    const fee = waybillData.fee || {};
    fee.total = (fee.freight || 0) + (fee.insurance || 0) + (fee.other || 0);

    // 创建运单
    const waybill = new Waybill({
      ...waybillData,
      waybillNo,
      companyId: id,
      fee,
      tracks: [{
        time: new Date(),
        location: waybillData.sender?.address?.city || '始发地',
        status: '待发货',
        description: '运单已创建',
        operator: company.name
      }]
    });

    await waybill.save();

    res.status(201).json({
      success: true,
      message: '运单创建成功',
      data: waybill
    });
  } catch (error) {
    console.error('创建运单失败:', error);
    res.status(500).json({
      success: false,
      message: '创建运单失败',
      error: error.message
    });
  }
};

// 更新运单
export const updateWaybill = async (req, res) => {
  try {
    const { id, waybillId } = req.params;
    const updateData = req.body;

    // 验证企业是否存在
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: '企业不存在'
      });
    }

    // 查询运单
    const waybill = await Waybill.findOne({
      _id: waybillId,
      companyId: id
    });

    if (!waybill) {
      return res.status(404).json({
        success: false,
        message: '运单不存在'
      });
    }

    // 不允许修改的字段
    delete updateData.waybillNo;
    delete updateData.companyId;
    delete updateData.createdAt;

    // 如果更新费用，重新计算总费用
    if (updateData.fee) {
      updateData.fee.total = 
        (updateData.fee.freight || waybill.fee.freight || 0) + 
        (updateData.fee.insurance || waybill.fee.insurance || 0) + 
        (updateData.fee.other || waybill.fee.other || 0);
    }

    // 更新运单
    Object.assign(waybill, updateData);
    await waybill.save();

    res.json({
      success: true,
      message: '运单更新成功',
      data: waybill
    });
  } catch (error) {
    console.error('更新运单失败:', error);
    res.status(500).json({
      success: false,
      message: '更新运单失败',
      error: error.message
    });
  }
};

export const migrateMysqlWaybills = async (req, res) => {
  try {
    const { companyId } = req.query;
    const params = [];
    let where = ' WHERE 1=1';
    if (companyId) {
      where += ' AND company_id = ?';
      params.push(companyId);
    }
    const [rows] = await pool.execute(
      `SELECT id, waybill_number, company_id, driver_id, vehicle_id, carrier_id, cargo_name, status, created_at FROM waybills${where} ORDER BY created_at ASC`,
      params
    );
    let inserted = 0;
    for (const r of rows) {
      const waybillNo = r.waybill_number || `WB${String(r.id).padStart(8, '0')}`;
      const exists = await Waybill.findOne({ waybillNo });
      if (exists) continue;
      let status = '待发货';
      if (r.status === 'created') status = '待发货';
      else if (r.status === 'in_transit') status = '运输中';
      else if (r.status === 'arrived') status = '已到达';
      else if (r.status === 'signed') status = '已签收';
      else if (r.status === 'abnormal') status = '异常';
      else if (r.status === 'cancelled') status = '已取消';
      const doc = new Waybill({
        waybillNo,
        companyId: String(r.company_id),
        sender: { name: '发货方', phone: '00000000000', address: { city: '' } },
        receiver: { name: '收货方', phone: '00000000000', address: { city: '' } },
        cargo: { name: r.cargo_name || '货物', type: '普货', weight: 1 },
        transport: {},
        status,
        fee: { freight: 0, insurance: 0, other: 0, total: 0, paid: false, paymentMethod: '到付' },
        tracks: [{
          time: r.created_at ? new Date(r.created_at) : new Date(),
          location: '系统',
          status,
          description: '从MySQL导入',
          operator: '系统'
        }],
        createdAt: r.created_at ? new Date(r.created_at) : new Date()
      });
      await doc.save();
      inserted++;
    }
    res.json({ success: true, message: '迁移完成', data: { total: rows.length, inserted } });
  } catch (error) {
    console.error('迁移MySQL运单到Mongo失败:', error);
    res.status(500).json({ success: false, message: '迁移失败', error: error.message });
  }
};

// 更新运单状态
export const updateWaybillStatus = async (req, res) => {
  try {
    const { id, waybillId } = req.params;
    const { status, location, description, operator } = req.body;

    // 验证企业是否存在
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: '企业不存在'
      });
    }

    // 查询运单
    const waybill = await Waybill.findOne({
      _id: waybillId,
      companyId: id
    });

    if (!waybill) {
      return res.status(404).json({
        success: false,
        message: '运单不存在'
      });
    }

    // 更新状态并添加轨迹
    await waybill.updateStatus(status, {
      location,
      description,
      operator: operator || company.name
    });

    res.json({
      success: true,
      message: '运单状态更新成功',
      data: waybill
    });
  } catch (error) {
    console.error('更新运单状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新运单状态失败',
      error: error.message
    });
  }
};

// 添加运单轨迹
export const addWaybillTrack = async (req, res) => {
  try {
    const { id, waybillId } = req.params;
    const trackData = req.body;

    // 验证企业是否存在
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: '企业不存在'
      });
    }

    // 查询运单
    const waybill = await Waybill.findOne({
      _id: waybillId,
      companyId: id
    });

    if (!waybill) {
      return res.status(404).json({
        success: false,
        message: '运单不存在'
      });
    }

    // 添加轨迹
    await waybill.addTrack({
      ...trackData,
      operator: trackData.operator || company.name
    });

    res.json({
      success: true,
      message: '轨迹添加成功',
      data: waybill
    });
  } catch (error) {
    console.error('添加运单轨迹失败:', error);
    res.status(500).json({
      success: false,
      message: '添加运单轨迹失败',
      error: error.message
    });
  }
};

// 删除运单
export const deleteWaybill = async (req, res) => {
  try {
    const { id, waybillId } = req.params;

    // 验证企业是否存在
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: '企业不存在'
      });
    }

    // 查询运单
    const waybill = await Waybill.findOne({
      _id: waybillId,
      companyId: id
    });

    if (!waybill) {
      return res.status(404).json({
        success: false,
        message: '运单不存在'
      });
    }

    // 只能删除待发货或已取消的运单
    if (!['待发货', '已取消'].includes(waybill.status)) {
      return res.status(400).json({
        success: false,
        message: '只能删除待发货或已取消的运单'
      });
    }

    await Waybill.deleteOne({ _id: waybillId });

    res.json({
      success: true,
      message: '运单删除成功'
    });
  } catch (error) {
    console.error('删除运单失败:', error);
    res.status(500).json({
      success: false,
      message: '删除运单失败',
      error: error.message
    });
  }
};

// 获取运单统计
export const getWaybillStats = async (req, res) => {
  try {
    const { id } = req.params;

    // 验证企业是否存在
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: '企业不存在'
      });
    }

    // 总运单数
    const total = await Waybill.countDocuments({ companyId: id });

    // 按状态统计
    const statusStats = await Waybill.aggregate([
      { $match: { companyId: company._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // 按货物类型统计
    const cargoTypeStats = await Waybill.aggregate([
      { $match: { companyId: company._id } },
      {
        $group: {
          _id: '$cargo.type',
          count: { $sum: 1 }
        }
      }
    ]);

    // 按运输方式统计
    const transportTypeStats = await Waybill.aggregate([
      { $match: { companyId: company._id } },
      {
        $group: {
          _id: '$transport.type',
          count: { $sum: 1 }
        }
      }
    ]);

    // 本月运单数
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyCount = await Waybill.countDocuments({
      companyId: id,
      createdAt: { $gte: startOfMonth }
    });

    res.json({
      success: true,
      data: {
        total,
        monthlyCount,
        statusStats: statusStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        cargoTypeStats: cargoTypeStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        transportTypeStats: transportTypeStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('获取运单统计失败:', error);
    res.json({
      success: true,
      data: {
        total: 0,
        monthlyCount: 0,
        statusStats: {},
        cargoTypeStats: {},
        transportTypeStats: {}
      }
    });
  }
};
