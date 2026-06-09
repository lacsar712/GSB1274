import Driver from '../models/Driver.js';
import { Op } from 'sequelize';
import { normalizeRow } from '../utils/encoding.js';
import pool from '../config/database.js';

let DRIVER_COLS = {
  name: null,
  phone: null,
  id_card: null,
  license_number: null,
  license_type: null,
  license_issue_date: null,
  license_expiry_date: null,
  qualification_number: null,
  qualification_expiry_date: null,
  gender: null,
  birth_date: null,
  address: null,
  emergency_contact: null,
  emergency_phone: null,
  company_id: null,
  status: null,
  hire_date: null,
  remarks: null,
  avatar: null,
  driving_years: null,
  created_at: null,
  updated_at: null
};

const ensureDriverColumns = async () => {
  const keys = Object.keys(DRIVER_COLS);
  const needCheck = keys.filter(k => DRIVER_COLS[k] === null);
  if (needCheck.length === 0) return DRIVER_COLS;
  try {
    const [rows] = await pool.execute(`SHOW COLUMNS FROM drivers`);
    const set = new Set((rows || []).map(r => r.Field));
    for (const k of needCheck) {
      DRIVER_COLS[k] = set.has(k);
    }
  } catch (e) {
    for (const k of needCheck) {
      DRIVER_COLS[k] = false;
    }
  }
  return DRIVER_COLS;
};

// 获取驾驶员列表
export const getDrivers = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      status,
      companyId,
      licenseType
    } = req.query;

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    // 构建查询条件
    const where = {};

    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
        { idCard: { [Op.like]: `%${keyword}%` } },
        { licenseNumber: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (licenseType) {
      where.licenseType = licenseType;
    }

    await ensureDriverColumns();
    const attrMap = {
      id: 'id',
      name: 'name',
      phone: 'phone',
      idCard: 'id_card',
      licenseNumber: 'license_number',
      licenseType: 'license_type',
      licenseIssueDate: 'license_issue_date',
      licenseExpiryDate: 'license_expiry_date',
      qualificationNumber: 'qualification_number',
      qualificationExpiryDate: 'qualification_expiry_date',
      gender: 'gender',
      birthDate: 'birth_date',
      address: 'address',
      emergencyContact: 'emergency_contact',
      emergencyPhone: 'emergency_phone',
      companyId: 'company_id',
      status: 'status',
      hireDate: 'hire_date',
      remarks: 'remarks',
      avatar: 'avatar',
      drivingYears: 'driving_years',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    };
    const attrs = Object.entries(attrMap)
      .filter(([_, col]) => col === 'id' || DRIVER_COLS[col])
      .map(([attr]) => attr);
    const orderField = DRIVER_COLS.created_at ? 'createdAt' : 'id';
    const exists = (col) => DRIVER_COLS[col];
    if (keyword) {
      const ors = [
        { name: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
      if (exists('id_card')) ors.push({ idCard: { [Op.like]: `%${keyword}%` } });
      if (exists('license_number')) ors.push({ licenseNumber: { [Op.like]: `%${keyword}%` } });
      where[Op.or] = ors;
    }
    if (status && exists('status')) where.status = status;
    if (companyId && exists('company_id')) where.companyId = companyId;
    if (licenseType && exists('license_type')) where.licenseType = licenseType;
    const { count, rows } = await Driver.findAndCountAll({
      where,
      offset,
      limit,
      order: [[orderField, 'DESC']],
      attributes: attrs
    });

    res.json({
      code: 200,
      message: '获取驾驶员列表成功',
      data: {
        list: rows.map(r => normalizeRow(r.get({ plain: true }))),
        total: count,
        page: parseInt(page),
        pageSize: limit
      }
    });
  } catch (error) {
    console.error('获取驾驶员列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取驾驶员列表失败',
      error: error.message
    });
  }
};

