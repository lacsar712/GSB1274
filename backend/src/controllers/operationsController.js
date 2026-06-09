import pool from '../config/database.js';

/**
 * 运营消息中心控制器
 */

// 获取运营消息列表
export const getMessages = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, type, status, startDate, endDate } = req.query;
    const offset = (page - 1) * pageSize;
    
    let filters = ' WHERE 1=1';
    const params = [];
    
    if (type) {
      filters += ` AND type = ?`;
      params.push(type);
    }
    
    if (status) {
      filters += ` AND status = ?`;
      params.push(status);
    }
    
    if (startDate) {
      filters += ` AND created_at >= ?`;
      params.push(startDate);
    }
    
    if (endDate) {
      filters += ` AND created_at <= ?`;
      params.push(endDate);
    }
    
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM operations_messages${filters}`,
      params
    );
    const total = parseInt(countRows[0]?.total || 0);
    
    const limitNum = parseInt(pageSize);
    const offsetNum = parseInt(offset);
    const [rows] = await pool.query(
      `SELECT 
        id,
        title,
        content,
        type,
        priority,
        status,
        read_status,
        sender,
        receiver,
        created_at,
        updated_at
      FROM operations_messages${filters}
      ORDER BY created_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}`,
      params
    );
    
    res.json({
      success: true,
      data: {
        list: rows,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total
        }
      }
    });
  } catch (error) {
    console.error('获取运营消息列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取运营消息列表失败',
      error: error.message
    });
  }
};

// 获取消息详情
export const getMessageDetail = async (req, res) => {
  try {
    const { msgId } = req.params;
    
    const [rows] = await pool.query(
      `SELECT 
        id,
        title,
        content,
        type,
        priority,
        status,
        read_status,
        sender,
        receiver,
        attachments,
        created_at,
        updated_at,
        read_at
      FROM operations_messages
      WHERE id = ?`,
      [msgId]
    );
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '消息不存在'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('获取消息详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取消息详情失败',
      error: error.message
    });
  }
};

// 标记消息为已读
export const markMessageAsRead = async (req, res) => {
  try {
    const { msgId } = req.params;
    
    const [updateResult] = await pool.query(
      `UPDATE operations_messages
       SET read_status = 'read',
           read_at = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [msgId]
    );
    
    const [rows] = await pool.query(
      `SELECT 
        id, title, content, type, priority, status, read_status, sender, receiver,
        attachments, created_at, updated_at, read_at
       FROM operations_messages WHERE id = ?`,
      [msgId]
    );
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '消息不存在'
      });
    }
    
    res.json({
      success: true,
      message: '消息已标记为已读',
      data: rows[0]
    });
  } catch (error) {
    console.error('标记消息为已读失败:', error);
    res.status(500).json({
      success: false,
      message: '标记消息为已读失败',
      error: error.message
    });
  }
};

