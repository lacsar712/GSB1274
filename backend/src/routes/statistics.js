import express from 'express';
import StatisticsController from '../controllers/statisticsController.js';

const router = express.Router();

// 获取企业运营概览
router.get('/companies/:id/statistics/overview', StatisticsController.getOverview);

// 获取收入统计数据
router.get('/companies/:id/statistics/revenue', StatisticsController.getRevenue);

// 导出统计数据
router.get('/companies/:id/statistics/export', StatisticsController.exportData);

// 新增：通用运营统计接口
router.get('/operations/statistics/overview', StatisticsController.getOperationsOverview);
router.get('/operations/statistics/revenue', StatisticsController.getOperationsRevenue);
router.get('/operations/statistics/export', StatisticsController.exportOperationsData);

export default router;
