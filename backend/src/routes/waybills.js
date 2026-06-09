import express from 'express';
import * as waybillController from '../controllers/waybillController.js';

const router = express.Router();

// 获取企业运单列表
router.get('/companies/:id/waybills', waybillController.getCompanyWaybills);

// 获取运单详情
router.get('/companies/:id/waybills/:waybillId', waybillController.getWaybillDetail);

// 创建运单
router.post('/companies/:id/waybills', waybillController.createWaybill);

// 更新运单
router.put('/companies/:id/waybills/:waybillId', waybillController.updateWaybill);

// 更新运单状态
router.patch('/companies/:id/waybills/:waybillId/status', waybillController.updateWaybillStatus);

// 添加运单轨迹
router.post('/companies/:id/waybills/:waybillId/tracks', waybillController.addWaybillTrack);

// 删除运单
router.delete('/companies/:id/waybills/:waybillId', waybillController.deleteWaybill);

// 获取运单统计
router.get('/companies/:id/waybills-stats', waybillController.getWaybillStats);

router.post('/waybills/migrate', waybillController.migrateMysqlWaybills);

export default router;
