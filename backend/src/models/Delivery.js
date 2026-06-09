import pool from '../config/database.js';

let HAS_COMPANY_ID = null;
const ensureCompanyIdSupport = async () => {
  if (HAS_COMPANY_ID === null) {
    try {
      const [rows] = await pool.execute("SHOW COLUMNS FROM deliveries LIKE 'company_id'");
      HAS_COMPANY_ID = rows && rows.length > 0;
    } catch (e) {
      HAS_COMPANY_ID = false;
    }
  }
  return HAS_COMPANY_ID;
};

class Delivery {
  // 创建配送订单
  static async create(deliveryData) {
    const {
      order_no,
      company_id,
      hub_id,
      hub_name,
      sender_name,
      sender_phone,
      sender_address,
      receiver_name,
      receiver_phone,
      receiver_address,
      receiver_lat,
      receiver_lng,
      goods_type,
      goods_weight,
      goods_volume,
      delivery_type,
      scheduled_time,
      remark,
      created_by
    } = deliveryData;

    const hasCompanyId = await ensureCompanyIdSupport();
    let sql;
    let args;
    if (hasCompanyId) {
      sql = `INSERT INTO deliveries (
        order_no, company_id, hub_id, hub_name, sender_name, sender_phone, sender_address,
        receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
        goods_type, goods_weight, goods_volume, delivery_type, scheduled_time,
        status, remark, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, NOW())`;
      args = [
        order_no, company_id, hub_id, hub_name, sender_name, sender_phone, sender_address,
        receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
        goods_type, goods_weight, goods_volume, delivery_type, scheduled_time,
        remark, created_by
      ];
    } else {
      sql = `INSERT INTO deliveries (
        order_no, hub_id, hub_name, sender_name, sender_phone, sender_address,
        receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
        goods_type, goods_weight, goods_volume, delivery_type, scheduled_time,
        status, remark, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, NOW())`;
      args = [
        order_no, hub_id, hub_name, sender_name, sender_phone, sender_address,
        receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
        goods_type, goods_weight, goods_volume, delivery_type, scheduled_time,
        remark, created_by
      ];
    }
    const [result] = await pool.execute(sql, args);

    return result.insertId;
  }

