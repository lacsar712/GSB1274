import express from 'express';
const router = express.Router();
import * as operationsController from '../controllers/operationsController.js';

/**
 * 运营消息中心路由
 */

// 获取运营消息列表
router.get('/messages', operationsController.getMessages);

// 获取消息设置
router.get('/messages/settings', operationsController.getMessageSettings);

// 更新消息设置
router.put('/messages/settings', operationsController.updateMessageSettings);

// 获取消息详情
router.get('/messages/:msgId', operationsController.getMessageDetail);

// 标记消息为已读
router.put('/messages/:msgId/read', operationsController.markMessageAsRead);

/**
 * 运维监控路由
 */

// 获取系统监控数据
router.get('/monitoring/system', operationsController.getSystemMonitoring);

// 获取性能监控数据
router.get('/monitoring/performance', operationsController.getPerformanceMonitoring);

// 获取系统日志
router.get('/logs', operationsController.getSystemLogs);

/**
 * 运营系统管理路由
 */

// 获取系统配置
router.get('/config', operationsController.getSystemConfig);

// 更新系统配置
router.put('/config', operationsController.updateSystemConfig);

// 获取用户列表
router.get('/users', operationsController.getOperationUsers);

// 更新用户权限
router.put('/users/permissions', operationsController.updateUserPermissions);

// 获取操作日志
router.get('/operation-logs', operationsController.getOperationLogs);

export default router;
