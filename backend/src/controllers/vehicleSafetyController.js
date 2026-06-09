import VehicleSafety from '../models/VehicleSafety.js';
import VehicleSafetyAlert from '../models/VehicleSafetyAlert.js';
import { normalizeRow } from '../utils/encoding.js';

export const createSafetyRecord = async (req, res) => {
  try {
    const safetyData = {
      ...req.body,
      created_by: req.user?.id || 'system'
    };

    const recordId = await VehicleSafety.create(safetyData);
    const record = await VehicleSafety.findById(recordId);

    res.status(201).json({
      success: true,
      message: '车辆安全记录创建成功',
      data: normalizeRow(record)
    });
  } catch (error) {
    console.error('创建车辆安全记录失败:', error);
    res.status(500).json({
      success: false,
      message: '创建车辆安全记录失败',
      error: error.message
    });
  }
};

export const getSafetyRecords = async (req, res) => {
  try {
    const {
      vehicle_id,
      company_id,
      event_type,
      event_level,
      status,
      start_date,
      end_date,
      keyword,
      page = 1,
      page_size = 20
    } = req.query;

    const filters = {
      vehicle_id,
      company_id,
      event_type,
      event_level,
      status,
      start_date,
      end_date,
      keyword,
      limit: parseInt(page_size),
      offset: (parseInt(page) - 1) * parseInt(page_size)
    };

    const [records, total] = await Promise.all([
      VehicleSafety.findAll(filters),
      VehicleSafety.count(filters)
    ]);

    res.json({
      success: true,
      data: {
        list: records.map(r => normalizeRow(r)),
        pagination: {
          page: parseInt(page),
          page_size: parseInt(page_size),
          total,
          total_pages: Math.ceil(total / parseInt(page_size))
        }
      }
    });
  } catch (error) {
    console.error('获取车辆安全记录列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取车辆安全记录列表失败',
      error: error.message
    });
  }
};

export const getSafetyRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await VehicleSafety.findById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '车辆安全记录不存在'
      });
    }

    res.json({
      success: true,
      data: normalizeRow(record)
    });
  } catch (error) {
    console.error('获取车辆安全记录详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取车辆安全记录详情失败',
      error: error.message
    });
  }
};

export const updateSafetyRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const safetyData = {
      ...req.body,
      updated_by: req.user?.id || 'system'
    };

    const record = await VehicleSafety.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: '车辆安全记录不存在'
      });
    }

    const success = await VehicleSafety.update(id, safetyData);

    if (success) {
      const updatedRecord = await VehicleSafety.findById(id);
      res.json({
        success: true,
        message: '车辆安全记录更新成功',
        data: normalizeRow(updatedRecord)
      });
    } else {
      res.status(400).json({
        success: false,
        message: '车辆安全记录更新失败'
      });
    }
  } catch (error) {
    console.error('更新车辆安全记录失败:', error);
    res.status(500).json({
      success: false,
      message: '更新车辆安全记录失败',
      error: error.message
    });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, handle_result } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: '状态不能为空'
      });
    }

    const record = await VehicleSafety.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: '车辆安全记录不存在'
      });
    }

    const success = await VehicleSafety.updateStatus(
      id,
      status,
      handle_result,
      req.user?.id || 'system'
    );

    if (success) {
      const updatedRecord = await VehicleSafety.findById(id);
      res.json({
        success: true,
        message: '处理状态更新成功',
        data: normalizeRow(updatedRecord)
      });
    } else {
      res.status(400).json({
        success: false,
        message: '处理状态更新失败'
      });
    }
  } catch (error) {
    console.error('更新处理状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新处理状态失败',
      error: error.message
    });
  }
};

export const deleteSafetyRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await VehicleSafety.findById(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: '车辆安全记录不存在'
      });
    }

    const success = await VehicleSafety.delete(id);

    if (success) {
      res.json({
        success: true,
        message: '车辆安全记录删除成功'
      });
    } else {
      res.status(400).json({
        success: false,
        message: '车辆安全记录删除失败'
      });
    }
  } catch (error) {
    console.error('删除车辆安全记录失败:', error);
    res.status(500).json({
      success: false,
      message: '删除车辆安全记录失败',
      error: error.message
    });
  }
};

