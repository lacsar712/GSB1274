import User from '../models/User.js';
import { validationResult } from 'express-validator';
import { normalizeRow } from '../utils/encoding.js';

class UserController {
  // 获取用户信息
  static async getUserInfo(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 不返回密码字段
      delete user.password;

      res.json({
        success: true,
        data: normalizeRow(user)
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
      res.status(500).json({
        success: false,
        message: '获取用户信息失败',
        error: error.message
      });
    }
  }

  // 更新用户信息
  static async updateUserInfo(req, res) {
    try {
      const { id } = req.params;
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '数据验证失败',
          errors: errors.array()
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const { realName, email, phone } = req.body;

      const success = await User.updateInfo(id, {
        realName,
        email,
        phone
      });

      if (success) {
        res.json({
          success: true,
          message: '用户信息更新成功'
        });
      } else {
        res.status(500).json({
          success: false,
          message: '更新失败'
        });
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
      res.status(500).json({
        success: false,
        message: '更新用户信息失败',
        error: error.message
      });
    }
  }

  // 修改密码
  static async changePassword(req, res) {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: '请提供当前密码和新密码'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: '新密码长度至少8个字符'
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 验证当前密码
      const isValidPassword = await User.verifyPassword(id, oldPassword);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: '当前密码不正确'
        });
      }

      // 更新密码
      const success = await User.updatePassword(id, newPassword);
      if (success) {
        res.json({
          success: true,
          message: '密码修改成功'
        });
      } else {
        res.status(500).json({
          success: false,
          message: '密码修改失败'
        });
      }
    } catch (error) {
      console.error('修改密码失败:', error);
      res.status(500).json({
        success: false,
        message: '修改密码失败',
        error: error.message
      });
    }
  }

  // 获取用户偏好设置
  static async getPreferences(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const preferences = await User.getPreferences(id);
      res.json({
        success: true,
        data: preferences || {}
      });
    } catch (error) {
      console.error('获取偏好设置失败:', error);
      res.status(500).json({
        success: false,
        message: '获取偏好设置失败',
        error: error.message
      });
    }
  }

  // 更新用户偏好设置
  static async updatePreferences(req, res) {
    try {
      const { id } = req.params;
      const preferencesData = req.body;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const success = await User.updatePreferences(id, preferencesData);
      if (success) {
        res.json({
          success: true,
          message: '偏好设置更新成功'
        });
      } else {
        res.status(500).json({
          success: false,
          message: '更新失败'
        });
      }
    } catch (error) {
      console.error('更新偏好设置失败:', error);
      res.status(500).json({
        success: false,
        message: '更新偏好设置失败',
        error: error.message
      });
    }
  }
}

export default UserController;
