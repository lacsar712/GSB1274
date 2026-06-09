import pool from '../config/database.js';

let CARRIER_COLS = {
  contact_person: null,
  contact_phone: null,
  contact_email: null,
  address: null,
  business_license: null,
  transport_license: null,
  vehicle_count: null,
  driver_count: null,
  service_area: null,
  description: null,
  status: null,
  created_at: null,
  updated_at: null
};

const ensureCarrierColumns = async () => {
  const keys = Object.keys(CARRIER_COLS);
  const needCheck = keys.filter(k => CARRIER_COLS[k] === null);
  if (needCheck.length === 0) return CARRIER_COLS;
  try {
    const checks = await Promise.all(
      needCheck.map(async k => {
        const [rows] = await pool.execute(`SHOW COLUMNS FROM carriers LIKE ?`, [k]);
        return { k, exists: rows && rows.length > 0 };
      })
    );
    for (const { k, exists } of checks) {
      CARRIER_COLS[k] = !!exists;
    }
  } catch (e) {
    for (const k of needCheck) {
      CARRIER_COLS[k] = false;
    }
  }
  return CARRIER_COLS;
};

class Carrier {
  // 获取所有承运人列表
  static async findAll(filters = {}) {
    try {
      await ensureCarrierColumns();
      let query = `
        SELECT 
          c.id,
          CONVERT(CAST(c.name AS BINARY) USING utf8mb4) as name,
          ${CARRIER_COLS.contact_person ? "CONVERT(CAST(c.contact_person AS BINARY) USING utf8mb4) as contact_person" : "NULL as contact_person"},
          ${CARRIER_COLS.contact_phone ? "CONVERT(CAST(c.contact_phone AS BINARY) USING utf8mb4) as contact_phone" : "NULL as contact_phone"},
          ${CARRIER_COLS.contact_email ? "CONVERT(CAST(c.contact_email AS BINARY) USING utf8mb4) as contact_email" : "NULL as contact_email"},
          ${CARRIER_COLS.address ? "CONVERT(CAST(c.address AS BINARY) USING utf8mb4) as address" : "NULL as address"},
          ${CARRIER_COLS.business_license ? "CONVERT(CAST(c.business_license AS BINARY) USING utf8mb4) as business_license" : "NULL as business_license"},
          ${CARRIER_COLS.transport_license ? "CONVERT(CAST(c.transport_license AS BINARY) USING utf8mb4) as transport_license" : "NULL as transport_license"},
          ${CARRIER_COLS.vehicle_count ? "c.vehicle_count" : "NULL as vehicle_count"},
          ${CARRIER_COLS.driver_count ? "c.driver_count" : "NULL as driver_count"},
          ${CARRIER_COLS.service_area ? "CONVERT(CAST(c.service_area AS BINARY) USING utf8mb4) as service_area" : "NULL as service_area"},
          ${CARRIER_COLS.description ? "CONVERT(CAST(c.description AS BINARY) USING utf8mb4) as description" : "NULL as description"},
          ${CARRIER_COLS.status ? "CONVERT(CAST(c.status AS BINARY) USING utf8mb4) as status" : "NULL as status"},
          ${CARRIER_COLS.created_at ? "c.created_at" : "NULL as created_at"},
          ${CARRIER_COLS.updated_at ? "c.updated_at" : "NULL as updated_at"},
          COUNT(DISTINCT w.id) as waybill_count,
          0 as total_freight
        FROM carriers c
        LEFT JOIN waybills w ON c.id = w.carrier_id
        WHERE 1=1
      `;
      const params = [];

      // 添加筛选条件
      if (filters.name) {
        query += ` AND c.name LIKE ?`;
        params.push(`%${filters.name}%`);
      }

      if (filters.contact_person && CARRIER_COLS.contact_person) {
        query += ` AND c.contact_person LIKE ?`;
        params.push(`%${filters.contact_person}%`);
      }

      if (filters.status && CARRIER_COLS.status) {
        query += ` AND c.status = ?`;
        params.push(filters.status);
      }

      query += ` GROUP BY c.id ORDER BY ${CARRIER_COLS.created_at ? 'c.created_at' : 'c.id'} DESC`;

      // 添加分页
      if (filters.page && filters.pageSize) {
        const size = parseInt(filters.pageSize);
        const page = parseInt(filters.page);
        const offset = (page - 1) * size;
        query += ` LIMIT ${size} OFFSET ${offset}`;
      }

      const [rows] = await pool.query(query, params);

      // 获取总数
      let countQuery = `SELECT COUNT(*) as total FROM carriers c WHERE 1=1`;
      const countParams = [];

      if (filters.name) {
        countQuery += ` AND c.name LIKE ?`;
        countParams.push(`%${filters.name}%`);
      }

      if (filters.contact_person && CARRIER_COLS.contact_person) {
        countQuery += ` AND c.contact_person LIKE ?`;
        countParams.push(`%${filters.contact_person}%`);
      }

      if (filters.status && CARRIER_COLS.status) {
        countQuery += ` AND c.status = ?`;
        countParams.push(filters.status);
      }

      const [countResult] = await pool.query(countQuery, countParams);
      const total = countResult[0].total;

      return {
        data: rows,
        total,
        page: filters.page || 1,
        pageSize: filters.pageSize || rows.length
      };
    } catch (error) {
      throw error;
    }
  }

