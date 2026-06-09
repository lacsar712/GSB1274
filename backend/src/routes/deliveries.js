import express from 'express';
import * as deliveryController from '../controllers/deliveryController.js';

const router = express.Router();

// 配送订单管理
router.post('/', deliveryController.createDelivery);
router.get('/', deliveryController.getDeliveries);
router.get('/statistics', deliveryController.getStatistics);
router.get('/trend', deliveryController.getTrendData);
router.get('/driver-performance', deliveryController.getDriverPerformance);
router.get('/order/:order_no', deliveryController.getDeliveryByOrderNo);
router.get('/:id/tracks', deliveryController.getDeliveryTracks);
router.post('/:id/tracks', deliveryController.addDeliveryTrack);
router.get('/:id/ratings', deliveryController.getDeliveryRatings);
router.post('/:id/ratings', deliveryController.addDeliveryRating);
router.get('/:id', deliveryController.getDeliveryById);
router.put('/:id', deliveryController.updateDelivery);
router.put('/:id/status', deliveryController.updateDeliveryStatus);
router.put('/:id/assign', deliveryController.assignDriver);
router.delete('/:id', deliveryController.deleteDelivery);

export default router;
