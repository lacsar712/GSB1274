import express from 'express';
import * as carrierController from '../controllers/carrierController.js';

const router = express.Router();

// 获取承运人列表
router.get('/', carrierController.getCarriers);

// 获取承运人详情
router.get('/:carrierId', carrierController.getCarrierById);

// 创建承运人
router.post('/', carrierController.createCarrier);

// 更新承运人
router.put('/:carrierId', carrierController.updateCarrier);

// 删除承运人
router.delete('/:carrierId', carrierController.deleteCarrier);

// 更新承运人状态
router.patch('/:carrierId/status', carrierController.updateCarrierStatus);

// 获取承运人统计信息
router.get('/:carrierId/statistics', carrierController.getCarrierStatistics);

export default router;
