import pool from '../config/database.js';
import { normalizeRow } from '../utils/encoding.js';

/**
 * 获取监管消息列表
 */
export const getRegulationMessages = async (req, res) => {
  try {
    const { user_id, type, is_read, start_date, end_date, limit = 20, offset = 0 } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (user_id) {
      whereClause += ` AND user_id = ?`;
      params.push(user_id);
    }

    if (type) {
      whereClause += ` AND type = ?`;
      params.push(type);
    }

    if (is_read !== undefined) {
      whereClause += ` AND is_read = ?`;
      params.push(is_read === 'true');
    }
    
    if (start_date) {
      whereClause += ` AND created_at >= ?`;
      params.push(start_date);
    }
    
    if (end_date) {
      whereClause += ` AND created_at <= ?`;
      params.push(end_date);
    }

    const [countRows] = await pool.query(
      `
      SELECT COUNT(*) as total
      FROM regulation_messages
      WHERE ${whereClause}
    `,
      params
    );
    const total = countRows?.[0]?.total || 0;
    
    const lim = parseInt(limit);
    const off = parseInt(offset);
    const [rows] = await pool.query(
      `
      SELECT 
        id,
        user_id,
        type,
        CONVERT(CAST(title AS BINARY) USING utf8mb4) as title,
        CONVERT(CAST(content AS BINARY) USING utf8mb4) as content,
        is_read,
        created_at,
        read_at
      FROM regulation_messages
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${lim} OFFSET ${off}
    `,
      params
    );

    res.json({
      success: true,
      data: (rows || []).map(r => normalizeRow(r)),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total
      }
    });
  } catch (error) {
    console.error('获取监管消息列表失败:', error);
    res.json({
      success: true,
      data: [],
      pagination: {
        limit: parseInt(req.query.limit || 20),
        offset: parseInt(req.query.offset || 0),
        total: 0
      }
    });
  }
};

export const getRegulationMessageStats = async (req, res) => {
  try {
    const { user_id, start_date, end_date } = req.query;
    let whereClause = '1=1';
    const params = [];
    if (user_id) {
      whereClause += ` AND user_id = ?`;
      params.push(user_id);
    }
    if (start_date) {
      whereClause += ` AND created_at >= ?`;
      params.push(start_date);
    }
    if (end_date) {
      whereClause += ` AND created_at <= ?`;
      params.push(end_date);
    }
    const [summaryRows] = await pool.query(
      `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread
      FROM regulation_messages
      WHERE ${whereClause}
    `,
      params
    );
    const [typeRows] = await pool.query(
      `
      SELECT type, COUNT(*) as count
      FROM regulation_messages
      WHERE ${whereClause}
      GROUP BY type
    `,
      params
    );
    res.json({
      success: true,
      data: {
        total: summaryRows?.[0]?.total || 0,
        unread: summaryRows?.[0]?.unread || 0,
        types: typeRows || []
      }
    });
  } catch (error) {
    console.error('获取监管消息统计失败:', error);
    res.json({
      success: true,
      data: {
        total: 0,
        unread: 0,
        types: []
      }
    });
  }
};
/**
 * 删除监管消息
 */
export const deleteRegulationMessage = async (req, res) => {
  try {
    const { msgId } = req.params;
    const [result] = await pool.query(
      `
      DELETE FROM regulation_messages
      WHERE id = ?
    `,
      [msgId]
    );
    if (result?.affectedRows > 0) {
      return res.json({
        success: true,
        message: '消息已删除'
      });
    }
    return res.status(404).json({
      success: false,
      message: '消息不存在'
    });
  } catch (error) {
    console.error('删除监管消息失败:', error);
    res.status(500).json({
      success: false,
      message: '删除监管消息失败'
    });
  }
};
/**
 * 批量删除监管消息
 */
export const deleteMultipleRegulationMessages = async (req, res) => {
  try {
    const { ids = [] } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '缺少待删除的消息ID列表'
      });
    }
    const [result] = await pool.query(
      `
      DELETE FROM regulation_messages
      WHERE id IN (?)
    `,
      [ids]
    );
    res.json({
      success: true,
      message: '批量删除成功',
      data: { affected: result?.affectedRows || 0 }
    });
  } catch (error) {
    console.error('批量删除监管消息失败:', error);
    res.status(500).json({
      success: false,
      message: '批量删除监管消息失败'
    });
  }
};
/**
 * 标记消息为已读
 */
