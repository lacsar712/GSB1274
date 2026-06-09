import pool from '../config/database.js';

class VehicleSafetyAlert {
  static async findUnhandled(filters = {}) {
    let query = `
      SELECT 
        id,
        vehicle_id,
        CONVERT(CAST(vehicle_no AS BINARY) USING utf8mb4) AS vehicle_no,
        CONVERT(CAST(alert_type AS BINARY) USING utf8mb4) AS alert_type,
        CONVERT(CAST(alert_level AS BINARY) USING utf8mb4) AS alert_level,
        CONVERT(CAST(alert_content AS BINARY) USING utf8mb4) AS alert_content,
        alert_time,
        is_read,
        is_handled,
        handled_at,
        created_at
      FROM vehicle_safety_alerts
      WHERE is_handled = 0
    `;
    const params = [];

    if (filters.vehicle_id) {
      query += ' AND vehicle_id = ?';
      params.push(filters.vehicle_id);
    }

    if (filters.alert_type) {
      query += ' AND alert_type = ?';
      params.push(filters.alert_type);
    }

    if (filters.alert_level) {
      query += ' AND alert_level = ?';
      params.push(filters.alert_level);
    }

    query += ' ORDER BY alert_time DESC';

    if (filters.limit) {
      const lim = parseInt(filters.limit);
      if (filters.offset) {
        const off = parseInt(filters.offset);
        query += ` LIMIT ${lim} OFFSET ${off}`;
      } else {
        query += ` LIMIT ${lim}`;
      }
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async countUnhandled(filters = {}) {
    let query = 'SELECT COUNT(*) as total FROM vehicle_safety_alerts WHERE is_handled = 0';
    const params = [];

    if (filters.vehicle_id) {
      query += ' AND vehicle_id = ?';
      params.push(filters.vehicle_id);
    }

    if (filters.alert_type) {
      query += ' AND alert_type = ?';
      params.push(filters.alert_type);
    }

    if (filters.alert_level) {
      query += ' AND alert_level = ?';
      params.push(filters.alert_level);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT 
        id,
        vehicle_id,
        CONVERT(CAST(vehicle_no AS BINARY) USING utf8mb4) AS vehicle_no,
        CONVERT(CAST(alert_type AS BINARY) USING utf8mb4) AS alert_type,
        CONVERT(CAST(alert_level AS BINARY) USING utf8mb4) AS alert_level,
        CONVERT(CAST(alert_content AS BINARY) USING utf8mb4) AS alert_content,
        alert_time,
        is_read,
        is_handled,
        handled_at,
        created_at
      FROM vehicle_safety_alerts
      WHERE id = ?
      `,
      [id]
    );
    return rows[0];
  }

  static async markAsHandled(id) {
    const [result] = await pool.execute(
      `UPDATE vehicle_safety_alerts SET 
        is_handled = 1,
        handled_at = NOW()
      WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default VehicleSafetyAlert;