  // 根据ID获取承运人详情
  static async findById(id) {
    try {
      await ensureCarrierColumns();
      const query = `
        SELECT 
          c.id,
          CONVERT(CAST(c.name AS BINARY) USING utf8mb4) as name,
          ${CARRIER_COLS.contact_person ? "CONVERT(CAST(c.contact_person AS BINARY) USING utf8mb4) as contact_person" : "NULL as contact_person"},
          ${CARRIER_COLS.contact_phone ? "CONVERT(CAST(c.contact_phone AS BINARY) USING utf8mb4) as contact_phone" : "NULL as contact_phone"},
          ${CARRIER_COLS.contact_email ? "CONVERT(CAST(c.contact_email AS BINARY) USING utf8mb4) as contact_email" : "NULL as contact_email"},
          ${CARRIER_COLS.address ? "CONVERT(CAST(c.address AS BINARY) USING utf8mb4) as address" : "NULL as address"},
          ${CARRIER_COLS.business_license ? "CONVERT(CAST(c.business_license AS BINARY) USING utf8mb4) as business_license" : "NULL as business_license"},
          ${CARRIER_COLS.transport_license ? "CONVERT(CAST(c.transport_license AS BINARY) USING utf8mb4) as transport_license" : "NULL as transport_license"},
          ${CARRIER_COLS.vehicle_count ? "c.vehicle_count" : "NULL as vehicle_count"},
          ${CARRIER_COLS.driver_count ? "c.driver_count" : "NULL as driver_count"},
          ${CARRIER_COLS.service_area ? "CONVERT(CAST(c.service_area AS BINARY) USING utf8mb4) as service_area" : "NULL as service_area"},
          ${CARRIER_COLS.description ? "CONVERT(CAST(c.description AS BINARY) USING utf8mb4) as description" : "NULL as description"},
          ${CARRIER_COLS.status ? "CONVERT(CAST(c.status AS BINARY) USING utf8mb4) as status" : "NULL as status"},
          ${CARRIER_COLS.created_at ? "c.created_at" : "NULL as created_at"},
          ${CARRIER_COLS.updated_at ? "c.updated_at" : "NULL as updated_at"},
          COUNT(DISTINCT w.id) as waybill_count,
          0 as total_freight,
          COALESCE(AVG(w.rating), 0) as avg_rating
        FROM carriers c
        LEFT JOIN waybills w ON c.id = w.carrier_id
        WHERE c.id = ?
        GROUP BY c.id
      `;
      const [rows] = await pool.query(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }

      // 获取最近的运单记录
      const recentWaybillsQuery = `
        SELECT 
          id, 
          waybill_number, 
          CONVERT(CAST(origin AS BINARY) USING utf8mb4) as origin, 
          CONVERT(CAST(destination AS BINARY) USING utf8mb4) as destination, 
          0 as freight_amount, 
          CONVERT(CAST(status AS BINARY) USING utf8mb4) as status, 
          created_at
        FROM waybills
        WHERE carrier_id = ?
        ORDER BY created_at DESC
        LIMIT 10
      `;
      const [recentWaybills] = await pool.query(recentWaybillsQuery, [id]);

      return {
        ...rows[0],
        recent_waybills: recentWaybills
      };
    } catch (error) {
      throw error;
    }
  }

