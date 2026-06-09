import express from 'express';
import * as tagController from '../controllers/tagController.js';

const router = express.Router();

// 获取标签列表（分页）
router.get('/', tagController.getTags);

// 获取所有标签（不分页，用于标签云）
router.get('/all', tagController.getAllTags);

// 获取单个标签详情
router.get('/:tagId', tagController.getTagById);

// 创建标签
router.post('/', tagController.createTag);

// 更新标签
router.put('/:tagId', tagController.updateTag);

// 删除标签
router.delete('/:tagId', tagController.deleteTag);

// 批量删除标签
router.post('/batch/delete', tagController.batchDeleteTags);

// 增加标签使用次数
router.post('/:tagId/increment', tagController.incrementUsageCount);

// 减少标签使用次数
router.post('/:tagId/decrement', tagController.decrementUsageCount);

export default router;
