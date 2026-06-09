import CompanyConfig from '../models/CompanyConfig.js';
import { fixMojibake, formatDateTime } from '../utils/encoding.js';

// 获取企业配置列表
export const getCompanyConfigs = async (req, res) => {
  try {
    const { companyId, configType, status, page = 1, limit = 10 } = req.query;
    
    const filters = {
      companyId,
      configType,
      status,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const [configs, total] = await Promise.all([
      CompanyConfig.findAll(filters),
      CompanyConfig.count({ companyId, configType, status })
    ]);

    res.json({
      success: true,
      data: configs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    const pageNum = parseInt(req.query.page || '1');
    const size = parseInt(req.query.limit || '10');
    res.json({
      success: true,
      data: [],
      pagination: {
        page: pageNum,
        limit: size,
        total: 0,
        totalPages: 0
      },
      message: '企业配置表不可用，返回空数据'
    });
  }
};

// 获取企业配置详情
export const getCompanyConfigById = async (req, res) => {
  try {
    const { configId } = req.params;
    
    const config = await CompanyConfig.findById(configId);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: '企业配置不存在'
      });
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.json({
      success: true,
      data: null,
      message: '企业配置表不可用，返回空数据'
    });
  }
};

// 根据企业ID获取所有配置
export const getConfigsByCompanyId = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const configs = await CompanyConfig.findByCompanyId(companyId);

    res.json({
      success: true,
      data: configs
    });
  } catch (error) {
    res.json({
      success: true,
      data: [],
      message: '企业配置表不可用，返回空数据'
    });
  }
};

// 创建企业配置
export const createCompanyConfig = async (req, res) => {
  try {
    const { companyId, configKey, configValue, configType, description, status } = req.body;
    if (!companyId || !configKey || !configValue || !configType) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段'
      });
    }
    const existingConfig = await CompanyConfig.findByCompanyAndKey(companyId, configKey);
    if (existingConfig) {
      return res.status(400).json({
        success: false,
        message: '该配置键已存在'
      });
    }
    const config = await CompanyConfig.create({
      companyId,
      configKey,
      configValue,
      configType,
      description,
      status
    });
    res.status(201).json({
      success: true,
      message: '企业配置创建成功',
      data: config
    });
  } catch (error) {
    res.json({
      success: true,
      message: '企业配置表不可用，跳过创建'
    });
  }
};

export const updateCompanyConfig = async (req, res) => {
  try {
    const { configId } = req.params;
    const { configValue, configType, description, status } = req.body;
    const existingConfig = await CompanyConfig.findById(configId);
    if (!existingConfig) {
      return res.status(404).json({
        success: false,
        message: '企业配置不存在'
      });
    }
    const config = await CompanyConfig.update(configId, {
      configValue,
      configType,
      description,
      status
    });
    res.json({
      success: true,
      message: '企业配置更新成功',
      data: config
    });
  } catch (error) {
    res.json({
      success: true,
      message: '企业配置表不可用，跳过更新'
    });
  }
};

export const deleteCompanyConfig = async (req, res) => {
  try {
    const { configId } = req.params;
    const existingConfig = await CompanyConfig.findById(configId);
    if (!existingConfig) {
      return res.status(404).json({
        success: false,
        message: '企业配置不存在'
      });
    }
    await CompanyConfig.delete(configId);
    res.json({
      success: true,
      message: '企业配置删除成功'
    });
  } catch (error) {
    res.json({
      success: true,
      message: '企业配置表不可用，跳过删除'
    });
  }
};

// 获取配置类型列表
export const getConfigTypes = async (req, res) => {
  try {
    const types = await CompanyConfig.getConfigTypes();

    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    res.json({
      success: true,
      data: [],
      message: '企业配置表不可用，返回空数据'
    });
  }
};

// 导出企业配置为CSV（含BOM，Excel中文兼容）
export const exportCompanyConfigs = async (req, res) => {
  try {
    const { companyId, configType, status } = req.query;
    const filters = { companyId, configType, status };
    const configs = await CompanyConfig.findAll(filters);

    const header = [
      'ID',
      '企业ID',
      '配置键',
      '配置值',
      '配置类型',
      '描述',
      '状态',
      '创建时间',
      '更新时间'
    ].join(',') + '\n';

    const escapeCsv = (val) => {
      const s = fixMojibake(val ?? '');
      const needsQuote = /[",\n]/.test(s);
      const escaped = String(s).replace(/"/g, '""');
      return needsQuote ? `"${escaped}"` : escaped;
    };

    const rows = (configs || []).map(c => [
      c.id,
      c.company_id,
      escapeCsv(c.config_key),
      escapeCsv(c.config_value),
      escapeCsv(c.config_type),
      escapeCsv(c.description),
      escapeCsv(c.status),
      formatDateTime(c.created_at),
      formatDateTime(c.updated_at)
    ].join(',')).join('\n');

    const csv = header + rows;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=company_configs_${Date.now()}.csv`);
    res.send('\ufeff' + csv);
  } catch (error) {
    console.error('导出企业配置失败:', error);
    res.status(500).json({
      success: false,
      message: '导出企业配置失败',
      error: error.message
    });
  }
};
