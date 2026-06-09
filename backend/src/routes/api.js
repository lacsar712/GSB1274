import express from 'express';
import {
  getApiDocs,
  createApiKey,
  getApiKeys,
  updateApiKeyStatus,
  deleteApiKey,
  testApi
} from '../controllers/apiController.js';

const router = express.Router();

// 获取API文档
router.get('/docs', getApiDocs);

// 申请API密钥
router.post('/companies/:id/api-keys', createApiKey);

// 获取企业的API密钥列表
router.get('/companies/:id/api-keys', getApiKeys);

// 更新API密钥状态
router.put('/companies/:id/api-keys/:keyId/status', updateApiKeyStatus);

// 删除API密钥
router.delete('/companies/:id/api-keys/:keyId', deleteApiKey);

// API对接测试
router.post('/test', testApi);

export default router;
