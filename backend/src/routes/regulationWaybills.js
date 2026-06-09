import express from 'express';
import * as regulationWaybillController from '../controllers/regulationWaybillController.js';

const router = express.Router();

// 获取监管运单列表
router.get('/', regulationWaybillController.getRegulationWaybills);

// 获取监管运单统计
router.get('/statistics', regulationWaybillController.getRegulationWaybillStatistics);

// 获取监管运单详情
router.get('/:waybillId', regulationWaybillController.getRegulationWaybillById);

// 更新监管运单
router.put('/:waybillId', regulationWaybillController.updateRegulationWaybill);

export default router;