  // 创建新承运人
  static async create(carrierData) {
    try {
      await ensureCarrierColumns();
      const {
        name,
        contact_person,
        contact_phone,
        contact_email,
        address,
        business_license,
        transport_license,
        vehicle_count,
        driver_count,
        service_area,
        description,
        status = 'active'
      } = carrierData;

      const cols = ['name'];
      const vals = [name];
      const pushIf = (name, value) => {
        if (CARRIER_COLS[name]) {
          cols.push(name);
          vals.push(value ?? null);
        }
      };
      pushIf('contact_person', contact_person);
      pushIf('contact_phone', contact_phone);
      pushIf('contact_email', contact_email);
      pushIf('address', address);
      pushIf('business_license', business_license);
      pushIf('transport_license', transport_license);
      pushIf('vehicle_count', vehicle_count ?? 0);
      pushIf('driver_count', driver_count ?? 0);
      pushIf('service_area', service_area);
      pushIf('description', description);
      if (CARRIER_COLS.status) {
        cols.push('status');
        vals.push(status);
      }
      if (CARRIER_COLS.created_at) {
        cols.push('created_at');
        vals.push(new Date());
      }
      if (CARRIER_COLS.updated_at) {
        cols.push('updated_at');
        vals.push(new Date());
      }
      const placeholders = cols.map(() => '?').join(', ');
      const query = `INSERT INTO carriers (${cols.join(', ')}) VALUES (${placeholders})`;
      const [result] = await pool.query(query, vals);

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // 更新承运人信息
  static async update(id, carrierData) {
    try {
      await ensureCarrierColumns();
      const {
        name,
        contact_person,
        contact_phone,
        contact_email,
        address,
        business_license,
        transport_license,
        vehicle_count,
        driver_count,
        service_area,
        description,
        status
      } = carrierData;

      const sets = [];
      const args = [];
      const pushSet = (col, value, force = false) => {
        if (force || CARRIER_COLS[col]) {
          sets.push(`${col} = ?`);
          args.push(value ?? null);
        }
      };
      pushSet('name', name, true);
      pushSet('contact_person', contact_person);
      pushSet('contact_phone', contact_phone);
      pushSet('contact_email', contact_email);
      pushSet('address', address);
      pushSet('business_license', business_license);
      pushSet('transport_license', transport_license);
      pushSet('vehicle_count', vehicle_count ?? 0);
      pushSet('driver_count', driver_count ?? 0);
      pushSet('service_area', service_area);
      pushSet('description', description);
      if (CARRIER_COLS.status) {
        pushSet('status', status);
      }
      if (CARRIER_COLS.updated_at) {
        sets.push('updated_at = NOW()');
      }
      const query = `UPDATE carriers SET ${sets.join(', ')} WHERE id = ?`;
      args.push(id);
      await pool.query(query, args);

      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // 删除承运人
  static async delete(id) {
    try {
      // 检查是否有关联的运单
      const [waybills] = await pool.query(
        'SELECT COUNT(*) as count FROM waybills WHERE carrier_id = ?',
        [id]
      );

      if (waybills[0].count > 0) {
        throw new Error('无法删除：该承运人有关联的运单记录');
      }

      const query = 'DELETE FROM carriers WHERE id = ?';
      await pool.query(query, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 更新承运人状态
  static async updateStatus(id, status) {
    try {
      await ensureCarrierColumns();
      if (CARRIER_COLS.status) {
        const query = 'UPDATE carriers SET status = ?, updated_at = NOW() WHERE id = ?';
        await pool.query(query, [status, id]);
      }
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // 获取承运人统计信息
  static async getStatistics(id) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_waybills,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_waybills,
          SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) as in_transit_waybills,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_waybills,
          0 as total_freight,
          COALESCE(AVG(rating), 0) as avg_rating
        FROM waybills
        WHERE carrier_id = ?
      `;
      const [rows] = await pool.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

export default Carrier;
