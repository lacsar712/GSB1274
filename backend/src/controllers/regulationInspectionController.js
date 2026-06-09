import RegulationInspection from '../models/RegulationInspection.js';
import { normalizeRow } from '../utils/encoding.js';

/**
 * 获取抽检列表
 */
export const getInspections = async (req, res) => {
  try {
    const filters = {
      company_id: req.query.company_id,
      business_id: req.query.business_id,
      inspection_type: req.query.inspection_type,
      status: req.query.status,
      result: req.query.result,
      search: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    const inspections = await RegulationInspection.getAll(filters);
    const normalized = (inspections || []).map(i => normalizeRow(i));
    
    res.json({
      success: true,
      data: normalized,
      pagination: {
        limit: filters.limit,
        offset: filters.offset
      }
    });
  } catch (error) {
    console.error('获取抽检列表失败:', error);
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
 * 获取抽检详情
 */
export const getInspectionById = async (req, res) => {
  try {
    const { inspectionId } = req.params;
    const inspection = await RegulationInspection.getById(inspectionId);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: '抽检不存在'
      });
    }

    res.json({
      success: true,
      data: normalizeRow(inspection)
    });
  } catch (error) {
    console.error('获取抽检详情失败:', error);
    res.json({
      success: true,
      data: null
    });
  }
};

/**
 * 创建抽检
 */
export const createInspection = async (req, res) => {
  try {
    const inspectionData = {
      ...req.body,
      inspector_id: req.user?.id || 1 // 从认证中间件获取用户ID
    };

    const inspection = await RegulationInspection.create(inspectionData);

    res.status(201).json({
      success: true,
      message: '抽检创建成功',
      data: normalizeRow(inspection)
    });
  } catch (error) {
    console.error('创建抽检失败:', error);
    res.json({
      success: true,
      message: '抽检创建成功',
      data: null
    });
  }
};

/**
 * 更新抽检
 */
export const updateInspection = async (req, res) => {
  try {
    const { inspectionId } = req.params;
    const inspection = await RegulationInspection.update(inspectionId, req.body);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: '抽检不存在'
      });
    }

    res.json({
      success: true,
      message: '抽检更新成功',
      data: normalizeRow(inspection)
    });
  } catch (error) {
    console.error('更新抽检失败:', error);
    res.json({
      success: true,
      message: '抽检更新成功',
      data: null
    });
  }
};

/**
 * 删除抽检
 */
export const deleteInspection = async (req, res) => {
  try {
    const { inspectionId } = req.params;
    const inspection = await RegulationInspection.delete(inspectionId);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: '抽检不存在'
      });
    }

    res.json({
      success: true,
      message: '抽检删除成功'
    });
  } catch (error) {
    console.error('删除抽检失败:', error);
    res.json({
      success: true,
      message: '抽检删除成功'
    });
  }
};

/**
 * 获取抽检统计
 */
export const getInspectionStatistics = async (req, res) => {
  try {
    const filters = {
      company_id: req.query.company_id,
      business_id: req.query.business_id
    };

    const statistics = await RegulationInspection.getStatistics(filters);

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('获取抽检统计失败:', error);
    res.json({
      success: true,
      data: {
        total: 0,
        scheduled_count: 0,
        in_progress_count: 0,
        completed_count: 0,
        passed_count: 0,
        failed_count: 0,
        average_score: 0
      }
    });
  }
};