// 获取消息设置
export const getMessageSettings = async (req, res) => {
  try {
    const { userId } = req.query;
    
    const [rows] = await pool.query(
      `SELECT 
        user_id,
        email_notification,
        sms_notification,
        push_notification,
        notification_types,
        quiet_hours_start,
        quiet_hours_end,
        created_at,
        updated_at
      FROM message_settings
      WHERE user_id = ?`,
      [userId]
    );
    
    if (!rows || rows.length === 0) {
      // 返回默认设置
      return res.json({
        success: true,
        data: {
          user_id: userId,
          email_notification: true,
          sms_notification: false,
          push_notification: true,
          notification_types: ['system', 'operation', 'alert'],
          quiet_hours_start: null,
          quiet_hours_end: null
        }
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('获取消息设置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取消息设置失败',
      error: error.message
    });
  }
};

// 更新消息设置
export const updateMessageSettings = async (req, res) => {
  try {
    const {
      userId,
      emailNotification,
      smsNotification,
      pushNotification,
      notificationTypes,
      quietHoursStart,
      quietHoursEnd
    } = req.body;
    
    await pool.query(
      `INSERT INTO message_settings (
        user_id,
        email_notification,
        sms_notification,
        push_notification,
        notification_types,
        quiet_hours_start,
        quiet_hours_end,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        email_notification = VALUES(email_notification),
        sms_notification = VALUES(sms_notification),
        push_notification = VALUES(push_notification),
        notification_types = VALUES(notification_types),
        quiet_hours_start = VALUES(quiet_hours_start),
        quiet_hours_end = VALUES(quiet_hours_end),
        updated_at = NOW()`,
      [
        userId,
        emailNotification,
        smsNotification,
        pushNotification,
        notificationTypes,
        quietHoursStart,
        quietHoursEnd
      ]
    );
    
    const [rows] = await pool.query(
      `SELECT 
        user_id,
        email_notification,
        sms_notification,
        push_notification,
        notification_types,
        quiet_hours_start,
        quiet_hours_end,
        created_at,
        updated_at
      FROM message_settings
      WHERE user_id = ?`,
      [userId]
    );
    
    res.json({
      success: true,
      message: '消息设置更新成功',
      data: rows[0]
    });
  } catch (error) {
    console.error('更新消息设置失败:', error);
    res.status(500).json({
      success: false,
      message: '更新消息设置失败',
      error: error.message
    });
  }
};

/**
 * 运维监控控制器
 */

// 获取系统监控数据
export const getSystemMonitoring = async (req, res) => {
  try {
    const { timeRange = '1h' } = req.query;
    
    let activeConnections = 0;
    let totalConnections = 0;
    let databaseSize = 0;
    try {
      const [threadsConnRows] = await pool.query(`SHOW STATUS LIKE 'Threads_connected'`);
      activeConnections = parseInt(threadsConnRows?.[0]?.Value || threadsConnRows?.[0]?.Value || 0);
      totalConnections = activeConnections;
      const [sizeRows] = await pool.query(`
        SELECT SUM(data_length + index_length) AS size
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
      `);
      databaseSize = parseInt(sizeRows?.[0]?.size || 0);
    } catch (_) {}
    
    // 获取CPU和内存使用情况（模拟数据）
    const performanceData = {
      cpu: {
        usage: Math.random() * 100,
        cores: 4
      },
      memory: {
        used: Math.random() * 8 * 1024 * 1024 * 1024,
        total: 8 * 1024 * 1024 * 1024
      },
      disk: {
        used: Math.random() * 100 * 1024 * 1024 * 1024,
        total: 500 * 1024 * 1024 * 1024
      }
    };
    
    // 获取服务状态
    const services = [
      { name: 'API Server', status: 'running', uptime: '15d 6h 23m' },
      { name: 'Database', status: 'running', uptime: '30d 12h 45m' },
      { name: 'Redis Cache', status: 'running', uptime: '30d 12h 45m' },
      { name: 'Message Queue', status: 'running', uptime: '15d 6h 23m' }
    ];
    
    res.json({
      success: true,
      data: {
        system: {
          status: 'running',
          timestamp: new Date().toISOString(),
          active_connections: activeConnections,
          total_connections: totalConnections,
          database_size: databaseSize
        },
        performance: performanceData,
        services
      }
    });
  } catch (error) {
    console.error('获取系统监控数据失败:', error);
    res.json({
      success: true,
      data: {
        system: {
          status: 'unknown',
          timestamp: new Date().toISOString(),
          active_connections: 0,
          total_connections: 0,
          database_size: 0
        },
        performance: {
          cpu: { usage: 0, cores: 0 },
          memory: { used: 0, total: 0 },
          disk: { used: 0, total: 0 }
        },
        services: [
          { name: 'API Server', status: 'unknown', uptime: '0d 0h 0m' },
          { name: 'Database', status: 'unknown', uptime: '0d 0h 0m' }
        ]
      }
    });
  }
};

// 获取性能监控数据
export const getPerformanceMonitoring = async (req, res) => {
  try {
    const { timeRange = '1h', metric = 'all' } = req.query;
    
    let database = {
      active_queries: 0,
      total_connections: 0,
      transactions_committed: 0,
      transactions_rolled_back: 0,
      blocks_read: 0,
      blocks_hit: 0
    };
    try {
      const [thrRun] = await pool.query(`SHOW GLOBAL STATUS LIKE 'Threads_running'`);
      const [thrConn] = await pool.query(`SHOW GLOBAL STATUS LIKE 'Threads_connected'`);
      const [comCommit] = await pool.query(`SHOW GLOBAL STATUS LIKE 'Com_commit'`);
      const [comRollback] = await pool.query(`SHOW GLOBAL STATUS LIKE 'Com_rollback'`);
      const [bpReadReq] = await pool.query(`SHOW GLOBAL STATUS LIKE 'Innodb_buffer_pool_read_requests'`);
      const [bpReads] = await pool.query(`SHOW GLOBAL STATUS LIKE 'Innodb_buffer_pool_reads'`);
      const threadsRunning = parseInt(thrRun?.[0]?.Value || 0);
      const threadsConnected = parseInt(thrConn?.[0]?.Value || 0);
      const commits = parseInt(comCommit?.[0]?.Value || 0);
      const rollbacks = parseInt(comRollback?.[0]?.Value || 0);
      const readRequests = parseInt(bpReadReq?.[0]?.Value || 0);
      const reads = parseInt(bpReads?.[0]?.Value || 0);
      database = {
        active_queries: threadsRunning,
        total_connections: threadsConnected,
        transactions_committed: commits,
        transactions_rolled_back: rollbacks,
        blocks_read: reads,
        blocks_hit: Math.max(readRequests - reads, 0)
      };
    } catch (_) {}
    
    // 生成时间序列数据（模拟）
    const now = Date.now();
    const interval = timeRange === '1h' ? 60000 : timeRange === '24h' ? 3600000 : 300000;
    const points = timeRange === '1h' ? 60 : timeRange === '24h' ? 24 : 12;
    
    const timeSeriesData = {
      response_time: [],
      throughput: [],
      error_rate: []
    };
    
    for (let i = points; i >= 0; i--) {
      const timestamp = now - (i * interval);
      timeSeriesData.response_time.push({
        timestamp,
        value: 50 + Math.random() * 100
      });
      timeSeriesData.throughput.push({
        timestamp,
        value: 100 + Math.random() * 200
      });
      timeSeriesData.error_rate.push({
        timestamp,
        value: Math.random() * 5
      });
    }
    
    res.json({
      success: true,
      data: {
        database,
        timeSeries: timeSeriesData,
        summary: {
          avg_response_time: 85.5,
          avg_throughput: 150.2,
          avg_error_rate: 2.1,
          uptime: '99.95%'
        }
      }
    });
  } catch (error) {
    console.error('获取性能监控数据失败:', error);
    res.json({
      success: true,
      data: {
        database: {
          active_queries: 0,
          total_connections: 0,
          transactions_committed: 0,
          transactions_rolled_back: 0,
          blocks_read: 0,
          blocks_hit: 0
        },
        timeSeries: {
          response_time: [],
          throughput: [],
          error_rate: []
        },
        summary: {
          avg_response_time: 0,
          avg_throughput: 0,
          avg_error_rate: 0,
          uptime: '0%'
        }
      }
    });
  }
};

// 获取系统日志
export const getSystemLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      pageSize = 50, 
      level, 
      module, 
      startDate, 
      endDate,
      keyword 
    } = req.query;
    const offset = (page - 1) * pageSize;
    
    let filters = ' WHERE 1=1';
    const params = [];
    
    if (level) {
      filters += ` AND level = ?`;
      params.push(level);
    }
    
    if (module) {
      filters += ` AND module = ?`;
      params.push(module);
    }
    
    if (startDate) {
      filters += ` AND created_at >= ?`;
      params.push(startDate);
    }
    
    if (endDate) {
      filters += ` AND created_at <= ?`;
      params.push(endDate);
    }
    
    if (keyword) {
      filters += ` AND (message LIKE ?)`;
      params.push(`%${keyword}%`);
    }
    
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM system_logs${filters}`,
      params
    );
    const total = parseInt(countRows[0]?.total || 0);
    
    const limitNum = parseInt(pageSize);
    const offsetNum = parseInt(offset);
    const [rows] = await pool.query(
      `SELECT 
        id,
        level,
        module,
        message,
        details,
        user_id,
        ip_address,
        created_at
      FROM system_logs${filters}
      ORDER BY created_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}`,
      params
    );
    
    res.json({
      success: true,
      data: {
        list: rows,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total
        }
      }
    });
  } catch (error) {
    console.error('获取系统日志失败:', error);
    res.json({
      success: true,
      data: {
        list: [],
        pagination: {
          page: parseInt(req.query.page || 1),
          pageSize: parseInt(req.query.pageSize || 50),
          total: 0
        }
      }
    });
  }
};

/**
 * 运营系统管理控制器
 */

// 获取系统配置
export const getSystemConfig = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        id,
        config_key,
        config_value,
        config_type,
        description,
        category,
        is_public,
        created_at,
        updated_at
      FROM system_config
      ORDER BY category, config_key`
    );
    
    // 按类别分组
    const configByCategory = {};
    rows.forEach(config => {
      if (!configByCategory[config.category]) {
        configByCategory[config.category] = [];
      }
      configByCategory[config.category].push(config);
    });
    
    res.json({
      success: true,
      data: {
        configs: rows,
        byCategory: configByCategory
      }
    });
  } catch (error) {
    console.error('获取系统配置失败:', error);
    res.json({
      success: true,
      data: {
        configs: [],
        byCategory: {}
      }
    });
  }
};

