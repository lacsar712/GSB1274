import express from 'express';
import * as companyConfigController from '../controllers/companyConfigController.js';

const router = express.Router();

// 获取企业配置列表
router.get('/', companyConfigController.getCompanyConfigs);

// 获取配置类型列表
router.get('/types', companyConfigController.getConfigTypes);

// 导出企业配置
router.get('/export', companyConfigController.exportCompanyConfigs);

// 根据企业ID获取所有配置
router.get('/company/:companyId', companyConfigController.getConfigsByCompanyId);

// 获取企业配置详情
router.get('/:configId', companyConfigController.getCompanyConfigById);

// 创建企业配置
router.post('/', companyConfigController.createCompanyConfig);

// 更新企业配置
router.put('/:configId', companyConfigController.updateCompanyConfig);

// 删除企业配置
router.delete('/:configId', companyConfigController.deleteCompanyConfig);

export default router;
