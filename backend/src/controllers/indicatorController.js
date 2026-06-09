import Indicator from '../models/Indicator.js';
import { Op } from 'sequelize';

// 获取指标列表（分页）
export const getIndicators = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      name,
      code,
      category,
      status,
      frequency,
      sortBy,
      sortOrder
    } = req.query;

    const where = {};
    if (keyword) {
      const kw = String(keyword).trim();
      if (kw) {
        where[Op.or] = [
          { name: { [Op.like]: `%${kw}%` } },
          { code: { [Op.like]: `%${kw}%` } },
          { description: { [Op.like]: `%${kw}%` } },
          { dataSource: { [Op.like]: `%${kw}%` } }
        ];
      }
    }
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (code) where.code = { [Op.like]: `%${code}%` };
    if (category) where.category = category;
    if (status) where.status = status;
    if (frequency) where.frequency = frequency;

    const limit = parseInt(pageSize);
    const offset = (parseInt(page) - 1) * limit;

    const allowedSortFields = new Set([
      'name',
      'code',
      'category',
      'status',
      'frequency',
      'targetValue',
      'createdAt',
      'updatedAt'
    ]);
    const sortField = allowedSortFields.has(String(sortBy)) ? String(sortBy) : 'updatedAt';
    const sortDir = String(sortOrder).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const { rows, count } = await Indicator.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortField, sortDir]]
    });

    res.json({
      code: 200,
      message: '获取指标列表成功',
      data: {
        indicators: rows,
        total: count,
        pagination: {
          page: parseInt(page),
          pageSize: limit,
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取指标列表失败:', error);
    if (String(error.message || '').includes("doesn't exist")) {
      return res.json({
        code: 200,
        message: '获取指标列表成功',
        data: {
          indicators: [],
          total: 0,
          pagination: {
            page: parseInt(req.query?.page || 1),
            pageSize: parseInt(req.query?.pageSize || 10),
            totalPages: 0
          }
        }
      });
    }
    res.status(500).json({ success: false, message: '获取指标列表失败', error: error.message });
  }
};

// 获取所有指标（不分页）
export const getAllIndicators = async (req, res) => {
  try {
    const { category, status = 'active' } = req.query;
    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;

    const rows = await Indicator.findAll({
      where,
      order: [['name', 'ASC']]
    });

    res.json({
      code: 200,
      message: '获取所有指标成功',
      data: rows
    });
  } catch (error) {
    console.error('获取所有指标失败:', error);
    if (String(error.message || '').includes("doesn't exist")) {
      return res.json({
        code: 200,
        message: '获取所有指标成功',
        data: []
      });
    }
    res.status(500).json({ success: false, message: '获取所有指标失败', error: error.message });
  }
};

// 获取指标分类列表
export const getIndicatorCategories = async (_req, res) => {
  try {
    const rows = await Indicator.findAll({
      attributes: ['category'],
      group: ['category'],
      raw: true
    });
    const categories = rows.map(r => r.category).filter(Boolean);
    res.json({
      code: 200,
      message: '获取指标分类成功',
      data: categories
    });
  } catch (error) {
    console.error('获取指标分类失败:', error);
    if (String(error.message || '').includes("doesn't exist")) {
      return res.json({
        code: 200,
        message: '获取指标分类成功',
        data: []
      });
    }
    res.status(500).json({ success: false, message: '获取指标分类失败', error: error.message });
  }
};

// 获取指标详情
export const getIndicatorById = async (req, res) => {
  try {
    const { id } = req.params;
    const indicator = await Indicator.findByPk(id);
    if (!indicator) {
      return res.status(404).json({
        success: false,
        message: '指标不存在'
      });
    }
    res.json({
      code: 200,
      message: '获取指标详情成功',
      data: indicator
    });
  } catch (error) {
    console.error('获取指标详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取指标详情失败',
      error: error.message
    });
  }
};

// 创建指标
export const createIndicator = async (req, res) => {
  try {
    const {
      name,
      code,
      category,
      unit,
      description,
      formula,
      dataSource,
      frequency = 'monthly',
      targetValue,
      status = 'active'
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: '指标名称与编码为必填项'
      });
    }

    const exists = await Indicator.findOne({ where: { code } });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: '该指标编码已存在'
      });
    }

    const indicator = await Indicator.create({
      name,
      code,
      category,
      unit,
      description,
      formula,
      dataSource,
      frequency,
      targetValue,
      status
    });

    res.status(201).json({
      code: 201,
      message: '指标创建成功',
      data: indicator
    });
  } catch (error) {
    console.error('创建指标失败:', error);
    res.status(500).json({
      success: false,
      message: '指标创建失败',
      error: error.message
    });
  }
};

// 更新指标
export const updateIndicator = async (req, res) => {
  try {
    const { id } = req.params;
    const indicator = await Indicator.findByPk(id);
    if (!indicator) {
      return res.status(404).json({
        success: false,
        message: '指标不存在'
      });
    }
    const payload = req.body || {};
    if (payload.code) {
      const other = await Indicator.findOne({ where: { code: payload.code } });
      if (other && other.id !== indicator.id) {
        return res.status(400).json({
          success: false,
          message: '该指标编码已被其他指标使用'
        });
      }
    }
    await indicator.update(payload);
    res.json({
      code: 200,
      message: '指标更新成功',
      data: indicator
    });
  } catch (error) {
    console.error('更新指标失败:', error);
    res.status(500).json({
      success: false,
      message: '指标更新失败',
      error: error.message
    });
  }
};

// 删除指标
export const deleteIndicator = async (req, res) => {
  try {
    const { id } = req.params;
    const indicator = await Indicator.findByPk(id);
    if (!indicator) {
      return res.status(404).json({
        success: false,
        message: '指标不存在'
      });
    }
    await indicator.destroy();
    res.json({
      code: 200,
      message: '指标删除成功'
    });
  } catch (error) {
    console.error('删除指标失败:', error);
    res.status(500).json({
      success: false,
      message: '删除指标失败',
      error: error.message
    });
  }
};

// 批量删除指标
export const batchDeleteIndicators = async (req, res) => {
  try {
    const { indicatorIds } = req.body;
    if (!Array.isArray(indicatorIds) || indicatorIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要删除的指标ID列表'
      });
    }
    const count = await Indicator.destroy({
      where: { id: { [Op.in]: indicatorIds } }
    });
    res.json({
      code: 200,
      message: `成功删除 ${count} 个指标`,
      data: { deleted: count }
    });
  } catch (error) {
    console.error('批量删除指标失败:', error);
    res.status(500).json({
      success: false,
      message: '批量删除指标失败',
      error: error.message
    });
  }
};
