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
router.get('/alerts', vehicleSafetyController.getAlerts);
router.put('/alerts/:id/handle', vehicleSafetyController.handleAlert);
router.get('/:id', vehicleSafetyController.getSafetyRecordById);
router.put('/:id', vehicleSafetyController.updateSafetyRecord);
router.put('/:id/status', vehicleSafetyController.updateStatus);
router.delete('/:id', vehicleSafetyController.deleteSafetyRecord);

export default router;
