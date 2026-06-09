import express from 'express';
import * as regulationMessageController from '../controllers/regulationMessageController.js';

const router = express.Router();

// 获取监管消息列表
router.get('/', regulationMessageController.getRegulationMessages);

// 批量标记消息为已读
router.put('/bulk/read', regulationMessageController.markMultipleAsRead);

// 全部标记为已读（按用户）
router.put('/read/all', regulationMessageController.markAllAsRead);

// 标记消息为已读
router.put('/:msgId/read', regulationMessageController.markMessageAsRead);

// 批量删除消息
router.post('/bulk/delete', regulationMessageController.deleteMultipleRegulationMessages);

// 删除消息
router.delete('/:msgId', regulationMessageController.deleteRegulationMessage);

// 获取消息统计
router.get('/stats', regulationMessageController.getRegulationMessageStats);

// 获取消息设置
router.get('/settings', regulationMessageController.getMessageSettings);

// 更新消息设置
router.put('/settings', regulationMessageController.updateMessageSettings);

export default router;
