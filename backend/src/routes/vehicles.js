import express from 'express';
import * as vehicleController from '../controllers/vehicleController.js';

const router = express.Router();

// 获取车辆列表
router.get('/', vehicleController.getVehicles);

// 获取所有车辆位置（用于地图展示）
router.get('/locations', vehicleController.getVehicleLocations);

// 获取车辆详情
router.get('/:vehicleId', vehicleController.getVehicleById);

// 创建车辆
router.post('/', vehicleController.createVehicle);

// 更新车辆
router.put('/:vehicleId', vehicleController.updateVehicle);

// 删除车辆
router.delete('/:vehicleId', vehicleController.deleteVehicle);

// 更新车辆状态
router.patch('/:vehicleId/status', vehicleController.updateVehicleStatus);

// 更新车辆位置
router.patch('/:vehicleId/location', vehicleController.updateVehicleLocation);

// 获取车辆统计信息
router.get('/:vehicleId/statistics', vehicleController.getVehicleStatistics);

export default router;
