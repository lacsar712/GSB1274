import express from 'express';
const router = express.Router();
import * as driverController from '../controllers/driverController.js';

// 获取驾驶员列表
router.get('/', driverController.getDrivers);

// 获取驾驶员统计信息
router.get('/statistics', driverController.getDriverStatistics);

// 获取驾驶员详情
router.get('/:driverId', driverController.getDriverById);

// 创建驾驶员
router.post('/', driverController.createDriver);

// 更新驾驶员
router.put('/:driverId', driverController.updateDriver);

// 删除驾驶员
router.delete('/:driverId', driverController.deleteDriver);

// 批量删除驾驶员
router.post('/batch/delete', driverController.batchDeleteDrivers);

// 更新驾驶员状态
router.patch('/:driverId/status', driverController.updateDriverStatus);

export default router;
