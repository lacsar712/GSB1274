import express from 'express';
import * as regulationStatisticsController from '../controllers/regulationStatisticsController.js';

const router = express.Router();

// 获取监管概览
router.get('/overview', regulationStatisticsController.getOverview);

// 获取违规统计数据
router.get('/violations', regulationStatisticsController.getViolations);

// 导出统计数据
router.get('/export', regulationStatisticsController.exportStatistics);

export default router;
