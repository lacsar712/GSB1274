import express from 'express';
import * as regulationBusinessController from '../controllers/regulationBusinessController.js';

const router = express.Router();

// 获取业务列表
router.get('/', regulationBusinessController.getBusinesses);

// 获取业务统计
router.get('/statistics', regulationBusinessController.getBusinessStatistics);

// 获取业务详情
router.get('/:businessId', regulationBusinessController.getBusinessById);

// 创建业务
router.post('/', regulationBusinessController.createBusiness);

// 更新业务
router.put('/:businessId', regulationBusinessController.updateBusiness);

// 删除业务
router.delete('/:businessId', regulationBusinessController.deleteBusiness);

export default router;
