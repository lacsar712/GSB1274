import RegulationBusiness from '../models/RegulationBusiness.js';
import { normalizeRow } from '../utils/encoding.js';

/**
 * 获取业务列表
 */
export const getBusinesses = async (req, res) => {
  try {
    const filters = {
      company_id: req.query.company_id,
      business_type: req.query.business_type,
      status: req.query.status,
      search: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const businesses = await RegulationBusiness.getAll(filters);
    const normalized = (businesses || []).map(b => normalizeRow(b));
    
    res.json({
      success: true,
      data: normalized,
      pagination: {
        limit: filters.limit,
        offset: filters.offset
      }
    });
  } catch (error) {
    console.error('获取业务列表失败:', error);
    res.json({
      success: true,
      data: [],
      pagination: {
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      }
    });
  }
};

/**
 * 获取业务详情
 */
export const getBusinessById = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await RegulationBusiness.getById(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: '业务不存在'
      });
    }

    res.json({
      success: true,
      data: normalizeRow(business)
    });
  } catch (error) {
    console.error('获取业务详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取业务详情失败',
      error: error.message
    });
  }
};

/**
 * 创建业务
 */
export const createBusiness = async (req, res) => {
  try {
    const businessData = {
      ...req.body,
      created_by: req.user?.id || 1 // 从认证中间件获取用户ID
    };

    const business = await RegulationBusiness.create(businessData);

    res.status(201).json({
      success: true,
      message: '业务创建成功',
      data: normalizeRow(business)
    });
  } catch (error) {
    console.error('创建业务失败:', error);
    res.status(500).json({
      success: false,
      message: '创建业务失败',
      error: error.message
    });
  }
};

/**
 * 更新业务
 */
export const updateBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await RegulationBusiness.update(businessId, req.body);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: '业务不存在'
      });
    }

    res.json({
      success: true,
      message: '业务更新成功',
      data: normalizeRow(business)
    });
  } catch (error) {
    console.error('更新业务失败:', error);
    res.status(500).json({
      success: false,
      message: '更新业务失败',
      error: error.message
    });
  }
};

/**
 * 删除业务
 */
export const deleteBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await RegulationBusiness.delete(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: '业务不存在'
      });
    }

    res.json({
      success: true,
      message: '业务删除成功'
    });
  } catch (error) {
    console.error('删除业务失败:', error);
    res.status(500).json({
      success: false,
      message: '删除业务失败',
      error: error.message
    });
  }
};

/**
 * 获取业务统计
 */
export const getBusinessStatistics = async (req, res) => {
  try {
    const filters = {
      company_id: req.query.company_id
    };

    const statistics = await RegulationBusiness.getStatistics(filters);

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('获取业务统计失败:', error);
    res.json({
      success: true,
      data: {
        total_businesses: 0,
        active_businesses: 0,
        high_risk_businesses: 0
      }
    });
  }
};
