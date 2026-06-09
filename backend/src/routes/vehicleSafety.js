import express from 'express';
const router = express.Router();
import * as vehicleSafetyController from '../controllers/vehicleSafetyController.js';

// 车辆安全记录管理
router.post('/', vehicleSafetyController.createSafetyRecord);
router.get('/', vehicleSafetyController.getSafetyRecords);
router.get('/statistics', vehicleSafetyController.getStatistics);
router.get('/event-distribution', vehicleSafetyController.getEventTypeDistribution);
router.get('/trend', vehicleSafetyController.getTrendData);
router.get('/locations', vehicleSafetyController.getVehicleLocations);
router.get('/high-risk', vehicleSafetyController.getHighRiskVehicles);

// 预警收件箱（须在 /:id 之前注册，避免被动态路由拦截）
router.get('/alerts/list', vehicleSafetyController.getAlertList);
router.get('/alerts/unhandled-count', vehicleSafetyController.getUnhandledAlertCount);
router.put('/alerts/:id/handle', vehicleSafetyController.markAlertAsHandled);

router.get('/:id', vehicleSafetyController.getSafetyRecordById);
router.put('/:id', vehicleSafetyController.updateSafetyRecord);
router.put('/:id/status', vehicleSafetyController.updateStatus);
router.delete('/:id', vehicleSafetyController.deleteSafetyRecord);

export default router;
