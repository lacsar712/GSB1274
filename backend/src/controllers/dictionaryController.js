import Dictionary from '../models/Dictionary.js';
import { validationResult } from 'express-validator';
import { normalizeRow, fixMojibake } from '../utils/encoding.js';

class DictionaryController {
  // 获取字典列表
  static async getList(req, res) {
    try {
      const {
        page = 1,
        pageSize = 10,
        type,
        code,
        name,
        status
      } = req.query;

      const result = await Dictionary.getList({
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        type,
        code,
        name,
        status
      });

      res.json({
        success: true,
        data: {
          dictionaries: (result.dictionaries || []).map(d => normalizeRow(d)),
          total: result.total,
          page: result.page,
          pageSize: result.pageSize
        }
      });
    } catch (error) {
      console.error('获取字典列表失败:', error);
      if (String(error.message || '').includes("doesn't exist")) {
        return res.json({
          success: true,
          data: {
            dictionaries: [],
            total: 0,
            page: parseInt(req.query?.page || 1),
            pageSize: parseInt(req.query?.pageSize || 10)
          }
        });
      }
      res.status(500).json({ success: false, message: '获取字典列表失败', error: error.message });
    }
  }

  // 根据ID获取字典详情
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const dictionary = await Dictionary.findById(id);
      if (!dictionary) {
        return res.status(404).json({
          success: false,
          message: '字典不存在'
        });
      }

      res.json({
        success: true,
        data: normalizeRow(dictionary)
      });
    } catch (error) {
      console.error('获取字典详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取字典详情失败',
        error: error.message
      });
    }
  }

  // 根据类型获取字典列表
  static async getByType(req, res) {
    try {
      const { type } = req.params;

      const dictionaries = await Dictionary.findByType(type);

      res.json({
        success: true,
        data: (dictionaries || []).map(d => normalizeRow(d))
      });
    } catch (error) {
      console.error('获取字典列表失败:', error);
      if (String(error.message || '').includes("doesn't exist")) {
        return res.json({
          success: true,
          data: []
        });
      }
      res.status(500).json({ success: false, message: '获取字典列表失败', error: error.message });
    }
  }

  // 根据代码获取字典
  static async getByCode(req, res) {
    try {
      const { code } = req.params;

      const dictionary = await Dictionary.findByCode(code);
      if (!dictionary) {
        return res.status(404).json({
          success: false,
          message: '字典不存在'
        });
      }

      res.json({
        success: true,
        data: normalizeRow(dictionary)
      });
    } catch (error) {
      console.error('获取字典失败:', error);
      res.status(500).json({
        success: false,
        message: '获取字典失败',
        error: error.message
      });
    }
  }

  // 创建字典
  static async create(req, res) {
    try {
      // 验证请求数据
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '数据验证失败',
          errors: errors.array()
        });
      }

      const {
        type,
        code,
        name,
        value,
        description,
        sortOrder,
        status
      } = req.body;

      // 检查代码是否已存在
      const exists = await Dictionary.existsByCode(code);
      if (exists) {
        return res.status(400).json({
          success: false,
          message: '该字典代码已存在'
        });
      }

      // 创建字典
      const dictionaryId = await Dictionary.create({
        type,
        code,
        name,
        value,
        description,
        sortOrder,
        status
      });

      res.status(201).json({
        success: true,
        message: '字典创建成功',
        data: { dictionaryId }
      });
    } catch (error) {
      console.error('创建字典失败:', error);
      res.status(500).json({
        success: false,
        message: '创建字典失败',
        error: error.message
      });
    }
  }

  // 更新字典
  static async update(req, res) {
    try {
      // 验证请求数据
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '数据验证失败',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const {
        type,
        code,
        name,
        value,
        description,
        sortOrder,
        status
      } = req.body;

      // 检查字典是否存在
      const dictionary = await Dictionary.findById(id);
      if (!dictionary) {
        return res.status(404).json({
          success: false,
          message: '字典不存在'
        });
      }

      // 检查代码是否已被其他字典使用
      const exists = await Dictionary.existsByCode(code, id);
      if (exists) {
        return res.status(400).json({
          success: false,
          message: '该字典代码已被其他字典使用'
        });
      }

      // 更新字典
      const success = await Dictionary.update(id, {
        type,
        code,
        name,
        value,
        description,
        sortOrder,
        status
      });

      if (!success) {
        return res.status(500).json({
          success: false,
          message: '更新字典失败'
        });
      }

      res.json({
        success: true,
        message: '字典更新成功'
      });
    } catch (error) {
      console.error('更新字典失败:', error);
      res.status(500).json({
        success: false,
        message: '更新字典失败',
        error: error.message
      });
    }
  }

  // 删除字典
  static async delete(req, res) {
    try {
      const { id } = req.params;

      // 检查字典是否存在
      const dictionary = await Dictionary.findById(id);
      if (!dictionary) {
        return res.status(404).json({
          success: false,
          message: '字典不存在'
        });
      }

      // 删除字典
      const success = await Dictionary.delete(id);
      if (!success) {
        return res.status(500).json({
          success: false,
          message: '删除字典失败'
        });
      }

      res.json({
        success: true,
        message: '字典删除成功'
      });
    } catch (error) {
      console.error('删除字典失败:', error);
      res.status(500).json({
        success: false,
        message: '删除字典失败',
        error: error.message
      });
    }
  }

  // 获取所有字典类型
  static async getTypes(req, res) {
    try {
      const types = await Dictionary.getTypes();

      res.json({
        success: true,
        data: (types || []).map(t => fixMojibake(t))
      });
    } catch (error) {
      console.error('获取字典类型失败:', error);
      if (String(error.message || '').includes("doesn't exist")) {
        return res.json({
          success: true,
          data: []
        });
      }
      res.status(500).json({ success: false, message: '获取字典类型失败', error: error.message });
    }
  }

  // 批量更新排序
  static async updateSortOrder(req, res) {
    try {
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供有效的排序数据'
        });
      }

      await Dictionary.updateSortOrder(items);

      res.json({
        success: true,
        message: '排序更新成功'
      });
    } catch (error) {
      console.error('更新排序失败:', error);
      res.status(500).json({
        success: false,
        message: '更新排序失败',
        error: error.message
      });
    }
  }

  // 更新状态
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: '无效的状态值'
        });
      }

      // 检查字典是否存在
      const dictionary = await Dictionary.findById(id);
      if (!dictionary) {
        return res.status(404).json({
          success: false,
          message: '字典不存在'
        });
      }

      // 更新状态
      const success = await Dictionary.updateStatus(id, status);
      if (!success) {
        return res.status(500).json({
          success: false,
          message: '更新状态失败'
        });
      }

      res.json({
        success: true,
        message: '状态更新成功'
      });
    } catch (error) {
      console.error('更新状态失败:', error);
      res.status(500).json({
        success: false,
        message: '更新状态失败',
        error: error.message
      });
    }
  }
}

export default DictionaryController;
