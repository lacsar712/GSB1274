import pool from '../config/database.js';

let VEHICLE_COLS = {
  status: null,
  created_at: null,
  updated_at: null,
  brand: null,
  model: null,
  color: null,
  year: null,
  load_capacity: null,
  volume_capacity: null,
  carrier_id: null,
  driver_name: null,
  driver_phone: null,
  driver_license: null,
  registration_date: null,
  insurance_expiry: null,
  inspection_expiry: null,
  gps_device_id: null,
  current_location: null,
  latitude: null,
  longitude: null,
  description: null
};

const ensureVehicleColumns = async () => {
  const keys = Object.keys(VEHICLE_COLS);
  const needCheck = keys.filter(k => VEHICLE_COLS[k] === null);
  if (needCheck.length === 0) return VEHICLE_COLS;
  try {
    const checks = await Promise.all(
      needCheck.map(async k => {
        const [rows] = await pool.execute(`SHOW COLUMNS FROM vehicles LIKE ?`, [k]);
        return { k, exists: rows && rows.length > 0 };
      })
    );
    for (const { k, exists } of checks) {
      VEHICLE_COLS[k] = !!exists;
    }
  } catch (e) {
    for (const k of needCheck) {
      VEHICLE_COLS[k] = false;
    }
  }
  return VEHICLE_COLS;
};

