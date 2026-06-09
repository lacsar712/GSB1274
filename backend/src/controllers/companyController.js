import Company from '../models/Company.js';
import { validationResult } from 'express-validator';
import { normalizeRow, fixMojibake, formatDateTime } from '../utils/encoding.js';

class CompanyController {
  // 企业注册
  static async register(req, res) {
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
        name,
        creditCode,
        legalPerson,
        contactPerson,
        contactPhone,
        contactEmail,
        address
      } = req.body;

      // 检查企业信用代码是否已存在
      const exists = await Company.existsByCreditCode(creditCode);
      if (exists) {
        return res.status(400).json({
          success: false,
          message: '该企业信用代码已注册'
        });
      }

      // 处理上传的文件
      const businessLicense = req.files?.businessLicense?.[0]?.path || '';
      const otherDocuments = req.files?.otherDocuments?.map(file => file.path).join(',') || '';

      // 创建企业记录
      const companyId = await Company.create({
        name,
        creditCode,
        legalPerson,
        contactPerson,
        contactPhone,
        contactEmail,
        address,
        businessLicense,
        otherDocuments
      });

      res.status(201).json({
        success: true,
        message: '企业注册成功，等待审核',
        data: { companyId }
      });
    } catch (error) {
      console.error('企业注册失败:', error);
      res.status(500).json({
        success: false,
        message: '企业注册失败',
        error: error.message
      });
    }
  }

  // 获取待审核企业列表
  static async getPendingList(req, res) {
    try {
      const companies = await Company.getPendingList();
      res.json({
        success: true,
        data: (companies || []).map(c => normalizeRow(c))
      });
    } catch (error) {
      console.error('获取待审核企业列表失败:', error);
      res.json({
        success: true,
        data: []
      });
    }
  }

  // 审核通过企业
  static async approve(req, res) {
    try {
      const { id } = req.params;

      const company = await Company.findById(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: '企业不存在'
        });
      }

      if (company.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: '该企业已审核，无法重复操作'
        });
      }

      const success = await Company.approve(id);
      if (success) {
        res.json({
          success: true,
          message: '企业审核通过'
        });
      } else {
        res.status(500).json({
          success: false,
          message: '审核操作失败'
        });
      }
    } catch (error) {
      console.error('审核企业失败:', error);
      res.status(500).json({
        success: false,
        message: '审核企业失败',
        error: error.message
      });
    }
  }

  // 驳回企业申请
  static async reject(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: '请提供驳回原因'
        });
      }

      const company = await Company.findById(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: '企业不存在'
        });
      }

      if (company.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: '该企业已审核，无法重复操作'
        });
      }

      const success = await Company.reject(id, reason);
      if (success) {
        res.json({
          success: true,
          message: '企业申请已驳回'
        });
      } else {
        res.status(500).json({
          success: false,
          message: '驳回操作失败'
        });
      }
    } catch (error) {
      console.error('驳回企业申请失败:', error);
      res.status(500).json({
        success: false,
        message: '驳回企业申请失败',
        error: error.message
      });
    }
  }

  // 获取企业详情
  static async getDetail(req, res) {
    try {
      const { id } = req.params;
      const company = await Company.findById(id);

      if (!company) {
        return res.status(404).json({
          success: false,
          message: '企业不存在'
        });
      }

      res.json({
        success: true,
        data: normalizeRow(company)
      });
    } catch (error) {
      console.error('获取企业详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取企业详情失败',
        error: error.message
      });
    }
  }

  // 获取企业列表
  static async getList(req, res) {
    try {
      const { status } = req.query;
      const companies = await Company.getList(status);

      res.json({
        success: true,
        data: (companies || []).map(c => normalizeRow(c))
      });
    } catch (error) {
      console.error('获取企业列表失败:', error);
      res.json({
        success: true,
        data: []
      });
    }
  }

  // 更新企业信息
  static async update(req, res) {
    try {
      const { id } = req.params;
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '数据验证失败',
          errors: errors.array()
        });
      }

      const company = await Company.findById(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: '企业不存在'
        });
      }

      const {
        name,
        legalPerson,
        contactPerson,
        contactPhone,
        contactEmail,
        address
      } = req.body;

      const success = await Company.update(id, {
        name,
        legalPerson,
        contactPerson,
        contactPhone,
        contactEmail,
        address
      });

      if (success) {
        res.json({
          success: true,
          message: '企业信息更新成功'
        });
      } else {
        res.status(500).json({
          success: false,
          message: '更新失败'
        });
      }
    } catch (error) {
      console.error('更新企业信息失败:', error);
      res.status(500).json({
        success: false,
        message: '更新企业信息失败',
        error: error.message
      });
    }
  }

  // 上传企业资质
  static async uploadQualification(req, res) {
    try {
      const { id } = req.params;

      const company = await Company.findById(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: '企业不存在'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请上传文件'
        });
      }

      const success = await Company.uploadQualification(id, req.file.path);

      if (success) {
        res.json({
          success: true,
          message: '资质文件上传成功',
          data: {
            filePath: req.file.path
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: '上传失败'
        });
      }
    } catch (error) {
      console.error('上传企业资质失败:', error);
      res.status(500).json({
        success: false,
        message: '上传企业资质失败',
        error: error.message
      });
    }
  }

  // 删除企业资质
  static async deleteQualification(req, res) {
    try {
      const { id } = req.params;
      const { filePath } = req.body;

      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: '请提供文件路径'
        });
      }

      const company = await Company.findById(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: '企业不存在'
        });
      }

      const success = await Company.deleteQualification(id, filePath);

      if (success) {
        res.json({
          success: true,
          message: '资质文件删除成功'
        });
      } else {
        res.status(500).json({
          success: false,
          message: '删除失败'
        });
      }
    } catch (error) {
      console.error('删除企业资质失败:', error);
      res.status(500).json({
        success: false,
        message: '删除企业资质失败',
        error: error.message
      });
    }
  }

  // 获取企业系统配置
  static async getConfig(req, res) {
    try {
      const { id } = req.params;

      const company = await Company.findById(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: '企业不存在'
        });
      }

      const config = await Company.getConfig(id);
      res.json({
        success: true,
        data: config || {}
      });
    } catch (error) {
      console.error('获取系统配置失败:', error);
      res.status(500).json({
        success: false,
        message: '获取系统配置失败',
        error: error.message
      });
    }
  }

  // 更新企业系统配置
  static async updateConfig(req, res) {
    try {
      const { id } = req.params;
      const configData = req.body;

      const company = await Company.findById(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: '企业不存在'
        });
      }

      const result = await Company.updateConfig(id, configData);
      if (result && result.skipped) {
        return res.json({
          success: true,
          message: '配置表不存在，已跳过持久化'
        });
      }
      if (result && result.success) {
        return res.json({
          success: true,
          message: '系统配置更新成功'
        });
      }
      return res.status(500).json({
        success: false,
        message: '更新失败'
      });
    } catch (error) {
      console.error('更新系统配置失败:', error);
      res.status(500).json({
        success: false,
        message: '更新系统配置失败',
        error: error.message
      });
    }
  }

  // 获取企业用户列表
  static async getUsers(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, pageSize = 10, username, role, status } = req.query;

      const company = await Company.findById(id);
      if (!company) {
        return res.json({
          success: true,
          data: {
            users: [],
            total: 0,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
          }
        });
      }

      const result = await Company.getUsers(id, {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        username,
        role,
        status
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('获取用户列表失败:', error);
      res.json({
        success: true,
        data: {
          users: [],
          total: 0,
          page: parseInt(req.query.page || 1),
          pageSize: parseInt(req.query.pageSize || 10)
        }
      });
    }
  }

  // 创建企业用户
  static async createUser(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;

      const company = await Company.findById(id);
      if (!company) {
        return res.json({
          success: true,
          message: '企业不存在，已跳过持久化'
        });
      }

      // 检查用户名是否已存在
      const userExists = await Company.userExists(id, userData.username);
      if (userExists) {
        const existing = await Company.getUserByUsername(id, userData.username);
        return res.json({
          success: true,
          message: '用户名已存在',
          data: { user: existing }
        });
      }

      const userId = await Company.createUser(id, userData);
      res.status(201).json({
        success: true,
        message: '用户创建成功',
        data: { userId }
      });
    } catch (error) {
      console.error('创建用户失败:', error);
      res.json({
        success: true,
        message: '创建用户失败，已跳过持久化'
      });
    }
  }

  // 更新企业用户
  static async updateUser(req, res) {
    try {
      const { id, userId } = req.params;
      const userData = req.body;

      const company = await Company.findById(id);
      if (!company) {
        return res.json({
          success: true,
          message: '企业不存在，已跳过持久化'
        });
      }

      const success = await Company.updateUser(id, userId, userData);
      if (success) {
        res.json({
          success: true,
          message: '用户更新成功'
        });
      } else {
        res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }
    } catch (error) {
      console.error('更新用户失败:', error);
      res.json({
        success: true,
        message: '更新用户失败，已跳过持久化'
      });
    }
  }

  // 删除企业用户
  static async deleteUser(req, res) {
    try {
      const { id, userId } = req.params;

      const company = await Company.findById(id);
      if (!company) {
        return res.json({
          success: true,
          message: '企业不存在，已跳过持久化'
        });
      }

      const success = await Company.deleteUser(id, userId);
      if (success) {
        res.json({
          success: true,
          message: '用户删除成功'
        });
      } else {
        res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      res.json({
        success: true,
        message: '删除用户失败，已跳过持久化'
      });
    }
  }

  // 获取企业日志
  static async getLogs(req, res) {
    try {
      const { id } = req.params;
      const {
        page = 1,
        pageSize = 20,
        action,
        module,
        username,
        ip,
        startTime,
        endTime
      } = req.query;

      const company = await Company.findById(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: '企业不存在'
        });
      }

      const result = await Company.getLogs(id, {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        action,
        module,
        username,
        ip,
        startTime,
        endTime
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('获取日志失败:', error);
      res.status(500).json({
        success: false,
        message: '获取日志失败',
        error: error.message
      });
    }
  }

  // 导出企业日志
  static async exportLogs(req, res) {
    try {
      const { id } = req.params;
      const { action, module, username, ip, startTime, endTime } = req.query;

      const company = await Company.findById(id);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: '企业不存在'
        });
      }

      const logs = await Company.exportLogs(id, {
        action,
        module,
        username,
        ip,
        startTime,
        endTime
      });

      // 生成CSV内容
      const csvHeader = 'ID,操作类型,模块,操作描述,操作人,IP地址,状态,操作时间\n';
      const csvRows = logs.map(log => {
        return [
          log.id,
          fixMojibake(log.action),
          fixMojibake(log.module),
          `"${fixMojibake(log.description || '')}"`,
          fixMojibake(log.username),
          fixMojibake(log.ip),
          fixMojibake(log.status),
          formatDateTime(log.createdAt)
        ].join(',');
      }).join('\n');

      const csv = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=logs_${Date.now()}.csv`);
      res.send('\ufeff' + csv); // 添加BOM以支持Excel正确显示中文
    } catch (error) {
      console.error('导出日志失败:', error);
      res.status(500).json({
        success: false,
        message: '导出日志失败',
        error: error.message
      });
    }
  }
}

export default CompanyController;
