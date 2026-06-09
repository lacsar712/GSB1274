import pool from '../config/database.js';

class VehicleSafety {
  // 创建车辆安全记录
  static async create(safetyData) {
    const {
      vehicle_id,
      vehicle_no,
      company_id,
      company_name,
      event_type,
      event_level,
      event_time,
      location,
      latitude,
      longitude,
      speed,
      description,
      driver_id,
      driver_name,
      status,
      created_by
    } = safetyData;

    const [result] = await pool.execute(
      `INSERT INTO vehicle_safety (
        vehicle_id, vehicle_no, company_id, company_name, event_type, event_level,
        event_time, location, latitude, longitude, speed, description,
        driver_id, driver_name, status, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        vehicle_id, vehicle_no, company_id, company_name, event_type, event_level,
        event_time, location, latitude, longitude, speed, description,
        driver_id, driver_name, status || 'pending', created_by
      ]
    );

    return result.insertId;
  }

  // 获取车辆安全记录列表
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        id,
        vehicle_id,
        CONVERT(CAST(vehicle_no AS BINARY) USING utf8mb4) AS vehicle_no,
        company_id,
        CONVERT(CAST(company_name AS BINARY) USING utf8mb4) AS company_name,
        CONVERT(CAST(event_type AS BINARY) USING utf8mb4) AS event_type,
        CONVERT(CAST(event_level AS BINARY) USING utf8mb4) AS event_level,
        event_time,
        CONVERT(CAST(location AS BINARY) USING utf8mb4) AS location,
        latitude,
        longitude,
        speed,
        CONVERT(CAST(description AS BINARY) USING utf8mb4) AS description,
        driver_id,
        CONVERT(CAST(driver_name AS BINARY) USING utf8mb4) AS driver_name,
        CONVERT(CAST(status AS BINARY) USING utf8mb4) AS status,
        CONVERT(CAST(handle_result AS BINARY) USING utf8mb4) AS handle_result,
        handled_by,
        handled_at,
        created_by,
        created_at,
        updated_at
      FROM vehicle_safety
      WHERE 1=1
    `;
    const params = [];

    if (filters.vehicle_id) {
      query += ' AND vehicle_id = ?';
      params.push(filters.vehicle_id);
    }

    if (filters.company_id) {
      query += ' AND company_id = ?';
      params.push(filters.company_id);
    }

    if (filters.event_type) {
      query += ' AND event_type = ?';
      params.push(filters.event_type);
    }

    if (filters.event_level) {
      query += ' AND event_level = ?';
      params.push(filters.event_level);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.start_date) {
      query += ' AND DATE(event_time) >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND DATE(event_time) <= ?';
      params.push(filters.end_date);
    }

    if (filters.keyword) {
      query += ' AND (vehicle_no LIKE ? OR driver_name LIKE ? OR location LIKE ?)';
      const keyword = `%${filters.keyword}%`;
      params.push(keyword, keyword, keyword);
    }

    query += ' ORDER BY event_time DESC';

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

  // 获取车辆安全记录总数
  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) as total FROM vehicle_safety WHERE 1=1';
    const params = [];

    if (filters.vehicle_id) {
      query += ' AND vehicle_id = ?';
      params.push(filters.vehicle_id);
    }

    if (filters.company_id) {
      query += ' AND company_id = ?';
      params.push(filters.company_id);
    }

    if (filters.event_type) {
      query += ' AND event_type = ?';
      params.push(filters.event_type);
    }

    if (filters.event_level) {
      query += ' AND event_level = ?';
      params.push(filters.event_level);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.start_date) {
      query += ' AND DATE(event_time) >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND DATE(event_time) <= ?';
      params.push(filters.end_date);
    }

    if (filters.keyword) {
      query += ' AND (vehicle_no LIKE ? OR driver_name LIKE ? OR location LIKE ?)';
      const keyword = `%${filters.keyword}%`;
      params.push(keyword, keyword, keyword);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  // 根据ID获取车辆安全记录
  static async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT 
        id,
        vehicle_id,
        CONVERT(CAST(vehicle_no AS BINARY) USING utf8mb4) AS vehicle_no,
        company_id,
        CONVERT(CAST(company_name AS BINARY) USING utf8mb4) AS company_name,
        CONVERT(CAST(event_type AS BINARY) USING utf8mb4) AS event_type,
        CONVERT(CAST(event_level AS BINARY) USING utf8mb4) AS event_level,
        event_time,
        CONVERT(CAST(location AS BINARY) USING utf8mb4) AS location,
        latitude,
        longitude,
        speed,
        CONVERT(CAST(description AS BINARY) USING utf8mb4) AS description,
        driver_id,
        CONVERT(CAST(driver_name AS BINARY) USING utf8mb4) AS driver_name,
        CONVERT(CAST(status AS BINARY) USING utf8mb4) AS status,
        CONVERT(CAST(handle_result AS BINARY) USING utf8mb4) AS handle_result,
        handled_by,
        handled_at,
        created_by,
        created_at,
        updated_at
      FROM vehicle_safety
      WHERE id = ?
      `,
      [id]
    );
    return rows[0];
  }

  // 更新车辆安全记录
  static async update(id, safetyData) {
    const fields = [];
    const values = [];

    Object.keys(safetyData).forEach(key => {
      if (safetyData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(safetyData[key]);
      }
    });

    if (fields.length === 0) {
      return false;
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    const [result] = await pool.execute(
      `UPDATE vehicle_safety SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // 更新处理状态
  static async updateStatus(id, status, handleResult, handledBy) {
    const [result] = await pool.execute(
      `UPDATE vehicle_safety SET 
        status = ?, 
        handle_result = ?,
        handled_by = ?,
        handled_at = NOW(),
        updated_at = NOW() 
      WHERE id = ?`,
      [status, handleResult, handledBy, id]
    );
    return result.affectedRows > 0;
  }

  // 删除车辆安全记录
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM vehicle_safety WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // 获取车辆安全统计数据
  static async getStatistics(filters = {}) {
    let query = `
      SELECT 
        COUNT(*) as total_events,
        SUM(CASE WHEN event_level = 'critical' THEN 1 ELSE 0 END) as critical_events,
        SUM(CASE WHEN event_level = 'high' THEN 1 ELSE 0 END) as high_events,
        SUM(CASE WHEN event_level = 'medium' THEN 1 ELSE 0 END) as medium_events,
        SUM(CASE WHEN event_level = 'low' THEN 1 ELSE 0 END) as low_events,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_events,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_events,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_events,
        COUNT(DISTINCT vehicle_id) as affected_vehicles,
        COUNT(DISTINCT driver_id) as affected_drivers
      FROM vehicle_safety 
      WHERE 1=1
    `;
    const params = [];

    if (filters.company_id) {
      query += ' AND company_id = ?';
      params.push(filters.company_id);
    }

    if (filters.start_date) {
      query += ' AND DATE(event_time) >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND DATE(event_time) <= ?';
      params.push(filters.end_date);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0];
  }

  // 获取事件类型分布
  static async getEventTypeDistribution(filters = {}) {
    let query = `
      SELECT 
        event_type,
        COUNT(*) as count
      FROM vehicle_safety 
      WHERE 1=1
    `;
    const params = [];

    if (filters.company_id) {
      query += ' AND company_id = ?';
      params.push(filters.company_id);
    }

    if (filters.start_date) {
      query += ' AND DATE(event_time) >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND DATE(event_time) <= ?';
      params.push(filters.end_date);
    }

    query += ' GROUP BY event_type ORDER BY count DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // 获取趋势数据
  static async getTrendData(filters = {}) {
    let query = `
      SELECT 
        DATE(event_time) as date,
        COUNT(*) as event_count,
        SUM(CASE WHEN event_level = 'critical' THEN 1 ELSE 0 END) as critical_count,
        SUM(CASE WHEN event_level = 'high' THEN 1 ELSE 0 END) as high_count
      FROM vehicle_safety 
      WHERE 1=1
    `;
    const params = [];

    if (filters.company_id) {
      query += ' AND company_id = ?';
      params.push(filters.company_id);
    }

    if (filters.start_date) {
      query += ' AND DATE(event_time) >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND DATE(event_time) <= ?';
      params.push(filters.end_date);
    }

    query += ' GROUP BY DATE(event_time) ORDER BY date DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // 获取车辆实时位置
  static async getVehicleLocations(filters = {}) {
    let query = `
      SELECT 
        vs.vehicle_id,
        CONVERT(CAST(vs.vehicle_no AS BINARY) USING utf8mb4) AS vehicle_no,
        vs.latitude,
        vs.longitude,
        CONVERT(CAST(vs.location AS BINARY) USING utf8mb4) AS location,
        vs.speed,
        vs.event_time,
        CONVERT(CAST(vs.driver_name AS BINARY) USING utf8mb4) AS driver_name
      FROM vehicle_safety vs
      JOIN (
        SELECT vehicle_id, MAX(event_time) AS max_time
        FROM vehicle_safety
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        GROUP BY vehicle_id
      ) t ON vs.vehicle_id = t.vehicle_id AND vs.event_time = t.max_time
      WHERE 1=1
    `;
    const params = [];

    if (filters.company_id) {
      query += ' AND vs.company_id = ?';
      params.push(filters.company_id);
    }

    query += ' ORDER BY vs.vehicle_id, vs.event_time DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // 获取未处理预警列表（仅返回 is_handled = 0）
  static async findAlerts(filters = {}) {
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

    if (filters.alert_level) {
      query += ' AND alert_level = ?';
      params.push(filters.alert_level);
    }

    query += ' ORDER BY alert_time DESC';

    if (filters.limit) {
      const lim = parseInt(filters.limit);
      query += ` LIMIT ${lim}`;
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // 获取未处理预警总数
  static async countUnhandledAlerts(filters = {}) {
    let query = 'SELECT COUNT(*) AS total FROM vehicle_safety_alerts WHERE is_handled = 0';
    const params = [];

    if (filters.vehicle_id) {
      query += ' AND vehicle_id = ?';
      params.push(filters.vehicle_id);
    }

    if (filters.alert_level) {
      query += ' AND alert_level = ?';
      params.push(filters.alert_level);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  // 标记预警为已处理
  static async markAlertHandled(id) {
    const [result] = await pool.execute(
      `UPDATE vehicle_safety_alerts SET 
        is_handled = 1,
        handled_at = NOW()
      WHERE id = ? AND is_handled = 0`,
      [id]
    );
    return result.affectedRows > 0;
  }

  // 根据ID获取预警
  static async findAlertById(id) {
    const [rows] = await pool.execute(
      `SELECT 
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
      WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  // 获取高风险车辆列表
  static async getHighRiskVehicles(filters = {}) {
    let query = `
      SELECT 
        vehicle_id,
        CONVERT(CAST(vehicle_no AS BINARY) USING utf8mb4) AS vehicle_no,
        CONVERT(CAST(company_name AS BINARY) USING utf8mb4) AS company_name,
        COUNT(*) as event_count,
        SUM(CASE WHEN event_level IN ('critical', 'high') THEN 1 ELSE 0 END) as high_risk_count,
        MAX(event_time) as last_event_time
      FROM vehicle_safety 
      WHERE 1=1
    `;
    const params = [];

    if (filters.company_id) {
      query += ' AND company_id = ?';
      params.push(filters.company_id);
    }

    if (filters.start_date) {
      query += ' AND DATE(event_time) >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND DATE(event_time) <= ?';
      params.push(filters.end_date);
    }

    query += ' GROUP BY vehicle_id, vehicle_no, company_name';
    query += ' HAVING high_risk_count > 0';
    query += ' ORDER BY high_risk_count DESC, event_count DESC';

    if (filters.limit) {
      const lim = parseInt(filters.limit);
      query += ` LIMIT ${lim}`;
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }
}

export default VehicleSafety;
