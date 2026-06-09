import pool from '../config/database.js';

/**
 * 获取系统配置
 */
export const getConfig = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT config FROM regulation_system_config ORDER BY updated_at DESC LIMIT 1`
    );
    if (rows && rows.length > 0) {
      const cfg = typeof rows[0].config === 'string' ? JSON.parse(rows[0].config) : rows[0].config;
      return res.json({ success: true, data: cfg });
    }
    return res.json({
      success: true,
      data: {
        system_name: '监管服务系统',
        inspection_interval_days: 30,
        high_risk_threshold: 80,
        auto_alert_enabled: true,
        data_retention_days: 365,
        max_upload_size_mb: 10,
        allowed_file_types: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png']
      }
    });
  } catch (error) {
    console.error('获取系统配置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取系统配置失败',
      error: error.message
    });
  }
};

/**
 * 更新系统配置
 */
export const updateConfig = async (req, res) => {
  try {
    const config = req.body;

    await pool.execute(
      `INSERT INTO regulation_system_config (config, updated_at, updated_by) VALUES (?, NOW(), ?)`,
      [JSON.stringify(config), req.user?.id || 1]
    );
    res.json({ success: true, message: '系统配置更新成功', data: config });
  } catch (error) {
    console.error('更新系统配置失败:', error);
    res.status(500).json({
      success: false,
      message: '更新系统配置失败',
      error: error.message
    });
  }
};

/**
 * 获取用户列表
 */
export const getUsers = async (req, res) => {
  try {
    const { role, status, search, limit = 20, offset = 0 } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (role) {
      whereClause += ` AND role = ?`;
      params.push(role);
    }

    if (status) {
      whereClause += ` AND status = ?`;
      params.push(status);
    }

    if (search) {
      whereClause += ` AND (username LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    const lim = parseInt(limit);
    const off = parseInt(offset);
    const [rows] = await pool.execute(
      `
      SELECT 
        id,
        CONVERT(CAST(username AS BINARY) USING utf8mb4) AS username,
        CONVERT(CAST(email AS BINARY) USING utf8mb4) AS email,
        CONVERT(CAST(role AS BINARY) USING utf8mb4) AS role,
        CONVERT(CAST(status AS BINARY) USING utf8mb4) AS status,
        last_login,
        created_at
      FROM users
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${Number.isFinite(lim) ? lim : 20} OFFSET ${Number.isFinite(off) ? off : 0}
      `,
      params
    );
    res.json({
      success: true,
      data: rows || [],
      pagination: { limit: Number.isFinite(lim) ? lim : 20, offset: Number.isFinite(off) ? off : 0 }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败',
      error: error.message
    });
  }
};

/**
 * 更新用户权限
 */
export const updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, permissions } = req.body;

    const [result] = await pool.execute(
      `
      UPDATE users
      SET 
        role = COALESCE(?, role),
        permissions = COALESCE(?, permissions),
        updated_at = NOW()
      WHERE id = ?
      `,
      [role, permissions ? JSON.stringify(permissions) : null, userId]
    );
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const [rows] = await pool.execute(
      `
      SELECT 
        id,
        CONVERT(CAST(username AS BINARY) USING utf8mb4) AS username,
        CONVERT(CAST(email AS BINARY) USING utf8mb4) AS email,
        CONVERT(CAST(role AS BINARY) USING utf8mb4) AS role,
        permissions
      FROM users
      WHERE id = ?
      `,
      [userId]
    );
    res.json({ success: true, message: '用户权限更新成功', data: rows?.[0] || null });
  } catch (error) {
    console.error('更新用户权限失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户权限失败',
      error: error.message
    });
  }
};

/**
 * 获取操作日志
 */
export const getOperationLogs = async (req, res) => {
  try {
    const { user_id, action, start_date, end_date, limit = 50, offset = 0 } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (user_id) {
      whereClause += ` AND rl.user_id = ?`;
      params.push(user_id);
    }

    if (action) {
      whereClause += ` AND rl.action = ?`;
      params.push(action);
    }

    if (start_date) {
      whereClause += ` AND rl.created_at >= ?`;
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ` AND rl.created_at <= ?`;
      params.push(end_date);
    }

    const lim = parseInt(limit);
    const off = parseInt(offset);
    const [rows] = await pool.execute(
      `
      SELECT 
        rl.id,
        rl.user_id,
        CONVERT(CAST(u.username AS BINARY) USING utf8mb4) AS username,
        CONVERT(CAST(rl.action AS BINARY) USING utf8mb4) AS action,
        CONVERT(CAST(rl.resource_type AS BINARY) USING utf8mb4) AS resource_type,
        rl.resource_id,
        CONVERT(CAST(rl.details AS BINARY) USING utf8mb4) AS details,
        CONVERT(CAST(rl.ip_address AS BINARY) USING utf8mb4) AS ip_address,
        rl.created_at
      FROM regulation_logs rl
      LEFT JOIN users u ON rl.user_id = u.id
      WHERE ${whereClause}
      ORDER BY rl.created_at DESC
      LIMIT ${Number.isFinite(lim) ? lim : 50} OFFSET ${Number.isFinite(off) ? off : 0}
      `,
      params
    );
    res.json({
      success: true,
      data: rows || [],
      pagination: { limit: Number.isFinite(lim) ? lim : 50, offset: Number.isFinite(off) ? off : 0 }
    });
  } catch (error) {
    console.error('获取操作日志失败:', error);
    res.status(500).json({
      success: false,
      message: '获取操作日志失败',
      error: error.message
    });
  }
};
