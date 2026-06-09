import Tag from '../models/Tag.js';
import { Op } from 'sequelize';
import { normalizeRow } from '../utils/encoding.js';

// 获取标签列表
export const getTags = async (req, res) => {
  try {
    const { 
      page = 1, 
      pageSize = 100, 
      keyword,
      sortBy = 'usageCount',
      sortOrder = 'DESC'
    } = req.query;

    const where = {};
    
    // 关键词搜索
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const { count, rows } = await Tag.findAndCountAll({
      where,
      order: [[sortBy, sortOrder]],
      limit,
      offset
    });

    res.json({
      code: 200,
      message: '获取标签列表成功',
      data: {
        tags: rows.map(r => normalizeRow(r.get({ plain: true }))),
        total: count,
        page: parseInt(page),
        pageSize: limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('获取标签列表失败:', error);
    if (String(error.message || '').includes("doesn't exist")) {
      const size = parseInt(pageSize);
      return res.json({
        code: 200,
        message: '获取标签列表成功',
        data: {
          tags: [],
          total: 0,
          page: parseInt(page),
          pageSize: size,
          totalPages: 0
        }
      });
    }
    res.status(500).json({ code: 500, message: '获取标签列表失败', error: error.message });
  }
};

// 获取所有标签（不分页，用于标签云）
export const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.findAll({
      order: [['usageCount', 'DESC']],
      attributes: ['id', 'name', 'color', 'description', 'usageCount']
    });

    res.json({
      code: 200,
      message: '获取标签成功',
      data: tags.map(r => normalizeRow(r.get({ plain: true })))
    });
  } catch (error) {
    console.error('获取标签失败:', error);
    if (String(error.message || '').includes("doesn't exist")) {
      return res.json({
        code: 200,
        message: '获取标签成功',
        data: []
      });
    }
    res.status(500).json({ code: 500, message: '获取标签失败', error: error.message });
  }
};

// 获取单个标签详情
export const getTagById = async (req, res) => {
  try {
    const { tagId } = req.params;

    const tag = await Tag.findByPk(tagId);

    if (!tag) {
      return res.status(404).json({
        code: 404,
        message: '标签不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取标签详情成功',
      data: normalizeRow(tag.get({ plain: true }))
    });
  } catch (error) {
    console.error('获取标签详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取标签详情失败',
      error: error.message
    });
  }
};

// 创建标签
export const createTag = async (req, res) => {
  try {
    const { name, color, description } = req.body;

    // 验证必填字段
    if (!name) {
      return res.status(400).json({
        code: 400,
        message: '标签名称不能为空'
      });
    }

    // 检查标签名称是否已存在
    const existingTag = await Tag.findOne({ where: { name } });
    if (existingTag) {
      return res.status(400).json({
        code: 400,
        message: '标签名称已存在'
      });
    }

    // 创建标签
    const tag = await Tag.create({
      name,
      color: color || '#1890ff',
      description,
      createdBy: req.user?.id
    });

    res.status(201).json({
      code: 201,
      message: '创建标签成功',
      data: normalizeRow(tag.get({ plain: true }))
    });
  } catch (error) {
    console.error('创建标签失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建标签失败',
      error: error.message
    });
  }
};

// 更新标签
export const updateTag = async (req, res) => {
  try {
    const { tagId } = req.params;
    const { name, color, description } = req.body;

    const tag = await Tag.findByPk(tagId);

    if (!tag) {
      return res.status(404).json({
        code: 404,
        message: '标签不存在'
      });
    }

    // 如果修改了名称，检查新名称是否已存在
    if (name && name !== tag.name) {
      const existingTag = await Tag.findOne({ where: { name } });
      if (existingTag) {
        return res.status(400).json({
          code: 400,
          message: '标签名称已存在'
        });
      }
    }

    // 更新标签
    await tag.update({
      name: name || tag.name,
      color: color || tag.color,
      description: description !== undefined ? description : tag.description,
      updatedBy: req.user?.id
    });

    res.json({
      code: 200,
      message: '更新标签成功',
      data: normalizeRow(tag.get({ plain: true }))
    });
  } catch (error) {
    console.error('更新标签失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新标签失败',
      error: error.message
    });
  }
};

// 删除标签
export const deleteTag = async (req, res) => {
  try {
    const { tagId } = req.params;

    const tag = await Tag.findByPk(tagId);

    if (!tag) {
      return res.status(404).json({
        code: 404,
        message: '标签不存在'
      });
    }

    // 检查标签是否正在使用
    if (tag.usageCount > 0) {
      return res.status(400).json({
        code: 400,
        message: '该标签正在使用中，无法删除'
      });
    }

    await tag.destroy();

    res.json({
      code: 200,
      message: '删除标签成功'
    });
  } catch (error) {
    console.error('删除标签失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除标签失败',
      error: error.message
    });
  }
};

// 批量删除标签
export const batchDeleteTags = async (req, res) => {
  try {
    const { tagIds } = req.body;

    if (!tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供要删除的标签ID列表'
      });
    }

    // 检查是否有正在使用的标签
    const tagsInUse = await Tag.findAll({
      where: {
        id: { [Op.in]: tagIds },
        usageCount: { [Op.gt]: 0 }
      }
    });

    if (tagsInUse.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '部分标签正在使用中，无法删除',
        data: {
          tagsInUse: tagsInUse.map(tag => normalizeRow(tag.get({ plain: true }))).map(tag => ({ id: tag.id, name: tag.name }))
        }
      });
    }

    const deletedCount = await Tag.destroy({
      where: {
        id: { [Op.in]: tagIds }
      }
    });

    res.json({
      code: 200,
      message: '批量删除标签成功',
      data: {
        deletedCount
      }
    });
  } catch (error) {
    console.error('批量删除标签失败:', error);
    res.status(500).json({
      code: 500,
      message: '批量删除标签失败',
      error: error.message
    });
  }
};

// 增加标签使用次数
export const incrementUsageCount = async (req, res) => {
  try {
    const { tagId } = req.params;

    const tag = await Tag.findByPk(tagId);

    if (!tag) {
      return res.status(404).json({
        code: 404,
        message: '标签不存在'
      });
    }

    await tag.increment('usageCount');

    res.json({
      code: 200,
      message: '更新使用次数成功',
      data: {
        usageCount: tag.usageCount + 1
      }
    });
  } catch (error) {
    console.error('更新使用次数失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新使用次数失败',
      error: error.message
    });
  }
};

// 减少标签使用次数
export const decrementUsageCount = async (req, res) => {
  try {
    const { tagId } = req.params;

    const tag = await Tag.findByPk(tagId);

    if (!tag) {
      return res.status(404).json({
        code: 404,
        message: '标签不存在'
      });
    }

    if (tag.usageCount > 0) {
      await tag.decrement('usageCount');
    }

    res.json({
      code: 200,
      message: '更新使用次数成功',
      data: {
        usageCount: Math.max(0, tag.usageCount - 1)
      }
    });
  } catch (error) {
    console.error('更新使用次数失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新使用次数失败',
      error: error.message
    });
  }
};