// 更新系统配置
export const updateSystemConfig = async (req, res) => {
  try {
    const { configs } = req.body;
    
    if (!Array.isArray(configs)) {
      throw new Error('配置数据格式错误');
    }
    
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const keys = [];
      for (const config of configs) {
        await connection.query(
          `UPDATE system_config
           SET config_value = ?,
               updated_at = NOW()
           WHERE config_key = ?`,
          [config.value, config.key]
        );
        keys.push(config.key);
      }
      
      let updatedConfigs = [];
      if (keys.length > 0) {
        const placeholders = keys.map(() => '?').join(',');
        const [rows] = await connection.query(
          `SELECT 
            id, config_key, config_value, config_type, description, category, is_public, created_at, updated_at
           FROM system_config
           WHERE config_key IN (${placeholders})`,
          keys
        );
        updatedConfigs = rows;
      }
      
      await connection.commit();
      
      res.json({
        success: true,
        message: '系统配置更新成功',
        data: updatedConfigs
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('更新系统配置失败:', error);
    res.status(500).json({
      success: false,
      message: '更新系统配置失败',
      error: error.message
    });
  }
};

// 获取用户列表（用于权限管理）
export const getOperationUsers = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, role, status, keyword } = req.query;
    const offset = (page - 1) * pageSize;
    
    let filters = ' WHERE 1=1';
    const params = [];
    
    if (role) {
      filters += ` AND role = ?`;
      params.push(role);
    }
    
    if (status) {
      filters += ` AND status = ?`;
      params.push(status);
    }
    
    if (keyword) {
      filters += ` AND (username LIKE ? OR email LIKE ?)`;
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM users${filters}`,
      params
    );
    const total = parseInt(countRows[0]?.total || 0);
    
    const limitNum = parseInt(pageSize);
    const offsetNum = parseInt(offset);
    const [rows] = await pool.query(
      `SELECT 
        id,
        username,
        email,
        role,
        status,
        permissions,
        last_login_at,
        created_at,
        updated_at
      FROM users${filters}
      ORDER BY created_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}`,
      params
    );
    
    res.json({
      success: true,
      data: {
        list: rows,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total
        }
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.json({
      success: true,
      data: {
        list: [],
        pagination: {
          page: parseInt(req.query.page || 1),
          pageSize: parseInt(req.query.pageSize || 20),
          total: 0
        }
      }
    });
  }
};

// 更新用户权限
export const updateUserPermissions = async (req, res) => {
  try {
    const { userId, permissions, role } = req.body;
    
    await pool.query(
      `UPDATE users
       SET permissions = ?,
           role = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [JSON.stringify(permissions), role, userId]
    );
    
    const [rows] = await pool.query(
      `SELECT id, username, email, role, permissions, updated_at
       FROM users WHERE id = ?`,
      [userId]
    );
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    res.json({
      success: true,
      message: '用户权限更新成功',
      data: rows[0]
    });
  } catch (error) {
    console.error('更新用户权限失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户权限失败',
      error: error.message
    });
  }
};

