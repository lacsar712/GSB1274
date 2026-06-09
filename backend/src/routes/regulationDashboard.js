import express from 'express';
import * as regulationDashboardController from '../controllers/regulationDashboardController.js';

const router = express.Router();

// 获取大屏数据
router.get('/', regulationDashboardController.getDashboardData);

// 获取大屏配置
router.get('/config', regulationDashboardController.getDashboardConfig);

// 更新大屏配置
router.put('/config', regulationDashboardController.updateDashboardConfig);

export default router;