export const getStatistics = async (req, res) => {
  try {
    const { company_id, start_date, end_date } = req.query;

    const filters = {
      company_id,
      start_date,
      end_date
    };

    const statistics = await VehicleSafety.getStatistics(filters);

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('获取车辆安全统计数据失败:', error);
    res.json({
      success: true,
      data: {
        total_events: 0,
        high_risk_events: 0,
        medium_risk_events: 0,
        low_risk_events: 0,
        vehicles_involved: 0
      }
    });
  }
};

export const getEventTypeDistribution = async (req, res) => {
  try {
    const { company_id, start_date, end_date } = req.query;

    const filters = {
      company_id,
      start_date,
      end_date
    };

    const distribution = await VehicleSafety.getEventTypeDistribution(filters);
    const data = Array.isArray(distribution) ? distribution.map(r => normalizeRow(r)) : [];

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('获取事件类型分布失败:', error);
    res.status(500).json({
      success: false,
      message: '获取事件类型分布失败',
      error: error.message
    });
  }
};

export const getTrendData = async (req, res) => {
  try {
    const { company_id, start_date, end_date } = req.query;

    const filters = {
      company_id,
      start_date,
      end_date
    };

    const trendData = await VehicleSafety.getTrendData(filters);
    const normalized = Array.isArray(trendData) ? trendData.map(d => normalizeRow(d)) : [];
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
        event_count: 0,
        critical_count: 0,
        high_count: 0
      }));
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('获取趋势数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取趋势数据失败',
      error: error.message
    });
  }
};

export const getVehicleLocations = async (req, res) => {
  try {
    const { company_id } = req.query;

    const filters = {
      company_id
    };

    const locations = await VehicleSafety.getVehicleLocations(filters);
    const data = Array.isArray(locations) ? locations.map(r => normalizeRow(r)) : [];

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('获取车辆实时位置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取车辆实时位置失败',
      error: error.message
    });
  }
};

export const getHighRiskVehicles = async (req, res) => {
  try {
    const { company_id, start_date, end_date, limit = 10 } = req.query;

    const filters = {
      company_id,
      start_date,
      end_date,
      limit: parseInt(limit)
    };

    const vehicles = await VehicleSafety.getHighRiskVehicles(filters);
    const data = Array.isArray(vehicles) ? vehicles.map(r => normalizeRow(r)) : [];

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('获取高风险车辆列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取高风险车辆列表失败',
      error: error.message
    });
  }
};

export const getAlertList = async (req, res) => {
  try {
    const {
      vehicle_id,
      alert_type,
      alert_level,
      start_date,
      end_date,
      page = 1,
      page_size = 20
    } = req.query;

    const filters = {
      vehicle_id,
      alert_type,
      alert_level,
      start_date,
      end_date,
      limit: parseInt(page_size),
      offset: (parseInt(page) - 1) * parseInt(page_size)
    };

    const [records, total] = await Promise.all([
      VehicleSafetyAlert.findAll(filters),
      VehicleSafetyAlert.count(filters)
    ]);

    res.json({
      success: true,
      data: {
        list: records.map(r => normalizeRow(r)),
        pagination: {
          page: parseInt(page),
          page_size: parseInt(page_size),
          total,
          total_pages: Math.ceil(total / parseInt(page_size))
        }
      }
    });
  } catch (error) {
    console.error('获取预警列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取预警列表失败',
      error: error.message
    });
  }
};

export const getAlertCount = async (req, res) => {
  try {
    const total = await VehicleSafetyAlert.count();
    res.json({
      success: true,
      data: { total }
    });
  } catch (error) {
    console.error('获取预警数量失败:', error);
    res.status(500).json({
      success: false,
      message: '获取预警数量失败',
      error: error.message
    });
  }
};

export const markAlertHandled = async (req, res) => {
  try {
    const { id } = req.params;

    const success = await VehicleSafetyAlert.markHandled(id);

    if (success) {
      res.json({
        success: true,
        message: '预警已标记为已处理'
      });
    } else {
      res.status(404).json({
        success: false,
        message: '预警不存在或已处理'
      });
    }
  } catch (error) {
    console.error('标记预警已处理失败:', error);
    res.status(500).json({
      success: false,
      message: '标记预警已处理失败',
      error: error.message
    });
  }
};
