import express from 'express';
import * as riskController from '../controllers/riskController.js';

const router = express.Router();

// 获取风险列表
router.get('/', riskController.getRisks);

// 获取风险分类列表
router.get('/categories', riskController.getRiskCategories);

// 获取风险统计
router.get('/statistics', riskController.getRiskStatistics);

// 获取风险详情
router.get('/:id', riskController.getRiskById);

// 创建风险
router.post('/', riskController.createRisk);

// 更新风险
router.put('/:id', riskController.updateRisk);

// 删除风险
router.delete('/:id', riskController.deleteRisk);

// 批量删除风险
router.post('/batch/delete', riskController.batchDeleteRisks);

export default router;
