import express from 'express';
import * as regulationInspectionController from '../controllers/regulationInspectionController.js';

const router = express.Router();

// 获取抽检列表
router.get('/', regulationInspectionController.getInspections);

// 获取抽检统计
router.get('/statistics', regulationInspectionController.getInspectionStatistics);

// 获取抽检详情
router.get('/:inspectionId', regulationInspectionController.getInspectionById);

// 创建抽检
router.post('/', regulationInspectionController.createInspection);

// 更新抽检
router.put('/:inspectionId', regulationInspectionController.updateInspection);

// 删除抽检
router.delete('/:inspectionId', regulationInspectionController.deleteInspection);

export default router;
