import express from 'express';
import { body } from 'express-validator';
import UserController from '../controllers/userController.js';

const router = express.Router();

// 用户信息更新验证规则
const updateInfoValidation = [
  body('realName').trim().notEmpty().withMessage('真实姓名不能为空'),
  body('email').trim().notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('邮箱格式不正确'),
  body('phone').trim().notEmpty().withMessage('手机号不能为空')
    .matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确')
];

// 获取用户信息
router.get('/:id', UserController.getUserInfo);

// 更新用户信息
router.put('/:id', updateInfoValidation, UserController.updateUserInfo);

// 修改密码
router.put('/:id/password', UserController.changePassword);

// 获取用户偏好设置
router.get('/:id/preferences', UserController.getPreferences);

// 更新用户偏好设置
router.put('/:id/preferences', UserController.updatePreferences);

export default router;
