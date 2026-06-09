import Vehicle from '../models/Vehicle.js';
import { normalizeRow } from '../utils/encoding.js';

// 获取车辆列表
export const getVehicles = async (req, res) => {
  try {
    const { plate_number, vehicle_type, carrier_id, status, page = 1, pageSize = 10 } = req.query;

    const filters = {
      plate_number,
      vehicle_type,
      carrier_id,
      status,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    };

    const result = await Vehicle.findAll(filters);

    res.json({
      code: 200,
      message: '获取车辆列表成功',
      data: (result.data || []).map(row => normalizeRow(row)),
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: Math.ceil(result.total / result.pageSize)
      }
    });
  } catch (error) {
    console.error('获取车辆列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取车辆列表失败',
      error: error.message
    });
  }
};

// 获取车辆详情
export const getVehicleById = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        code: 404,
        message: '车辆不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取车辆详情成功',
      data: normalizeRow(vehicle)
    });
  } catch (error) {
    console.error('获取车辆详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取车辆详情失败',
      error: error.message
    });
  }
};

// 创建车辆
export const createVehicle = async (req, res) => {
  try {
    const {
      plate_number,
      vehicle_type,
      brand,
      model,
      color,
      year,
      load_capacity,
      volume_capacity,
      carrier_id,
      driver_name,
      driver_phone,
      driver_license,
      registration_date,
      insurance_expiry,
      inspection_expiry,
      gps_device_id,
      current_location,
      latitude,
      longitude,
      description,
      status
    } = req.body;

    // 验证必填字段
    if (!plate_number) {
      return res.status(400).json({
        code: 400,
        message: '车牌号不能为空'
      });
    }

    if (!vehicle_type) {
      return res.status(400).json({
        code: 400,
        message: '车辆类型不能为空'
      });
    }

    const vehicleData = {
      plate_number,
      vehicle_type,
      brand,
      model,
      color,
      year,
      load_capacity,
      volume_capacity,
      carrier_id,
      driver_name,
      driver_phone,
      driver_license,
      registration_date,
      insurance_expiry,
      inspection_expiry,
      gps_device_id,
      current_location,
      latitude,
      longitude,
      description,
      status
    };

    const vehicle = await Vehicle.create(vehicleData);

    res.status(201).json({
      code: 201,
      message: '创建车辆成功',
      data: normalizeRow(vehicle)
    });
  } catch (error) {
    console.error('创建车辆失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建车辆失败',
      error: error.message
    });
  }
};

// 更新车辆信息
export const updateVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const {
      plate_number,
      vehicle_type,
      brand,
      model,
      color,
      year,
      load_capacity,
      volume_capacity,
      carrier_id,
      driver_name,
      driver_phone,
      driver_license,
      registration_date,
      insurance_expiry,
      inspection_expiry,
      gps_device_id,
      current_location,
      latitude,
      longitude,
      description,
      status
    } = req.body;

    // 验证必填字段
    if (!plate_number) {
      return res.status(400).json({
        code: 400,
        message: '车牌号不能为空'
      });
    }

    if (!vehicle_type) {
      return res.status(400).json({
        code: 400,
        message: '车辆类型不能为空'
      });
    }

    const vehicleData = {
      plate_number,
      vehicle_type,
      brand,
      model,
      color,
      year,
      load_capacity,
      volume_capacity,
      carrier_id,
      driver_name,
      driver_phone,
      driver_license,
      registration_date,
      insurance_expiry,
      inspection_expiry,
      gps_device_id,
      current_location,
      latitude,
      longitude,
      description,
      status
    };

    const vehicle = await Vehicle.update(vehicleId, vehicleData);

    if (!vehicle) {
      return res.status(404).json({
        code: 404,
        message: '车辆不存在'
      });
    }

    res.json({
      code: 200,
      message: '更新车辆信息成功',
      data: normalizeRow(vehicle)
    });
  } catch (error) {
    console.error('更新车辆信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新车辆信息失败',
      error: error.message
    });
  }
};

// 删除车辆
export const deleteVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    await Vehicle.delete(vehicleId);

    res.json({
      code: 200,
      message: '删除车辆成功'
    });
  } catch (error) {
    console.error('删除车辆失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '删除车辆失败',
      error: error.message
    });
  }
};

// 更新车辆状态
export const updateVehicleStatus = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        code: 400,
        message: '状态不能为空'
      });
    }

    const vehicle = await Vehicle.updateStatus(vehicleId, status);

    if (!vehicle) {
      return res.status(404).json({
        code: 404,
        message: '车辆不存在'
      });
    }

    res.json({
      code: 200,
      message: '更新车辆状态成功',
      data: normalizeRow(vehicle)
    });
  } catch (error) {
    console.error('更新车辆状态失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新车辆状态失败',
      error: error.message
    });
  }
};

// 更新车辆位置
export const updateVehicleLocation = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { current_location, latitude, longitude } = req.body;

    const locationData = {
      current_location,
      latitude,
      longitude
    };

    const vehicle = await Vehicle.updateLocation(vehicleId, locationData);

    if (!vehicle) {
      return res.status(404).json({
        code: 404,
        message: '车辆不存在'
      });
    }

    res.json({
      code: 200,
      message: '更新车辆位置成功',
      data: normalizeRow(vehicle)
    });
  } catch (error) {
    console.error('更新车辆位置失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新车辆位置失败',
      error: error.message
    });
  }
};

// 获取车辆统计信息
export const getVehicleStatistics = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const statistics = await Vehicle.getStatistics(vehicleId);

    res.json({
      code: 200,
      message: '获取车辆统计信息成功',
      data: statistics
    });
  } catch (error) {
    console.error('获取车辆统计信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取车辆统计信息失败',
      error: error.message
    });
  }
};

// 获取所有车辆位置（用于地图展示）
export const getVehicleLocations = async (req, res) => {
  try {
    const { status, carrier_id } = req.query;

    const filters = {
      status,
      carrier_id
    };

    const locations = await Vehicle.getAllLocations(filters);

    res.json({
      code: 200,
      message: '获取车辆位置成功',
      data: (locations || []).map(row => normalizeRow(row))
    });
  } catch (error) {
    console.error('获取车辆位置失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取车辆位置失败',
      error: error.message
    });
  }
};