  // 获取配送订单列表
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        id,
        order_no,
        company_id,
        hub_id,
        CONVERT(CAST(hub_name AS BINARY) USING utf8mb4) AS hub_name,
        CONVERT(CAST(sender_name AS BINARY) USING utf8mb4) AS sender_name,
        CONVERT(CAST(sender_phone AS BINARY) USING utf8mb4) AS sender_phone,
        CONVERT(CAST(sender_address AS BINARY) USING utf8mb4) AS sender_address,
        CONVERT(CAST(receiver_name AS BINARY) USING utf8mb4) AS receiver_name,
        CONVERT(CAST(receiver_phone AS BINARY) USING utf8mb4) AS receiver_phone,
        CONVERT(CAST(receiver_address AS BINARY) USING utf8mb4) AS receiver_address,
        receiver_lat,
        receiver_lng,
        CONVERT(CAST(goods_type AS BINARY) USING utf8mb4) AS goods_type,
        goods_weight,
        goods_volume,
        delivery_type,
        scheduled_time,
        CONVERT(CAST(status AS BINARY) USING utf8mb4) AS status,
        CONVERT(CAST(remark AS BINARY) USING utf8mb4) AS remark,
        driver_id,
        CONVERT(CAST(driver_name AS BINARY) USING utf8mb4) AS driver_name,
        assigned_at,
        completed_at,
        created_by,
        created_at,
        updated_by,
        updated_at
      FROM deliveries
      WHERE 1=1
    `;
    const params = [];

    if (filters.company_id && await ensureCompanyIdSupport()) {
      query += ' AND company_id = ?';
      params.push(filters.company_id);
    }

    if (filters.hub_id) {
      query += ' AND hub_id = ?';
      params.push(filters.hub_id);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.delivery_type) {
      query += ' AND delivery_type = ?';
      params.push(filters.delivery_type);
    }

    if (filters.start_date) {
      query += ' AND DATE(created_at) >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND DATE(created_at) <= ?';
      params.push(filters.end_date);
    }

    if (filters.keyword) {
      query += ' AND (order_no LIKE ? OR receiver_name LIKE ? OR receiver_phone LIKE ?)';
      const keyword = `%${filters.keyword}%`;
      params.push(keyword, keyword, keyword);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      const lim = parseInt(filters.limit);
      const off = filters.offset ? parseInt(filters.offset) : undefined;
      if (Number.isFinite(lim)) {
        query += ` LIMIT ${lim}`;
        if (Number.isFinite(off)) {
          query += ` OFFSET ${off}`;
        }
      }
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // 获取配送订单总数
  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) as total FROM deliveries WHERE 1=1';
    const params = [];

    if (filters.company_id && await ensureCompanyIdSupport()) {
      query += ' AND company_id = ?';
      params.push(filters.company_id);
    }

    if (filters.hub_id) {
      query += ' AND hub_id = ?';
      params.push(filters.hub_id);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.delivery_type) {
      query += ' AND delivery_type = ?';
      params.push(filters.delivery_type);
    }

    if (filters.start_date) {
      query += ' AND DATE(created_at) >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND DATE(created_at) <= ?';
      params.push(filters.end_date);
    }

    if (filters.keyword) {
      query += ' AND (order_no LIKE ? OR receiver_name LIKE ? OR receiver_phone LIKE ?)';
      const keyword = `%${filters.keyword}%`;
      params.push(keyword, keyword, keyword);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  // 根据ID获取配送订单
  static async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT 
        id,
        order_no,
        company_id,
        hub_id,
        CONVERT(CAST(hub_name AS BINARY) USING utf8mb4) AS hub_name,
        CONVERT(CAST(sender_name AS BINARY) USING utf8mb4) AS sender_name,
        CONVERT(CAST(sender_phone AS BINARY) USING utf8mb4) AS sender_phone,
        CONVERT(CAST(sender_address AS BINARY) USING utf8mb4) AS sender_address,
        CONVERT(CAST(receiver_name AS BINARY) USING utf8mb4) AS receiver_name,
        CONVERT(CAST(receiver_phone AS BINARY) USING utf8mb4) AS receiver_phone,
        CONVERT(CAST(receiver_address AS BINARY) USING utf8mb4) AS receiver_address,
        receiver_lat,
        receiver_lng,
        CONVERT(CAST(goods_type AS BINARY) USING utf8mb4) AS goods_type,
        goods_weight,
        goods_volume,
        delivery_type,
        scheduled_time,
        CONVERT(CAST(status AS BINARY) USING utf8mb4) AS status,
        CONVERT(CAST(remark AS BINARY) USING utf8mb4) AS remark,
        driver_id,
        CONVERT(CAST(driver_name AS BINARY) USING utf8mb4) AS driver_name,
        assigned_at,
        completed_at,
        created_by,
        created_at,
        updated_by,
        updated_at
      FROM deliveries
      WHERE id = ?
      `,
      [id]
    );
    return rows[0];
  }

  // 根据订单号获取配送订单
  static async findByOrderNo(orderNo) {
    const [rows] = await pool.execute(
      `
      SELECT 
        id,
        order_no,
        company_id,
        hub_id,
        CONVERT(CAST(hub_name AS BINARY) USING utf8mb4) AS hub_name,
        CONVERT(CAST(sender_name AS BINARY) USING utf8mb4) AS sender_name,
        CONVERT(CAST(sender_phone AS BINARY) USING utf8mb4) AS sender_phone,
        CONVERT(CAST(sender_address AS BINARY) USING utf8mb4) AS sender_address,
        CONVERT(CAST(receiver_name AS BINARY) USING utf8mb4) AS receiver_name,
        CONVERT(CAST(receiver_phone AS BINARY) USING utf8mb4) AS receiver_phone,
        CONVERT(CAST(receiver_address AS BINARY) USING utf8mb4) AS receiver_address,
        receiver_lat,
        receiver_lng,
        CONVERT(CAST(goods_type AS BINARY) USING utf8mb4) AS goods_type,
        goods_weight,
        goods_volume,
        delivery_type,
        scheduled_time,
        CONVERT(CAST(status AS BINARY) USING utf8mb4) AS status,
        CONVERT(CAST(remark AS BINARY) USING utf8mb4) AS remark,
        driver_id,
        CONVERT(CAST(driver_name AS BINARY) USING utf8mb4) AS driver_name,
        assigned_at,
        completed_at,
        created_by,
        created_at,
        updated_by,
        updated_at
      FROM deliveries
      WHERE order_no = ?
      `,
      [orderNo]
    );
    return rows[0];
  }

  // 更新配送订单
  static async update(id, deliveryData) {
    const fields = [];
    const values = [];

    Object.keys(deliveryData).forEach(key => {
      if (deliveryData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(deliveryData[key]);
      }
    });

    if (fields.length === 0) {
      return false;
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    const [result] = await pool.execute(
      `UPDATE deliveries SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // 更新配送状态
  static async updateStatus(id, status, updatedBy) {
    const [result] = await pool.execute(
      'UPDATE deliveries SET status = ?, updated_by = ?, updated_at = NOW() WHERE id = ?',
      [status, updatedBy, id]
    );
    return result.affectedRows > 0;
  }

  // 分配配送员
  static async assignDriver(id, driverId, driverName, updatedBy) {
    const [result] = await pool.execute(
      `UPDATE deliveries SET 
        driver_id = ?, 
        driver_name = ?, 
        status = 'assigned',
        assigned_at = NOW(),
        updated_by = ?,
        updated_at = NOW() 
      WHERE id = ?`,
      [driverId, driverName, updatedBy, id]
    );
    return result.affectedRows > 0;
  }

  // 删除配送订单
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM deliveries WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // 获取配送统计数据
  static async getStatistics(filters = {}) {
    let query = `
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) as assigned_orders,
        SUM(CASE WHEN status = 'picking' THEN 1 ELSE 0 END) as picking_orders,
        SUM(CASE WHEN status = 'delivering' THEN 1 ELSE 0 END) as delivering_orders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
        SUM(goods_weight) as total_weight,
        SUM(goods_volume) as total_volume
      FROM deliveries 
      WHERE 1=1
    `;
    const params = [];

    if (filters.company_id && await ensureCompanyIdSupport()) {
      query += ' AND company_id = ?';
      params.push(filters.company_id);
    }

    if (filters.hub_id) {
      query += ' AND hub_id = ?';
      params.push(filters.hub_id);
    }

    if (filters.start_date) {
      query += ' AND DATE(created_at) >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND DATE(created_at) <= ?';
      params.push(filters.end_date);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0];
  }

  // 获取配送趋势数据
  static async getTrendData(filters = {}) {
    let query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
        SUM(goods_weight) as total_weight
      FROM deliveries 
      WHERE 1=1
    `;
    const params = [];

    if (filters.company_id && await ensureCompanyIdSupport()) {
      query += ' AND company_id = ?';
      params.push(filters.company_id);
    }

    if (filters.hub_id) {
      query += ' AND hub_id = ?';
      params.push(filters.hub_id);
    }

    if (filters.start_date) {
      query += ' AND DATE(created_at) >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND DATE(created_at) <= ?';
      params.push(filters.end_date);
    }

    query += ' GROUP BY DATE(created_at) ORDER BY date DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // 获取配送员绩效数据
  static async getDriverPerformance(filters = {}) {
    let query = `
      SELECT 
        driver_id,
        CONVERT(CAST(driver_name AS BINARY) USING utf8mb4) AS driver_name,
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
        AVG(TIMESTAMPDIFF(MINUTE, assigned_at, completed_at)) as avg_delivery_time
      FROM deliveries 
      WHERE driver_id IS NOT NULL
    `;
    const params = [];

    if (filters.company_id && await ensureCompanyIdSupport()) {
      query += ' AND company_id = ?';
      params.push(filters.company_id);
    }

    if (filters.hub_id) {
      query += ' AND hub_id = ?';
      params.push(filters.hub_id);
    }

    if (filters.start_date) {
      query += ' AND DATE(created_at) >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND DATE(created_at) <= ?';
      params.push(filters.end_date);
    }

    query += ' GROUP BY driver_id, driver_name ORDER BY completed_orders DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getTracksByDeliveryId(deliveryId) {
    const [rows] = await pool.execute(
      `
      SELECT 
        id,
        delivery_id,
        latitude,
        longitude,
        CONVERT(CAST(location AS BINARY) USING utf8mb4) AS location,
        CONVERT(CAST(status AS BINARY) USING utf8mb4) AS status,
        CONVERT(CAST(remark AS BINARY) USING utf8mb4) AS remark,
        created_at
      FROM delivery_tracks
      WHERE delivery_id = ?
      ORDER BY created_at ASC
      `,
      [deliveryId]
    );
    return rows;
  }

  static async addTrack(deliveryId, trackData) {
    const {
      latitude,
      longitude,
      location,
      status,
      remark
    } = trackData;
    const [result] = await pool.execute(
      'INSERT INTO delivery_tracks (delivery_id, latitude, longitude, location, status, remark, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [deliveryId, latitude, longitude, location, status, remark]
    );
    return result.insertId;
  }

  static async getRatingsByDeliveryId(deliveryId) {
    const [rows] = await pool.execute(
      `
      SELECT 
        id,
        delivery_id,
        rating,
        service_rating,
        speed_rating,
        attitude_rating,
        CONVERT(CAST(comment AS BINARY) USING utf8mb4) AS comment,
        created_at
      FROM delivery_ratings
      WHERE delivery_id = ?
      ORDER BY created_at DESC
      `,
      [deliveryId]
    );
    return rows;
  }

  static async addRating(deliveryId, ratingData) {
    const {
      rating,
      service_rating,
      speed_rating,
      attitude_rating,
      comment
    } = ratingData;
    const [result] = await pool.execute(
      'INSERT INTO delivery_ratings (delivery_id, rating, service_rating, speed_rating, attitude_rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [deliveryId, rating, service_rating, speed_rating, attitude_rating, comment]
    );
    return result.insertId;
  }
}

export default Delivery;
