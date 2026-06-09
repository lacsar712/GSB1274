import pool from '../config/database.js';

class User {
  // 根据ID获取用户信息
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT 
              id, 
              company_id as companyId, 
              CONVERT(CAST(username AS BINARY) USING utf8mb4) as username, 
              CONVERT(CAST(real_name AS BINARY) USING utf8mb4) as realName, 
              CONVERT(CAST(email AS BINARY) USING utf8mb4) as email, 
              CONVERT(CAST(phone AS BINARY) USING utf8mb4) as phone, 
              CONVERT(CAST(role AS BINARY) USING utf8mb4) as role, 
              permissions, 
              CONVERT(CAST(status AS BINARY) USING utf8mb4) as status, 
              last_login_at as lastLoginAt, created_at as createdAt, 
              updated_at as updatedAt
       FROM company_users 
       WHERE id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const user = rows[0];
    // 解析permissions字段
    if (user.permissions) {
      user.permissions = typeof user.permissions === 'string' 
        ? JSON.parse(user.permissions) 
        : user.permissions;
    }
    
    return user;
  }

  // 更新用户基本信息
  static async updateInfo(id, userData) {
    const { realName, email, phone } = userData;

    const [result] = await pool.execute(
      `UPDATE company_users 
       SET real_name = ?, email = ?, phone = ?, updated_at = NOW() 
       WHERE id = ?`,
      [realName, email, phone, id]
    );

    return result.affectedRows > 0;
  }

  // 验证密码
  static async verifyPassword(id, password) {
    const [rows] = await pool.execute(
      'SELECT password FROM company_users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return false;
    }

    // 这里应该使用bcrypt等加密算法进行比较
    // 简化处理，实际应用中需要加密
    return rows[0].password === password;
  }

  // 更新密码
  static async updatePassword(id, newPassword) {
    // 这里应该对密码进行加密
    // 简化处理，实际应用中需要使用bcrypt等加密
    const hashedPassword = newPassword;

    const [result] = await pool.execute(
      `UPDATE company_users 
       SET password = ?, updated_at = NOW() 
       WHERE id = ?`,
      [hashedPassword, id]
    );

    return result.affectedRows > 0;
  }

  // 获取用户偏好设置
  static async getPreferences(id) {
    const [rows] = await pool.execute(
      'SELECT preferences FROM user_preferences WHERE user_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    return typeof rows[0].preferences === 'string'
      ? JSON.parse(rows[0].preferences)
      : rows[0].preferences;
  }

  // 更新用户偏好设置
  static async updatePreferences(id, preferencesData) {
    const preferencesJson = JSON.stringify(preferencesData);

    // 先检查是否存在偏好设置
    const existing = await this.getPreferences(id);

    if (existing) {
      const [result] = await pool.execute(
        `UPDATE user_preferences 
         SET preferences = ?, updated_at = NOW() 
         WHERE user_id = ?`,
        [preferencesJson, id]
      );
      return result.affectedRows > 0;
    } else {
      const [result] = await pool.execute(
        `INSERT INTO user_preferences (user_id, preferences, created_at, updated_at) 
         VALUES (?, ?, NOW(), NOW())`,
        [id, preferencesJson]
      );
      return result.affectedRows > 0;
    }
  }

  // 更新最后登录时间
  static async updateLastLogin(id) {
    const [result] = await pool.execute(
      'UPDATE company_users SET last_login_at = NOW() WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default User;
