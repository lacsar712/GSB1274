import express from 'express';
import * as messageController from '../controllers/messageController.js';

const router = express.Router();

// 获取企业消息列表
router.get('/:id/messages', messageController.getMessages);

// 获取消息详情
router.get('/:id/messages/:msgId', messageController.getMessageById);

// 标记消息为已读
router.put('/:id/messages/:msgId/read', messageController.markAsRead);

// 批量标记消息为已读
router.put('/:id/messages/batch/read', messageController.markMultipleAsRead);

// 标记所有消息为已读
router.put('/:id/messages/all/read', messageController.markAllAsRead);

// 删除消息
router.delete('/:id/messages/:msgId', messageController.deleteMessage);

// 获取消息统计
router.get('/:id/messages-stats', messageController.getMessageStats);

// 获取消息设置
router.get('/:id/messages/settings', messageController.getMessageSettings);

// 更新消息设置
router.put('/:id/messages/settings', messageController.updateMessageSettings);

export default router;