// 获取驾驶员详情
export const getDriverById = async (req, res) => {
  try {
    const { driverId } = req.params;

    await ensureDriverColumns();
    const attrMap = {
      id: 'id',
      name: 'name',
      phone: 'phone',
      idCard: 'id_card',
      licenseNumber: 'license_number',
      licenseType: 'license_type',
      licenseIssueDate: 'license_issue_date',
      licenseExpiryDate: 'license_expiry_date',
      qualificationNumber: 'qualification_number',
      qualificationExpiryDate: 'qualification_expiry_date',
      gender: 'gender',
      birthDate: 'birth_date',
      address: 'address',
      emergencyContact: 'emergency_contact',
      emergencyPhone: 'emergency_phone',
      companyId: 'company_id',
      status: 'status',
      hireDate: 'hire_date',
      remarks: 'remarks',
      avatar: 'avatar',
      drivingYears: 'driving_years',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    };
    const attrs = Object.entries(attrMap)
      .filter(([_, col]) => col === 'id' || DRIVER_COLS[col])
      .map(([attr]) => attr);
    const driver = await Driver.findByPk(driverId, { attributes: attrs });

    if (!driver) {
      return res.status(404).json({
        code: 404,
        message: '驾驶员不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取驾驶员详情成功',
      data: normalizeRow(driver.get({ plain: true }))
    });
  } catch (error) {
    console.error('获取驾驶员详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取驾驶员详情失败',
      error: error.message
    });
  }
};

// 创建驾驶员
export const createDriver = async (req, res) => {
  try {
    const {
      name,
      phone,
      idCard,
      licenseNumber,
      licenseType,
      licenseIssueDate,
      licenseExpiryDate,
      qualificationNumber,
      qualificationExpiryDate,
      gender,
      birthDate,
      address,
      emergencyContact,
      emergencyPhone,
      companyId,
      status,
      hireDate,
      remarks,
      avatar,
      drivingYears
    } = req.body;

    // 验证必填字段
    if (!name || !phone || !idCard || !licenseNumber || !licenseType) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段'
      });
    }

    // 检查手机号是否已存在
    const existingPhone = await Driver.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({
        code: 400,
        message: '该手机号已被使用'
      });
    }

    // 检查身份证号是否已存在
    const existingIdCard = await Driver.findOne({ where: { idCard } });
    if (existingIdCard) {
      return res.status(400).json({
        code: 400,
        message: '该身份证号已被使用'
      });
    }

    // 检查驾驶证号是否已存在
    const existingLicense = await Driver.findOne({ where: { licenseNumber } });
    if (existingLicense) {
      return res.status(400).json({
        code: 400,
        message: '该驾驶证号已被使用'
      });
    }

    // 创建驾驶员
    const driver = await Driver.create({
      name,
      phone,
      idCard,
      licenseNumber,
      licenseType,
      licenseIssueDate,
      licenseExpiryDate,
      qualificationNumber,
      qualificationExpiryDate,
      gender,
      birthDate,
      address,
      emergencyContact,
      emergencyPhone,
      companyId,
      status: status || 'active',
      hireDate,
      remarks,
      avatar,
      drivingYears,
      createdBy: req.user?.id
    });

    res.status(201).json({
      code: 201,
      message: '创建驾驶员成功',
      data: normalizeRow(driver.get({ plain: true }))
    });
  } catch (error) {
    console.error('创建驾驶员失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建驾驶员失败',
      error: error.message
    });
  }
};

// 更新驾驶员
export const updateDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const {
      name,
      phone,
      idCard,
      licenseNumber,
      licenseType,
      licenseIssueDate,
      licenseExpiryDate,
      qualificationNumber,
      qualificationExpiryDate,
      gender,
      birthDate,
      address,
      emergencyContact,
      emergencyPhone,
      companyId,
      status,
      hireDate,
      remarks,
      avatar,
      drivingYears
    } = req.body;

    const driver = await Driver.findByPk(driverId);

    if (!driver) {
      return res.status(404).json({
        code: 404,
        message: '驾驶员不存在'
      });
    }

    // 如果更新手机号，检查是否已被其他驾驶员使用
    if (phone && phone !== driver.phone) {
      const existingPhone = await Driver.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(400).json({
          code: 400,
          message: '该手机号已被使用'
        });
      }
    }

    // 如果更新身份证号，检查是否已被其他驾驶员使用
    if (idCard && idCard !== driver.idCard) {
      const existingIdCard = await Driver.findOne({ where: { idCard } });
      if (existingIdCard) {
        return res.status(400).json({
          code: 400,
          message: '该身份证号已被使用'
        });
      }
    }

    // 如果更新驾驶证号，检查是否已被其他驾驶员使用
    if (licenseNumber && licenseNumber !== driver.licenseNumber) {
      const existingLicense = await Driver.findOne({ where: { licenseNumber } });
      if (existingLicense) {
        return res.status(400).json({
          code: 400,
          message: '该驾驶证号已被使用'
        });
      }
    }

    // 更新驾驶员信息
    await driver.update({
      name,
      phone,
      idCard,
      licenseNumber,
      licenseType,
      licenseIssueDate,
      licenseExpiryDate,
      qualificationNumber,
      qualificationExpiryDate,
      gender,
      birthDate,
      address,
      emergencyContact,
      emergencyPhone,
      companyId,
      status,
      hireDate,
      remarks,
      avatar,
      drivingYears,
      updatedBy: req.user?.id
    });

    res.json({
      code: 200,
      message: '更新驾驶员成功',
      data: normalizeRow(driver.get({ plain: true }))
    });
  } catch (error) {
    console.error('更新驾驶员失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新驾驶员失败',
      error: error.message
    });
  }
};

