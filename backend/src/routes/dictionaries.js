import express from 'express';
import { body } from 'express-validator';
import DictionaryController from '../controllers/dictionaryController.js';

const router = express.Router();

// 字典创建验证规则
const createValidation = [
  body('type').trim().notEmpty().withMessage('字典类型不能为空'),
  body('code').trim().notEmpty().withMessage('字典代码不能为空'),
  body('name').trim().notEmpty().withMessage('字典名称不能为空'),
  body('value').notEmpty().withMessage('字典值不能为空'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('排序值必须为非负整数'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('状态值无效')
];

// 字典更新验证规则
const updateValidation = [
  body('type').trim().notEmpty().withMessage('字典类型不能为空'),
  body('code').trim().notEmpty().withMessage('字典代码不能为空'),
  body('name').trim().notEmpty().withMessage('字典名称不能为空'),
  body('value').notEmpty().withMessage('字典值不能为空'),
  body('sortOrder').optional().isInt({ min: 0 }).withMessage('排序值必须为非负整数'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('状态值无效')
];

// 获取字典列表
router.get('/', DictionaryController.getList);

// 获取所有字典类型
router.get('/types', DictionaryController.getTypes);

// 根据类型获取字典列表
router.get('/type/:type', DictionaryController.getByType);

// 根据代码获取字典
router.get('/code/:code', DictionaryController.getByCode);

// 根据ID获取字典详情
router.get('/:id', DictionaryController.getById);

// 创建字典
router.post('/', createValidation, DictionaryController.create);

// 更新字典
router.put('/:id', updateValidation, DictionaryController.update);

// 删除字典
router.delete('/:id', DictionaryController.delete);

// 批量更新排序
router.put('/batch/sort', DictionaryController.updateSortOrder);

// 更新状态
router.patch('/:id/status', DictionaryController.updateStatus);

export default router;
