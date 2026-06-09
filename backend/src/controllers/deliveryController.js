import Delivery from '../models/Delivery.js';
import { normalizeRow } from '../utils/encoding.js';

// 创建配送订单
export const createDelivery = async (req, res) => {
  try {
    const deliveryData = {
      ...req.body,
      created_by: req.user?.id || 'system'
    };

    // 生成订单号
    if (!deliveryData.order_no) {
      deliveryData.order_no = `DL${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }

    const deliveryId = await Delivery.create(deliveryData);
    const delivery = await Delivery.findById(deliveryId);

    res.status(201).json({
      success: true,
      message: '配送订单创建成功',
      data: normalizeRow(delivery)
    });
  } catch (error) {
    console.error('创建配送订单失败:', error);
    res.status(500).json({
      success: false,
      message: '创建配送订单失败',
      error: error.message
    });
  }
};

// 获取配送订单列表
export const getDeliveries = async (req, res) => {
  try {
    const {
      company_id,
      hub_id,
      status,
      delivery_type,
      start_date,
      end_date,
      keyword,
      page = 1,
      page_size = 20
    } = req.query;

    const filters = {
      company_id,
      hub_id,
      status,
      delivery_type,
      start_date,
      end_date,
      keyword,
      limit: parseInt(page_size),
      offset: (parseInt(page) - 1) * parseInt(page_size)
    };

    const [deliveries, total] = await Promise.all([
      Delivery.findAll(filters),
      Delivery.count(filters)
    ]);

    res.json({
      success: true,
      data: {
        list: deliveries.map(d => normalizeRow(d)),
        pagination: {
          page: parseInt(page),
          page_size: parseInt(page_size),
          total,
          total_pages: Math.ceil(total / parseInt(page_size))
        }
      }
    });
  } catch (error) {
    console.error('获取配送订单列表失败:', error);
    res.json({
      success: true,
      data: {
        list: [],
        pagination: {
          page: parseInt(req.query.page || 1),
          page_size: parseInt(req.query.page_size || 20),
          total: 0,
          total_pages: 0
        }
      }
    });
  }
};

// 获取配送订单详情
export const getDeliveryById = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findById(id);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: '配送订单不存在'
      });
    }

    res.json({
      success: true,
      data: normalizeRow(delivery)
    });
  } catch (error) {
    console.error('获取配送订单详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取配送订单详情失败',
      error: error.message
    });
  }
};

// 根据订单号获取配送订单
export const getDeliveryByOrderNo = async (req, res) => {
  try {
    const { order_no } = req.params;
    const delivery = await Delivery.findByOrderNo(order_no);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: '配送订单不存在'
      });
    }

    res.json({
      success: true,
      data: normalizeRow(delivery)
    });
  } catch (error) {
    console.error('获取配送订单详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取配送订单详情失败',
      error: error.message
    });
  }
};

// 更新配送订单
export const updateDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryData = {
      ...req.body,
      updated_by: req.user?.id || 'system'
    };

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: '配送订单不存在'
      });
    }

    const success = await Delivery.update(id, deliveryData);

    if (success) {
      const updatedDelivery = await Delivery.findById(id);
      res.json({
        success: true,
        message: '配送订单更新成功',
        data: normalizeRow(updatedDelivery)
      });
    } else {
      res.status(400).json({
        success: false,
        message: '配送订单更新失败'
      });
    }
  } catch (error) {
    console.error('更新配送订单失败:', error);
    res.status(500).json({
      success: false,
      message: '更新配送订单失败',
      error: error.message
    });
  }
};

// 更新配送状态
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: '状态不能为空'
      });
    }

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: '配送订单不存在'
      });
    }

    const success = await Delivery.updateStatus(
      id,
      status,
      req.user?.id || 'system'
    );

    if (success) {
      const updatedDelivery = await Delivery.findById(id);
      res.json({
        success: true,
        message: '配送状态更新成功',
        data: normalizeRow(updatedDelivery)
      });
    } else {
      res.status(400).json({
        success: false,
        message: '配送状态更新失败'
      });
    }
  } catch (error) {
    console.error('更新配送状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新配送状态失败',
      error: error.message
    });
  }
};

// 分配配送员
export const assignDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { driver_id, driver_name } = req.body;

    if (!driver_id || !driver_name) {
      return res.status(400).json({
        success: false,
        message: '配送员信息不完整'
      });
    }

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: '配送订单不存在'
      });
    }

    const success = await Delivery.assignDriver(
      id,
      driver_id,
      driver_name,
      req.user?.id || 'system'
    );

    if (success) {
      const updatedDelivery = await Delivery.findById(id);
      res.json({
        success: true,
        message: '配送员分配成功',
        data: normalizeRow(updatedDelivery)
      });
    } else {
      res.status(400).json({
        success: false,
        message: '配送员分配失败'
      });
    }
  } catch (error) {
    console.error('分配配送员失败:', error);
    res.status(500).json({
      success: false,
      message: '分配配送员失败',
      error: error.message
    });
  }
};

// 删除配送订单
export const deleteDelivery = async (req, res) => {
  try {
    const { id } = req.params;

    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: '配送订单不存在'
      });
    }

    const success = await Delivery.delete(id);

    if (success) {
      res.json({
        success: true,
        message: '配送订单删除成功'
      });
    } else {
      res.status(400).json({
        success: false,
        message: '配送订单删除失败'
      });
    }
  } catch (error) {
    console.error('删除配送订单失败:', error);
    res.status(500).json({
      success: false,
      message: '删除配送订单失败',
      error: error.message
    });
  }
};

// 获取配送统计数据
export const getStatistics = async (req, res) => {
  try {
    const { company_id, hub_id, start_date, end_date } = req.query;

    const filters = {
      company_id,
      hub_id,
      start_date,
      end_date
    };

    const statistics = await Delivery.getStatistics(filters);

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('获取配送统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取配送统计数据失败',
      error: error.message
    });
  }
};

// 获取配送趋势数据
export const getTrendData = async (req, res) => {
  try {
    const { company_id, hub_id, start_date, end_date } = req.query;

    const filters = {
      company_id,
      hub_id,
      start_date,
      end_date
    };

    const trendData = await Delivery.getTrendData(filters);
    const normalized = Array.isArray(trendData) ? trendData.map(d => normalizeRow(d)) : [];
    // 当无数据且提供了日期范围时，返回零值兜底，确保前端有图表数据
    let data = normalized;
    if ((!data || data.length === 0) && start_date && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);
      const days = [];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        days.push(`${yyyy}-${mm}-${dd}`);
      }
      data = days.map(date => ({
        date,
        order_count: 0,
        completed_count: 0,
        total_weight: 0
      }));
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('获取配送趋势数据失败:', error);
    res.json({
      success: true,
      data: []
    });
  }
};

// 获取配送员绩效数据
export const getDriverPerformance = async (req, res) => {
  try {
    const { company_id, hub_id, start_date, end_date } = req.query;

    const filters = {
      company_id,
      hub_id,
      start_date,
      end_date
    };

    const performance = await Delivery.getDriverPerformance(filters);
    const data = Array.isArray(performance) ? performance.map(r => normalizeRow(r)) : [];

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('获取配送员绩效数据失败:', error);
    res.json({
      success: true,
      data: []
    });
  }
};

export const getDeliveryTracks = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: '配送订单不存在'
      });
    }
    const tracks = await Delivery.getTracksByDeliveryId(id);
    res.json({
      success: true,
      data: tracks
    });
  } catch (error) {
    console.error('获取配送轨迹失败:', error);
    res.status(500).json({
      success: false,
      message: '获取配送轨迹失败',
      error: error.message
    });
  }
};

export const addDeliveryTrack = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, location, status, remark } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: '经纬度不能为空'
      });
    }
    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: '配送订单不存在'
      });
    }
    const trackId = await Delivery.addTrack(id, { latitude, longitude, location, status, remark });
    const tracks = await Delivery.getTracksByDeliveryId(id);
    res.status(201).json({
      success: true,
      message: '配送轨迹新增成功',
      data: { id: trackId, list: tracks }
    });
  } catch (error) {
    console.error('新增配送轨迹失败:', error);
    res.status(500).json({
      success: false,
      message: '新增配送轨迹失败',
      error: error.message
    });
  }
};

export const getDeliveryRatings = async (req, res) => {
  try {
    const { id } = req.params;
    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: '配送订单不存在'
      });
    }
    const ratings = await Delivery.getRatingsByDeliveryId(id);
    res.json({
      success: true,
      data: ratings
    });
  } catch (error) {
    console.error('获取配送评价失败:', error);
    res.status(500).json({
      success: false,
      message: '获取配送评价失败',
      error: error.message
    });
  }
};

export const addDeliveryRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, service_rating, speed_rating, attitude_rating, comment } = req.body;
    if (rating === undefined) {
      return res.status(400).json({
        success: false,
        message: '评分不能为空'
      });
    }
    const r = parseInt(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return res.status(400).json({
        success: false,
        message: '评分需为1-5的整数'
      });
    }
    const delivery = await Delivery.findById(id);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: '配送订单不存在'
      });
    }
    const ratingId = await Delivery.addRating(id, { rating: r, service_rating, speed_rating, attitude_rating, comment });
    const ratings = await Delivery.getRatingsByDeliveryId(id);
    res.status(201).json({
      success: true,
      message: '配送评价新增成功',
      data: { id: ratingId, list: ratings }
    });
  } catch (error) {
    console.error('新增配送评价失败:', error);
    res.status(500).json({
      success: false,
      message: '新增配送评价失败',
      error: error.message
    });
  }
};
