import Carrier from '../models/Carrier.js';
import { normalizeRow } from '../utils/encoding.js';

// 获取承运人列表
export const getCarriers = async (req, res) => {
  try {
    const { name, contact_person, status, page = 1, pageSize = 10 } = req.query;

    const filters = {
      name,
      contact_person,
      status,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    };

    const result = await Carrier.findAll(filters);

    res.json({
      code: 200,
      message: '获取承运人列表成功',
      data: (result.data || []).map(r => normalizeRow(r)),
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: Math.ceil(result.total / result.pageSize)
      }
    });
  } catch (error) {
    console.error('获取承运人列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取承运人列表失败',
      error: error.message
    });
  }
};

// 获取承运人详情
export const getCarrierById = async (req, res) => {
  try {
    const { carrierId } = req.params;

    const carrier = await Carrier.findById(carrierId);

    if (!carrier) {
      return res.status(404).json({
        code: 404,
        message: '承运人不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取承运人详情成功',
      data: normalizeRow(carrier)
    });
  } catch (error) {
    console.error('获取承运人详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取承运人详情失败',
      error: error.message
    });
  }
};

// 创建承运人
export const createCarrier = async (req, res) => {
  try {
    const {
      name,
      contact_person,
      contact_phone,
      contact_email,
      address,
      business_license,
      transport_license,
      vehicle_count,
      driver_count,
      service_area,
      description,
      status
    } = req.body;

    // 验证必填字段
    if (!name || !contact_person || !contact_phone) {
      return res.status(400).json({
        code: 400,
        message: '承运人名称、联系人和联系电话为必填项'
      });
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(contact_phone)) {
      return res.status(400).json({
        code: 400,
        message: '联系电话格式不正确'
      });
    }

    // 验证邮箱格式（如果提供）
    if (contact_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact_email)) {
        return res.status(400).json({
          code: 400,
          message: '邮箱格式不正确'
        });
      }
    }

    const carrierData = {
      name,
      contact_person,
      contact_phone,
      contact_email,
      address,
      business_license,
      transport_license,
      vehicle_count,
      driver_count,
      service_area,
      description,
      status
    };

    const carrier = await Carrier.create(carrierData);

    res.status(201).json({
      code: 201,
      message: '创建承运人成功',
      data: normalizeRow(carrier)
    });
  } catch (error) {
    console.error('创建承运人失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建承运人失败',
      error: error.message
    });
  }
};

// 更新承运人
export const updateCarrier = async (req, res) => {
  try {
    const { carrierId } = req.params;
    const {
      name,
      contact_person,
      contact_phone,
      contact_email,
      address,
      business_license,
      transport_license,
      vehicle_count,
      driver_count,
      service_area,
      description,
      status
    } = req.body;

    // 检查承运人是否存在
    const existingCarrier = await Carrier.findById(carrierId);
    if (!existingCarrier) {
      return res.status(404).json({
        code: 404,
        message: '承运人不存在'
      });
    }

    // 验证必填字段
    if (!name || !contact_person || !contact_phone) {
      return res.status(400).json({
        code: 400,
        message: '承运人名称、联系人和联系电话为必填项'
      });
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(contact_phone)) {
      return res.status(400).json({
        code: 400,
        message: '联系电话格式不正确'
      });
    }

    // 验证邮箱格式（如果提供）
    if (contact_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact_email)) {
        return res.status(400).json({
          code: 400,
          message: '邮箱格式不正确'
        });
      }
    }

    const carrierData = {
      name,
      contact_person,
      contact_phone,
      contact_email,
      address,
      business_license,
      transport_license,
      vehicle_count,
      driver_count,
      service_area,
      description,
      status
    };

    const carrier = await Carrier.update(carrierId, carrierData);

    res.json({
      code: 200,
      message: '更新承运人成功',
      data: normalizeRow(carrier)
    });
  } catch (error) {
    console.error('更新承运人失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新承运人失败',
      error: error.message
    });
  }
};

// 删除承运人
export const deleteCarrier = async (req, res) => {
  try {
    const { carrierId } = req.params;

    // 检查承运人是否存在
    const carrier = await Carrier.findById(carrierId);
    if (!carrier) {
      return res.status(404).json({
        code: 404,
        message: '承运人不存在'
      });
    }

    await Carrier.delete(carrierId);

    res.json({
      code: 200,
      message: '删除承运人成功'
    });
  } catch (error) {
    console.error('删除承运人失败:', error);
    
    if (error.message.includes('无法删除')) {
      return res.status(400).json({
        code: 400,
        message: error.message
      });
    }

    res.status(500).json({
      code: 500,
      message: '删除承运人失败',
      error: error.message
    });
  }
};

// 更新承运人状态
export const updateCarrierStatus = async (req, res) => {
  try {
    const { carrierId } = req.params;
    const { status } = req.body;

    // 验证状态值
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        code: 400,
        message: '无效的状态值'
      });
    }

    // 检查承运人是否存在
    const existingCarrier = await Carrier.findById(carrierId);
    if (!existingCarrier) {
      return res.status(404).json({
        code: 404,
        message: '承运人不存在'
      });
    }

    const carrier = await Carrier.updateStatus(carrierId, status);

    res.json({
      code: 200,
      message: '更新承运人状态成功',
      data: normalizeRow(carrier)
    });
  } catch (error) {
    console.error('更新承运人状态失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新承运人状态失败',
      error: error.message
    });
  }
};

// 获取承运人统计信息
export const getCarrierStatistics = async (req, res) => {
  try {
    const { carrierId } = req.params;

    // 检查承运人是否存在
    const carrier = await Carrier.findById(carrierId);
    if (!carrier) {
      return res.status(404).json({
        code: 404,
        message: '承运人不存在'
      });
    }

    const statistics = await Carrier.getStatistics(carrierId);

    res.json({
      code: 200,
      message: '获取承运人统计信息成功',
      data: statistics
    });
  } catch (error) {
    console.error('获取承运人统计信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取承运人统计信息失败',
      error: error.message
    });
  }
};
