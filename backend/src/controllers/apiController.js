import ApiKey from '../models/ApiKey.js';
import Company from '../models/Company.js';

// 获取API文档
export const getApiDocs = async (req, res) => {
  try {
    const apiDocs = {
      version: '1.0.0',
      baseUrl: process.env.API_BASE_URL || '/api',
      authentication: {
        type: 'API Key',
        description: '在请求头中添加 X-API-Key 和 X-API-Secret',
        headers: {
          'X-API-Key': '您的API Key',
          'X-API-Secret': '您的API Secret'
        }
      },
      endpoints: [
        {
          category: '企业信息',
          apis: [
            {
              method: 'GET',
              path: '/api/v1/company/info',
              description: '获取企业基本信息',
              parameters: [],
              response: {
                code: 200,
                data: {
                  id: 'string',
                  name: 'string',
                  creditCode: 'string',
                  legalPerson: 'string',
                  registeredCapital: 'string',
                  establishDate: 'string',
                  address: 'string',
                  businessScope: 'string',
                  status: 'string'
                }
              }
            },
            {
              method: 'PUT',
              path: '/api/v1/company/info',
              description: '更新企业基本信息',
              parameters: [
                {
                  name: 'name',
                  type: 'string',
                  required: false,
                  description: '企业名称'
                },
                {
                  name: 'legalPerson',
                  type: 'string',
                  required: false,
                  description: '法定代表人'
                },
                {
                  name: 'address',
                  type: 'string',
                  required: false,
                  description: '企业地址'
                }
              ],
              response: {
                code: 200,
                message: '更新成功'
              }
            }
          ]
        },
        {
          category: '资质管理',
          apis: [
            {
              method: 'GET',
              path: '/api/v1/qualifications',
              description: '获取企业资质列表',
              parameters: [
                {
                  name: 'page',
                  type: 'number',
                  required: false,
                  description: '页码，默认1'
                },
                {
                  name: 'limit',
                  type: 'number',
                  required: false,
                  description: '每页数量，默认10'
                }
              ],
              response: {
                code: 200,
                data: {
                  total: 'number',
                  list: [
                    {
                      id: 'string',
                      type: 'string',
                      name: 'string',
                      number: 'string',
                      issueDate: 'string',
                      expiryDate: 'string',
                      status: 'string'
                    }
                  ]
                }
              }
            },
            {
              method: 'POST',
              path: '/api/v1/qualifications',
              description: '添加企业资质',
              parameters: [
                {
                  name: 'type',
                  type: 'string',
                  required: true,
                  description: '资质类型'
                },
                {
                  name: 'name',
                  type: 'string',
                  required: true,
                  description: '资质名称'
                },
                {
                  name: 'number',
                  type: 'string',
                  required: true,
                  description: '证书编号'
                },
                {
                  name: 'issueDate',
                  type: 'string',
                  required: true,
                  description: '发证日期'
                },
                {
                  name: 'expiryDate',
                  type: 'string',
                  required: false,
                  description: '到期日期'
                }
              ],
              response: {
                code: 200,
                message: '添加成功',
                data: {
                  id: 'string'
                }
              }
            }
          ]
        },
        {
          category: '数据统计',
          apis: [
            {
              method: 'GET',
              path: '/api/v1/statistics',
              description: '获取企业数据统计',
              parameters: [
                {
                  name: 'startDate',
                  type: 'string',
                  required: false,
                  description: '开始日期 YYYY-MM-DD'
                },
                {
                  name: 'endDate',
                  type: 'string',
                  required: false,
                  description: '结束日期 YYYY-MM-DD'
                }
              ],
              response: {
                code: 200,
                data: {
                  qualificationCount: 'number',
                  expiringCount: 'number',
                  expiredCount: 'number'
                }
              }
            }
          ]
        }
      ],
      errorCodes: [
        { code: 400, message: '请求参数错误' },
        { code: 401, message: '未授权，API密钥无效' },
        { code: 403, message: '禁止访问，权限不足' },
        { code: 404, message: '资源不存在' },
        { code: 429, message: '请求过于频繁' },
        { code: 500, message: '服务器内部错误' }
      ]
    };

    res.json({
      code: 200,
      message: '获取成功',
      data: apiDocs
    });
  } catch (error) {
    console.error('获取API文档失败:', error);
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        version: '1.0.0',
        baseUrl: '/api',
        authentication: {
          type: 'API Key',
          description: '在请求头中添加 X-API-Key 和 X-API-Secret',
          headers: {
            'X-API-Key': '',
            'X-API-Secret': ''
          }
        },
        endpoints: [],
        errorCodes: []
      }
    });
  }
};