// 删除驾驶员
export const deleteDriver = async (req, res) => {
  try {
    const { driverId } = req.params;

    const driver = await Driver.findByPk(driverId);

    if (!driver) {
      return res.status(404).json({
        code: 404,
        message: '驾驶员不存在'
      });
    }

    await driver.destroy();

    res.json({
      code: 200,
      message: '删除驾驶员成功'
    });
  } catch (error) {
    console.error('删除驾驶员失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除驾驶员失败',
      error: error.message
    });
  }
};

// 批量删除驾驶员
export const batchDeleteDrivers = async (req, res) => {
  try {
    const { driverIds } = req.body;

    if (!driverIds || !Array.isArray(driverIds) || driverIds.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供要删除的驾驶员ID列表'
      });
    }

    await Driver.destroy({
      where: {
        id: {
          [Op.in]: driverIds
        }
      }
    });

    res.json({
      code: 200,
      message: '批量删除驾驶员成功'
    });
  } catch (error) {
    console.error('批量删除驾驶员失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量删除驾驶员失败',
      error: error.message
    });
  }
};

// 更新驾驶员状态
export const updateDriverStatus = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        code: 400,
        message: '无效的状态值'
      });
    }

    const driver = await Driver.findByPk(driverId);

    if (!driver) {
      return res.status(404).json({
        code: 404,
        message: '驾驶员不存在'
      });
    }

    await driver.update({
      status,
      updatedBy: req.user?.id
    });

    res.json({
      code: 200,
      message: '更新驾驶员状态成功',
      data: normalizeRow(driver.get({ plain: true }))
    });
  } catch (error) {
    console.error('更新驾驶员状态失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新驾驶员状态失败',
      error: error.message
    });
  }
};

// 获取驾驶员统计信息
export const getDriverStatistics = async (req, res) => {
  try {
    const { companyId } = req.query;
    await ensureDriverColumns();
    const where = {};
    if (companyId && DRIVER_COLS.company_id) {
      where.companyId = companyId;
    }
    const total = await Driver.count({ where });
    let active = 0, inactive = 0, suspended = 0;
    if (DRIVER_COLS.status) {
      active = await Driver.count({ where: { ...where, status: 'active' } });
      inactive = await Driver.count({ where: { ...where, status: 'inactive' } });
      suspended = await Driver.count({ where: { ...where, status: 'suspended' } });
    }
    let licenseTypes = [];
    if (DRIVER_COLS.license_type) {
      const rows = await Driver.findAll({
        where,
        attributes: [
          'licenseType',
          [Driver.sequelize.fn('COUNT', Driver.sequelize.col('id')), 'count']
        ],
        group: ['licenseType'],
        raw: true
      });
      licenseTypes = rows.map(item => ({
        type: item.licenseType,
        count: parseInt(item.count)
      }));
    }

    res.json({
      code: 200,
      message: '获取驾驶员统计信息成功',
      data: {
        total,
        active,
        inactive,
        suspended,
        licenseTypes
      }
    });
  } catch (error) {
    console.error('获取驾驶员统计信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取驾驶员统计信息失败',
      error: error.message
    });
  }
};
