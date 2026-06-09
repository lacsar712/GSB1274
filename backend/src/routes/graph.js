import express from 'express';
import * as graphController from '../controllers/graphController.js';

const router = express.Router();

// 获取图数据
router.get('/', graphController.getGraphData);

// 查询图数据
router.post('/query', graphController.queryGraphData);

// 创建节点
router.post('/nodes', graphController.createNode);

// 创建边
router.post('/edges', graphController.createEdge);

// 获取节点类型列表
router.get('/node-types', graphController.getNodeTypes);

// 获取边标签列表
router.get('/edge-labels', graphController.getEdgeLabels);

export default router;