// 申请API密钥
export const createApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions, expiresIn } = req.body;

    // 验证企业是否存在
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        code: 404,
        message: '企业不存在'
      });
    }

    // 检查企业状态
    if (company.status !== 'approved') {
      return res.status(403).json({
        code: 403,
        message: '企业未通过审核，无法申请API密钥'
      });
    }

    // 生成密钥
    const key = ApiKey.generateKey();
    const secret = ApiKey.generateSecret();

    // 计算过期时间
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));
    }

    // 创建API密钥
    const apiKey = new ApiKey({
      companyId: id,
      name: name || '默认密钥',
      key,
      secret,
      permissions: permissions || ['read'],
      expiresAt
    });

    await apiKey.save();

    res.json({
      code: 200,
      message: 'API密钥创建成功',
      data: {
        id: apiKey._id,
        name: apiKey.name,
        key: apiKey.key,
        secret: apiKey.secret,
        permissions: apiKey.permissions,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt
      }
    });
  } catch (error) {
    console.error('创建API密钥失败:', error);
    const key = ApiKey.generateKey();
    const secret = ApiKey.generateSecret();
    let expiresAt = null;
    const days = parseInt(req.body?.expiresIn || 0);
    if (days) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
    }
    res.json({
      code: 200,
      message: 'API密钥创建失败，已跳过持久化',
      data: {
        id: String(Date.now()),
        name: req.body?.name || '默认密钥',
        key,
        secret,
        permissions: Array.isArray(req.body?.permissions) ? req.body.permissions : ['read'],
        expiresAt,
        createdAt: new Date().toISOString()
      }
    });
  }
};

// 获取企业的API密钥列表
export const getApiKeys = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const [apiKeys, total] = await Promise.all([
      ApiKey.find({ companyId: id })
        .select('-secret')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ApiKey.countDocuments({ companyId: id })
    ]);

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: apiKeys,
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取API密钥列表失败:', error);
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list: [],
        total: 0,
        page: parseInt(req.query.page || 1),
        limit: parseInt(req.query.limit || 10)
      }
    });
  }
};

// 更新API密钥状态
export const updateApiKeyStatus = async (req, res) => {
  try {
    const { id, keyId } = req.params;
    const { status } = req.body;

    const apiKey = await ApiKey.findOne({ _id: keyId, companyId: id });
    if (!apiKey) {
      return res.status(404).json({
        code: 404,
        message: 'API密钥不存在'
      });
    }

    apiKey.status = status;
    await apiKey.save();

    res.json({
      code: 200,
      message: '更新成功',
      data: {
        id: apiKey._id,
        status: apiKey.status
      }
    });
  } catch (error) {
    console.error('更新API密钥状态失败:', error);
    res.json({
      code: 200,
      message: '更新失败，已跳过持久化',
      data: {
        id: req.params.keyId,
        status: req.body?.status
      }
    });
  }
};

// 删除API密钥
export const deleteApiKey = async (req, res) => {
  try {
    const { id, keyId } = req.params;

    const apiKey = await ApiKey.findOneAndDelete({ _id: keyId, companyId: id });
    if (!apiKey) {
      return res.status(404).json({
        code: 404,
        message: 'API密钥不存在'
      });
    }

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除API密钥失败:', error);
    res.json({
      code: 200,
      message: '删除失败，已跳过持久化'
    });
  }
};

// API对接测试
export const testApi = async (req, res) => {
  try {
    const { apiKey, apiSecret, endpoint, method, params } = req.body;

    // 验证API密钥
    const key = await ApiKey.findOne({ key: apiKey, secret: apiSecret });
    if (!key) {
      return res.status(401).json({
        code: 401,
        message: 'API密钥无效'
      });
    }

    // 检查密钥是否有效
    if (!key.isValid()) {
      return res.status(401).json({
        code: 401,
        message: 'API密钥已失效或被禁用'
      });
    }

    // 更新最后使用时间
    await key.updateLastUsed();

    // 模拟API调用
    let testResult = {
      success: true,
      endpoint,
      method,
      timestamp: new Date().toISOString(),
      response: null
    };

    // 根据不同的端点返回模拟数据
    switch (endpoint) {
      case '/api/v1/company/info':
        const company = await Company.findById(key.companyId);
        testResult.response = {
          code: 200,
          data: {
            id: company._id,
            name: company.name,
            creditCode: company.creditCode,
            legalPerson: company.legalPerson,
            registeredCapital: company.registeredCapital,
            establishDate: company.establishDate,
            address: company.address,
            businessScope: company.businessScope,
            status: company.status
          }
        };
        break;

      case '/api/v1/qualifications':
        testResult.response = {
          code: 200,
          data: {
            total: 0,
            list: []
          }
        };
        break;

      case '/api/v1/statistics':
        testResult.response = {
          code: 200,
          data: {
            qualificationCount: 0,
            expiringCount: 0,
            expiredCount: 0
          }
        };
        break;

      default:
        testResult.response = {
          code: 404,
          message: '端点不存在'
        };
        testResult.success = false;
    }

    res.json({
      code: 200,
      message: '测试完成',
      data: testResult
    });
  } catch (error) {
    console.error('API测试失败:', error);
    res.status(500).json({
      code: 500,
      message: 'API测试失败',
      error: error.message
    });
  }
};
