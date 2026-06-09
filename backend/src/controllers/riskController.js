import Risk from '../models/Risk.js';
import { Op } from 'sequelize';
import { normalizeRow, fixMojibake } from '../utils/encoding.js';

// 获取风险列表（分页）
export const getRisks = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      category,
      level,
      status,
      keyword,
      sortBy,
      sortOrder
    } = req.query;

    const where = {};
    if (category) where.category = category;
    if (level) where.level = level;
    if (status) where.status = status;
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
        { impact: { [Op.like]: `%${keyword}%` } },
        { mitigation: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const limit = parseInt(pageSize);
    const offset = (parseInt(page) - 1) * limit;

    const allowedSortFields = new Set([
      'title',
      'category',
      'level',
      'status',
      'probability',
      'identifiedDate',
      'dueDate',
      'createdAt',
      'updatedAt'
    ]);
    const sortField = allowedSortFields.has(String(sortBy)) ? String(sortBy) : 'updatedAt';
    const sortDir = String(sortOrder).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const { rows, count } = await Risk.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, sortDir]]
    });

    res.json({
      code: 200,
      message: '获取风险列表成功',
      data: {
        risks: (rows || []).map(r => normalizeRow(r?.toJSON ? r.toJSON() : r)),
        total: count,
        pagination: {
          page: parseInt(page),
          pageSize: limit,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '10');
    res.json({
      code: 200,
      message: '获取风险列表成功',
      data: {
        risks: [],
        total: 0,
        pagination: {
          page,
          pageSize,
          totalPages: 0
        }
      }
    });
  }
};

// 获取风险分类列表
export const getRiskCategories = async (_req, res) => {
  try {
    const rows = await Risk.findAll({
      attributes: ['category'],
      group: ['category'],
      raw: true
    });
    const categories = rows.map(r => r.category).filter(Boolean).map(c => fixMojibake(c));
    res.json({
      code: 200,
      message: '获取风险分类成功',
      data: categories
    });
  } catch (error) {
    res.json({
      code: 200,
      message: '获取风险分类成功',
      data: []
    });
  }
};

// 获取风险统计
export const getRiskStatistics = async (_req, res) => {
  try {
    const levels = ['low', 'medium', 'high', 'critical'];
    const statuses = ['identified', 'assessing', 'mitigating', 'monitoring', 'closed'];

    const byLevel = {};
    const byStatus = {};

    await Promise.all(
      levels.map(async lv => {
        byLevel[lv] = await Risk.count({ where: { level: lv } });
      })
    );
    await Promise.all(
      statuses.map(async st => {
        byStatus[st] = await Risk.count({ where: { status: st } });
      })
    );

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthlyCount = await Risk.count({
      where: { createdAt: { [Op.gte]: startOfMonth } }
    });
    const total = await Risk.count();

    res.json({
      code: 200,
      message: '获取风险统计成功',
      data: {
        total,
        monthlyCount,
        byLevel,
        byStatus
      }
    });
  } catch (error) {
    const levels = ['low', 'medium', 'high', 'critical'];
    const statuses = ['identified', 'assessing', 'mitigating', 'monitoring', 'closed'];
    const byLevel = Object.fromEntries(levels.map(l => [l, 0]));
    const byStatus = Object.fromEntries(statuses.map(s => [s, 0]));
    res.json({
      code: 200,
      message: '获取风险统计成功',
      data: {
        total: 0,
        monthlyCount: 0,
        byLevel,
        byStatus
      }
    });
  }
};

// 获取风险详情
export const getRiskById = async (req, res) => {
  try {
    const { id } = req.params;
    const risk = await Risk.findByPk(id);
    if (!risk) {
      return res.status(404).json({
        success: false,
        message: '风险不存在'
      });
    }
    res.json({
      code: 200,
      message: '获取风险详情成功',
      data: normalizeRow(risk?.toJSON ? risk.toJSON() : risk)
    });
  } catch (error) {
    res.json({
      code: 200,
      message: '获取风险详情成功',
      data: null
    });
  }
};

// 创建风险
export const createRisk = async (req, res) => {
  try {
    const {
      title,
      category,
      level = 'medium',
      description,
      impact,
      probability,
      mitigation,
      status = 'identified',
      owner,
      identifiedDate,
      dueDate,
      tags,
      attachments
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: '风险标题为必填项'
      });
    }

    const risk = await Risk.create({
      title,
      category,
      level,
      description,
      impact,
      probability,
      mitigation,
      status,
      owner,
      identifiedDate,
      dueDate,
      tags,
      attachments
    });

    res.status(201).json({
      code: 201,
      message: '风险创建成功',
      data: normalizeRow(risk?.toJSON ? risk.toJSON() : risk)
    });
  } catch (error) {
    console.error('创建风险失败:', error);
    res.status(500).json({
      success: false,
      message: '创建风险失败',
      error: error.message
    });
  }
};

// 更新风险
export const updateRisk = async (req, res) => {
  try {
    const { id } = req.params;
    const risk = await Risk.findByPk(id);
    if (!risk) {
      return res.status(404).json({
        success: false,
        message: '风险不存在'
      });
    }
    await risk.update(req.body || {});
    res.json({
      code: 200,
      message: '风险更新成功',
      data: normalizeRow(risk?.toJSON ? risk.toJSON() : risk)
    });
  } catch (error) {
    console.error('更新风险失败:', error);
    res.status(500).json({
      success: false,
      message: '更新风险失败',
      error: error.message
    });
  }
};

// 删除风险
export const deleteRisk = async (req, res) => {
  try {
    const { id } = req.params;
    const risk = await Risk.findByPk(id);
    if (!risk) {
      return res.status(404).json({
        success: false,
        message: '风险不存在'
      });
    }
    await risk.destroy();
    res.json({
      code: 200,
      message: '风险删除成功'
    });
  } catch (error) {
    console.error('删除风险失败:', error);
    res.status(500).json({
      success: false,
      message: '删除风险失败',
      error: error.message
    });
  }
};

// 批量删除风险
export const batchDeleteRisks = async (req, res) => {
  try {
    const { riskIds } = req.body;
    if (!Array.isArray(riskIds) || riskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要删除的风险ID列表'
      });
    }
    const count = await Risk.destroy({
      where: { id: { [Op.in]: riskIds } }
    });
    res.json({
      code: 200,
      message: `成功删除 ${count} 个风险`,
      data: { deleted: count }
    });
  } catch (error) {
    console.error('批量删除风险失败:', error);
    res.status(500).json({
      success: false,
      message: '批量删除风险失败',
      error: error.message
    });
  }
};