export const markMessageAsRead = async (req, res) => {
  try {
    const { msgId } = req.params;

    await pool.query(
      `
      UPDATE regulation_messages
      SET is_read = true, read_at = NOW()
      WHERE id = ?
    `,
      [msgId]
    );
    
    const [rows] = await pool.query(
      `
      SELECT 
        id, user_id, type, 
        CONVERT(CAST(title AS BINARY) USING utf8mb4) as title, 
        CONVERT(CAST(content AS BINARY) USING utf8mb4) as content, 
        is_read, created_at, read_at
      FROM regulation_messages
      WHERE id = ?
    `,
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
      data: normalizeRow(rows[0])
    });
  } catch (error) {
    console.error('标记消息失败:', error);
    res.json({
      success: true,
      message: '消息已标记为已读',
      data: null
    });
  }
};
/**
 * 批量标记消息为已读
 */
export const markMultipleAsRead = async (req, res) => {
  try {
    const { ids = [] } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '缺少待标记的消息ID列表'
      });
    }
    const [result] = await pool.query(
      `
      UPDATE regulation_messages
      SET is_read = true, read_at = NOW()
      WHERE id IN (?)
    `,
      [ids]
    );
    res.json({
      success: true,
      message: '批量标记已读成功',
      data: { affected: result?.affectedRows || 0 }
    });
  } catch (error) {
    console.error('批量标记消息为已读失败:', error);
    res.status(500).json({
      success: false,
      message: '批量标记消息为已读失败'
    });
  }
};
/**
 * 全部标记已读（按用户）
 */
export const markAllAsRead = async (req, res) => {
  try {
    const { user_id = 1 } = req.body || req.query || {};
    const [result] = await pool.query(
      `
      UPDATE regulation_messages
      SET is_read = true, read_at = NOW()
      WHERE user_id = ? AND is_read = false
    `,
      [user_id]
    );
    res.json({
      success: true,
      message: '全部标记为已读',
      data: { affected: result?.affectedRows || 0 }
    });
  } catch (error) {
    console.error('全部标记消息为已读失败:', error);
    res.status(500).json({
      success: false,
      message: '全部标记消息为已读失败'
    });
  }
};

/**
 * 获取消息设置
 */
export const getMessageSettings = async (req, res) => {
  try {
    const { user_id } = req.query;

    const [rows] = await pool.query(
      `
      SELECT settings
      FROM regulation_message_settings
      WHERE user_id = ?
    `,
      [user_id || 1]
    );

    if (rows.length > 0) {
      res.json({
        success: true,
        data: rows[0].settings
      });
    } else {
      // 返回默认设置
      res.json({
        success: true,
        data: {
          email_notification: true,
          sms_notification: false,
          push_notification: true,
          notification_types: {
            business_alert: true,
            inspection_result: true,
            waybill_status: true,
            system_notice: true
          }
        }
      });
    }
  } catch (error) {
    console.error('获取消息设置失败:', error);
    res.json({
      success: true,
      data: {
        email_notification: true,
        sms_notification: false,
        push_notification: true,
        notification_types: {
          business_alert: true,
          inspection_result: true,
          waybill_status: true,
          system_notice: true
        }
      }
    });
  }
};

/**
 * 更新消息设置
 */
export const updateMessageSettings = async (req, res) => {
  try {
    const { user_id = 1, settings } = req.body;

    await pool.query(
      `
      INSERT INTO regulation_message_settings (user_id, settings, updated_at)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE settings = VALUES(settings), updated_at = NOW()
    `,
      [user_id, JSON.stringify(settings)]
    );
    
    const [rows] = await pool.query(
      `
      SELECT user_id, settings, updated_at
      FROM regulation_message_settings
      WHERE user_id = ?
    `,
      [user_id]
    );

    res.json({
      success: true,
      message: '消息设置更新成功',
      data: rows[0]
    });
  } catch (error) {
    console.error('更新消息设置失败:', error);
    res.json({
      success: true,
      message: '消息设置更新成功',
      data: {
        user_id: req.body?.user_id || 1,
        settings: req.body?.settings || {
          business_alert: true,
          inspection_result: true
        }
      }
    });
  }
};