class Vehicle {
  // 获取所有车辆列表
  static async findAll(filters = {}) {
    try {
      await ensureVehicleColumns();
      let query = `
        SELECT 
          v.id,
          ${VEHICLE_COLS.carrier_id ? 'v.carrier_id' : 'NULL as carrier_id'},
          CONVERT(CAST(v.plate_number AS BINARY) USING utf8mb4) as plate_number,
          CONVERT(CAST(v.vehicle_type AS BINARY) USING utf8mb4) as vehicle_type,
          ${VEHICLE_COLS.year ? 'v.year' : 'NULL as year'},
          ${VEHICLE_COLS.load_capacity ? 'v.load_capacity' : 'NULL as load_capacity'},
          ${VEHICLE_COLS.volume_capacity ? 'v.volume_capacity' : 'NULL as volume_capacity'},
          ${VEHICLE_COLS.brand ? "CONVERT(CAST(v.brand AS BINARY) USING utf8mb4) as brand" : "NULL as brand"},
          ${VEHICLE_COLS.model ? "CONVERT(CAST(v.model AS BINARY) USING utf8mb4) as model" : "NULL as model"},
          ${VEHICLE_COLS.color ? "CONVERT(CAST(v.color AS BINARY) USING utf8mb4) as color" : "NULL as color"},
          ${VEHICLE_COLS.driver_name ? "CONVERT(CAST(v.driver_name AS BINARY) USING utf8mb4) as driver_name" : "NULL as driver_name"},
          ${VEHICLE_COLS.driver_phone ? "CONVERT(CAST(v.driver_phone AS BINARY) USING utf8mb4) as driver_phone" : "NULL as driver_phone"},
          ${VEHICLE_COLS.driver_license ? "CONVERT(CAST(v.driver_license AS BINARY) USING utf8mb4) as driver_license" : "NULL as driver_license"},
          ${VEHICLE_COLS.current_location ? "CONVERT(CAST(v.current_location AS BINARY) USING utf8mb4) as current_location" : "NULL as current_location"},
          ${VEHICLE_COLS.latitude ? 'v.latitude' : 'NULL as latitude'},
          ${VEHICLE_COLS.longitude ? 'v.longitude' : 'NULL as longitude'},
          ${VEHICLE_COLS.status ? "CONVERT(CAST(v.status AS BINARY) USING utf8mb4) as status" : "NULL as status"},
          ${VEHICLE_COLS.created_at ? "v.created_at" : "NULL as created_at"},
          ${VEHICLE_COLS.updated_at ? "v.updated_at" : "NULL as updated_at"},
          MAX(CONVERT(CAST(c.name AS BINARY) USING utf8mb4)) as carrier_name,
          COUNT(DISTINCT w.id) as waybill_count,
          0 as total_freight
        FROM vehicles v
        LEFT JOIN waybills w ON v.id = w.vehicle_id
        LEFT JOIN carriers c ON c.id = w.carrier_id
        WHERE 1=1
      `;
      const params = [];

      // 添加筛选条件
      if (filters.plate_number) {
        query += ` AND v.plate_number LIKE ?`;
        params.push(`%${filters.plate_number}%`);
      }

      if (filters.vehicle_type) {
        const typeAliases = {
          truck: ['truck', '货车'],
          van: ['van', '厢式货车'],
          flatbed: ['flatbed', '平板车'],
          container: ['container', '集装箱车'],
          refrigerated: ['refrigerated', '冷藏车']
        };
        const types = typeAliases[filters.vehicle_type] || [filters.vehicle_type];
        const placeholders = types.map(() => '?').join(', ');
        query += ` AND v.vehicle_type IN (${placeholders})`;
        params.push(...types);
      }

      if (filters.carrier_id && VEHICLE_COLS.carrier_id) {
        query += ` AND v.carrier_id = ?`;
        params.push(filters.carrier_id);
      }

      if (filters.status && VEHICLE_COLS.status) {
        query += ` AND v.status = ?`;
        params.push(filters.status);
      }

      query += ` GROUP BY v.id ORDER BY ${VEHICLE_COLS.created_at ? 'v.created_at' : 'v.id'} DESC`;

      // 添加分页
      if (filters.page && filters.pageSize) {
        const size = parseInt(filters.pageSize);
        const page = parseInt(filters.page);
        const offset = (page - 1) * size;
        query += ` LIMIT ${size} OFFSET ${offset}`;
      }

      const [rows] = await pool.query(query, params);

      // 获取总数
      let countQuery = `SELECT COUNT(*) as total FROM vehicles v WHERE 1=1`;
      const countParams = [];

      if (filters.plate_number) {
        countQuery += ` AND v.plate_number LIKE ?`;
        countParams.push(`%${filters.plate_number}%`);
      }

      if (filters.vehicle_type) {
        const typeAliases = {
          truck: ['truck', '货车'],
          van: ['van', '厢式货车'],
          flatbed: ['flatbed', '平板车'],
          container: ['container', '集装箱车'],
          refrigerated: ['refrigerated', '冷藏车']
        };
        const types = typeAliases[filters.vehicle_type] || [filters.vehicle_type];
        const placeholders = types.map(() => '?').join(', ');
        countQuery += ` AND v.vehicle_type IN (${placeholders})`;
        countParams.push(...types);
      }

      if (filters.carrier_id && VEHICLE_COLS.carrier_id) {
        countQuery += ` AND v.carrier_id = ?`;
        countParams.push(filters.carrier_id);
      }

      if (filters.status && VEHICLE_COLS.status) {
        countQuery += ` AND v.status = ?`;
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

  // 根据ID获取车辆详情
  static async findById(id) {
    try {
      const query = `
        SELECT 
          v.id,
          ${VEHICLE_COLS.carrier_id ? 'v.carrier_id' : 'NULL as carrier_id'},
          CONVERT(CAST(v.plate_number AS BINARY) USING utf8mb4) as plate_number,
          CONVERT(CAST(v.vehicle_type AS BINARY) USING utf8mb4) as vehicle_type,
          ${VEHICLE_COLS.year ? 'v.year' : 'NULL as year'},
          ${VEHICLE_COLS.load_capacity ? 'v.load_capacity' : 'NULL as load_capacity'},
          ${VEHICLE_COLS.volume_capacity ? 'v.volume_capacity' : 'NULL as volume_capacity'},
          ${VEHICLE_COLS.brand ? "CONVERT(CAST(v.brand AS BINARY) USING utf8mb4) as brand" : "NULL as brand"},
          ${VEHICLE_COLS.model ? "CONVERT(CAST(v.model AS BINARY) USING utf8mb4) as model" : "NULL as model"},
          ${VEHICLE_COLS.color ? "CONVERT(CAST(v.color AS BINARY) USING utf8mb4) as color" : "NULL as color"},
          ${VEHICLE_COLS.driver_name ? "CONVERT(CAST(v.driver_name AS BINARY) USING utf8mb4) as driver_name" : "NULL as driver_name"},
          ${VEHICLE_COLS.driver_phone ? "CONVERT(CAST(v.driver_phone AS BINARY) USING utf8mb4) as driver_phone" : "NULL as driver_phone"},
          ${VEHICLE_COLS.driver_license ? "CONVERT(CAST(v.driver_license AS BINARY) USING utf8mb4) as driver_license" : "NULL as driver_license"},
          ${VEHICLE_COLS.current_location ? "CONVERT(CAST(v.current_location AS BINARY) USING utf8mb4) as current_location" : "NULL as current_location"},
          ${VEHICLE_COLS.latitude ? 'v.latitude' : 'NULL as latitude'},
          ${VEHICLE_COLS.longitude ? 'v.longitude' : 'NULL as longitude'},
          ${VEHICLE_COLS.status ? "CONVERT(CAST(v.status AS BINARY) USING utf8mb4) as status" : "NULL as status"},
          ${VEHICLE_COLS.created_at ? "v.created_at" : "NULL as created_at"},
          ${VEHICLE_COLS.updated_at ? "v.updated_at" : "NULL as updated_at"},
          MAX(CONVERT(CAST(c.name AS BINARY) USING utf8mb4)) as carrier_name,
          NULL as carrier_contact,
          NULL as carrier_phone,
          COUNT(DISTINCT w.id) as waybill_count,
          0 as total_freight,
          0 as avg_rating
        FROM vehicles v
        LEFT JOIN waybills w ON v.id = w.vehicle_id
        LEFT JOIN carriers c ON c.id = w.carrier_id
        WHERE v.id = ?
        GROUP BY v.id
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
          CONVERT(CAST(cargo_name AS BINARY) USING utf8mb4) as cargo_name, 
          0 as freight_amount, 
          CONVERT(CAST(status AS BINARY) USING utf8mb4) as status, 
          created_at
        FROM waybills
        WHERE vehicle_id = ?
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

  // 创建新车辆
  static async create(vehicleData) {
    try {
      await ensureVehicleColumns();
      const {
        plate_number,
        vehicle_type,
        brand,
        model,
        color,
        year,
        load_capacity,
        volume_capacity,
        carrier_id,
        driver_name,
        driver_phone,
        driver_license,
        registration_date,
        insurance_expiry,
        inspection_expiry,
        gps_device_id,
        current_location,
        latitude,
        longitude,
        description,
        status = 'available'
      } = vehicleData;

      const cols = ['plate_number', 'vehicle_type'];
      const vals = [plate_number, vehicle_type];
      const pushIf = (name, value) => {
        if (VEHICLE_COLS[name]) {
          cols.push(name);
          vals.push(value ?? null);
        }
      };
      pushIf('brand', brand);
      pushIf('model', model);
      pushIf('color', color);
      pushIf('year', year);
      pushIf('load_capacity', load_capacity);
      pushIf('volume_capacity', volume_capacity);
      pushIf('carrier_id', carrier_id);
      pushIf('driver_name', driver_name);
      pushIf('driver_phone', driver_phone);
      pushIf('driver_license', driver_license);
      pushIf('registration_date', registration_date);
      pushIf('insurance_expiry', insurance_expiry);
      pushIf('inspection_expiry', inspection_expiry);
      pushIf('gps_device_id', gps_device_id);
      pushIf('current_location', current_location);
      pushIf('latitude', latitude);
      pushIf('longitude', longitude);
      pushIf('description', description);
      if (VEHICLE_COLS.status) {
        cols.push('status');
        vals.push(status);
      }
      if (VEHICLE_COLS.created_at) {
        cols.push('created_at');
        vals.push(new Date());
      }
      if (VEHICLE_COLS.updated_at) {
        cols.push('updated_at');
        vals.push(new Date());
      }

      const placeholders = cols.map(() => '?').join(', ');
      const query = `INSERT INTO vehicles (${cols.join(', ')}) VALUES (${placeholders})`;
      const [result] = await pool.query(query, vals);

      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // 更新车辆信息
  static async update(id, vehicleData) {
    try {
      await ensureVehicleColumns();
      const {
        plate_number,
        vehicle_type,
        brand,
        model,
        color,
        year,
        load_capacity,
        volume_capacity,
        carrier_id,
        driver_name,
        driver_phone,
        driver_license,
        registration_date,
        insurance_expiry,
        inspection_expiry,
        gps_device_id,
        current_location,
        latitude,
        longitude,
        description,
        status
      } = vehicleData;

      const sets = [];
      const args = [];
      const pushSet = (name, value, force = false) => {
        if (force || VEHICLE_COLS[name]) {
          sets.push(`${name} = ?`);
          args.push(value ?? null);
        }
      };
      pushSet('plate_number', plate_number, true);
      pushSet('vehicle_type', vehicle_type, true);
      pushSet('brand', brand);
      pushSet('model', model);
      pushSet('color', color);
      pushSet('year', year);
      pushSet('load_capacity', load_capacity);
      pushSet('volume_capacity', volume_capacity);
      pushSet('carrier_id', carrier_id);
      pushSet('driver_name', driver_name);
      pushSet('driver_phone', driver_phone);
      pushSet('driver_license', driver_license);
      pushSet('registration_date', registration_date);
      pushSet('insurance_expiry', insurance_expiry);
      pushSet('inspection_expiry', inspection_expiry);
      pushSet('gps_device_id', gps_device_id);
      pushSet('current_location', current_location);
      pushSet('latitude', latitude);
      pushSet('longitude', longitude);
      pushSet('description', description);
      if (VEHICLE_COLS.status) {
        pushSet('status', status);
      }
      if (VEHICLE_COLS.updated_at) {
        sets.push('updated_at = NOW()');
      }
      const query = `UPDATE vehicles SET ${sets.join(', ')} WHERE id = ?`;
      args.push(id);
      await pool.query(query, args);

      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // 删除车辆
  static async delete(id) {
    try {
      // 检查是否有关联的运单
      const [waybills] = await pool.query(
        'SELECT COUNT(*) as count FROM waybills WHERE vehicle_id = ?',
        [id]
      );

      if (waybills[0].count > 0) {
        throw new Error('无法删除：该车辆有关联的运单记录');
      }

      const query = 'DELETE FROM vehicles WHERE id = ?';
      await pool.query(query, [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 更新车辆状态
  static async updateStatus(id, status) {
    try {
      await ensureVehicleColumns();
      if (VEHICLE_COLS.status) {
        const query = 'UPDATE vehicles SET status = ?, updated_at = NOW() WHERE id = ?';
        await pool.query(query, [status, id]);
      }
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // 更新车辆位置
  static async updateLocation(id, locationData) {
    try {
      const { current_location, latitude, longitude } = locationData;
      
      await ensureVehicleColumns();
      const sets = [];
      const args = [];
      if (VEHICLE_COLS.current_location) {
        sets.push('current_location = ?');
        args.push(current_location || null);
      }
      if (VEHICLE_COLS.latitude) {
        sets.push('latitude = ?');
        args.push(latitude || null);
      }
      if (VEHICLE_COLS.longitude) {
        sets.push('longitude = ?');
        args.push(longitude || null);
      }
      if (VEHICLE_COLS.updated_at) {
        sets.push('updated_at = NOW()');
      }
      if (sets.length > 0) {
        const query = `UPDATE vehicles SET ${sets.join(', ')} WHERE id = ?`;
        args.push(id);
        await pool.query(query, args);
      }
      
      return await this.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // 获取车辆统计信息
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
        WHERE vehicle_id = ?
      `;
      const [rows] = await pool.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // 获取所有车辆的位置信息（用于地图展示）
  static async getAllLocations(filters = {}) {
    try {
      await ensureVehicleColumns();
      let query = `
        SELECT 
          v.id,
          v.plate_number,
          CONVERT(CAST(v.vehicle_type AS BINARY) USING utf8mb4) as vehicle_type,
          ${VEHICLE_COLS.status ? 'CONVERT(CAST(v.status AS BINARY) USING utf8mb4) as status' : 'NULL as status'},
          ${VEHICLE_COLS.current_location ? "CONVERT(CAST(v.current_location AS BINARY) USING utf8mb4) as current_location" : "NULL as current_location"},
          ${VEHICLE_COLS.latitude ? 'v.latitude' : 'NULL as latitude'},
          ${VEHICLE_COLS.longitude ? 'v.longitude' : 'NULL as longitude'},
          ${VEHICLE_COLS.driver_name ? "CONVERT(CAST(v.driver_name AS BINARY) USING utf8mb4) as driver_name" : "NULL as driver_name"},
          ${VEHICLE_COLS.driver_phone ? "CONVERT(CAST(v.driver_phone AS BINARY) USING utf8mb4) as driver_phone" : "NULL as driver_phone"},
          CONVERT(CAST(c.name AS BINARY) USING utf8mb4) as carrier_name
        FROM vehicles v
        LEFT JOIN (
          SELECT vehicle_id, MAX(created_at) AS max_created_at
          FROM waybills
          GROUP BY vehicle_id
        ) lw ON lw.vehicle_id = v.id
        LEFT JOIN waybills w ON w.vehicle_id = v.id AND w.created_at = lw.max_created_at
        LEFT JOIN carriers c ON c.id = w.carrier_id
        WHERE 1=1
      `;
      const params = [];

      if (filters.status && VEHICLE_COLS.status) {
        query += ` AND v.status = ?`;
        params.push(filters.status);
      }

      if (filters.carrier_id) {
        query += ` AND c.id = ?`;
        params.push(filters.carrier_id);
      }

      if (VEHICLE_COLS.latitude && VEHICLE_COLS.longitude) {
        query += ` AND v.latitude IS NOT NULL AND v.longitude IS NOT NULL`;
      }

      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

export default Vehicle;