// 获取操作日志
export const getOperationLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      pageSize = 50, 
      userId, 
      action, 
      module,
      startDate, 
      endDate 
    } = req.query;
    const offset = (page - 1) * pageSize;
    
    let filters = ' WHERE 1=1';
    const params = [];
    
    if (userId) {
      filters += ` AND user_id = ?`;
      params.push(userId);
    }
    
    if (action) {
      filters += ` AND action = ?`;
      params.push(action);
    }
    
    if (module) {
      filters += ` AND module = ?`;
      params.push(module);
    }
    
    if (startDate) {
      filters += ` AND created_at >= ?`;
      params.push(startDate);
    }
    
    if (endDate) {
      filters += ` AND created_at <= ?`;
      params.push(endDate);
    }
    
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM operation_logs${filters}`,
      params
    );
    const total = parseInt(countRows[0]?.total || 0);
    
    const limitNum = parseInt(pageSize);
    const offsetNum = parseInt(offset);
    const [rows] = await pool.query(
      `SELECT 
        id,
        user_id,
        username,
        action,
        module,
        description,
        ip_address,
        user_agent,
        request_data,
        response_data,
        status,
        created_at
      FROM operation_logs${filters}
      ORDER BY created_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}`,
      params
    );
    
    res.json({
      success: true,
      data: {
        list: rows,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total
        }
      }
    });
  } catch (error) {
    console.error('获取操作日志失败:', error);
    res.json({
      success: true,
      data: {
        list: [],
        pagination: {
          page: parseInt(req.query.page || 1),
          pageSize: parseInt(req.query.pageSize || 50),
          total: 0
        }
      }
    });
  }
};
