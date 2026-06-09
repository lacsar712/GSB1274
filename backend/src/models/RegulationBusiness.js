import pool from '../config/database.js';

class RegulationBusiness {
  /**
   * 获取业务列表
   */
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT 
          rb.*,
          CONVERT(CAST(rb.business_name AS BINARY) USING utf8mb4) AS business_name,
          CONVERT(CAST(rb.business_type AS BINARY) USING utf8mb4) AS business_type,
          CONVERT(CAST(rb.status AS BINARY) USING utf8mb4) AS status,
          CONVERT(CAST(rb.description AS BINARY) USING utf8mb4) AS description,
          CONVERT(CAST(rb.contact_person AS BINARY) USING utf8mb4) AS contact_person,
          CONVERT(CAST(rb.address AS BINARY) USING utf8mb4) AS address,
          CONVERT(CAST(c.name AS BINARY) USING utf8mb4) AS company_name,
          CONVERT(CAST(u.username AS BINARY) USING utf8mb4) AS creator_name
        FROM regulation_businesses rb
        LEFT JOIN companies c ON rb.company_id = c.id
        LEFT JOIN users u ON rb.created_by = u.id
        WHERE 1=1
      `;
      const params = [];

      // 添加筛选条件
      if (filters.company_id) {
        query += ` AND rb.company_id = ?`;
        params.push(filters.company_id);
      }

      if (filters.business_type) {
        query += ` AND rb.business_type = ?`;
        params.push(filters.business_type);
      }

      if (filters.status) {
        query += ` AND rb.status = ?`;
        params.push(filters.status);
      }

      if (filters.search) {
        query += ` AND (rb.business_name LIKE ? OR rb.business_code LIKE ?)`;
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      // 排序
      query += ` ORDER BY rb.created_at DESC`;

      if (filters.limit) {
        const size = parseInt(filters.limit);
        query += ` LIMIT ${size}`;
      }
      if (filters.offset) {
        const off = parseInt(filters.offset);
        query += ` OFFSET ${off}`;
      }

      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 根据ID获取业务详情
   */
  static async getById(id) {
    try {
      const query = `
        SELECT 
          rb.*,
          CONVERT(CAST(rb.business_name AS BINARY) USING utf8mb4) AS business_name,
          CONVERT(CAST(rb.business_type AS BINARY) USING utf8mb4) AS business_type,
          CONVERT(CAST(rb.status AS BINARY) USING utf8mb4) AS status,
          CONVERT(CAST(rb.description AS BINARY) USING utf8mb4) AS description,
          CONVERT(CAST(rb.contact_person AS BINARY) USING utf8mb4) AS contact_person,
          CONVERT(CAST(rb.address AS BINARY) USING utf8mb4) AS address,
          CONVERT(CAST(c.name AS BINARY) USING utf8mb4) AS company_name,
          c.credit_code as company_credit_code,
          CONVERT(CAST(u.username AS BINARY) USING utf8mb4) AS creator_name
        FROM regulation_businesses rb
        LEFT JOIN companies c ON rb.company_id = c.id
        LEFT JOIN users u ON rb.created_by = u.id
        WHERE rb.id = ?
      `;
      const [rows] = await pool.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * 创建业务
   */
  static async create(businessData) {
    try {
      const query = `
        INSERT INTO regulation_businesses (
          business_code,
          business_name,
          business_type,
          company_id,
          description,
          start_date,
          end_date,
          status,
          risk_level,
          contact_person,
          contact_phone,
          contact_email,
          address,
          documents,
          created_by,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const values = [
        businessData.business_code,
        businessData.business_name,
        businessData.business_type,
        businessData.company_id,
        businessData.description || null,
        businessData.start_date || null,
        businessData.end_date || null,
        businessData.status || 'active',
        businessData.risk_level || 'low',
        businessData.contact_person || null,
        businessData.contact_phone || null,
        businessData.contact_email || null,
        businessData.address || null,
        businessData.documents ? JSON.stringify(businessData.documents) : null,
        businessData.created_by
      ];

      const [result] = await pool.query(query, values);
      const insertedId = result.insertId;
      if (!insertedId) {
        return null;
      }
      return await this.getById(insertedId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 更新业务
   */
  static async update(id, businessData) {
    try {
      const query = `
        UPDATE regulation_businesses
        SET
          business_name = COALESCE(?, business_name),
          business_type = COALESCE(?, business_type),
          description = COALESCE(?, description),
          start_date = COALESCE(?, start_date),
          end_date = COALESCE(?, end_date),
          status = COALESCE(?, status),
          risk_level = COALESCE(?, risk_level),
          contact_person = COALESCE(?, contact_person),
          contact_phone = COALESCE(?, contact_phone),
          contact_email = COALESCE(?, contact_email),
          address = COALESCE(?, address),
          documents = COALESCE(?, documents),
          updated_at = NOW()
        WHERE id = ?
      `;

      const values = [
        businessData.business_name,
        businessData.business_type,
        businessData.description,
        businessData.start_date,
        businessData.end_date,
        businessData.status,
        businessData.risk_level,
        businessData.contact_person,
        businessData.contact_phone,
        businessData.contact_email,
        businessData.address,
        businessData.documents ? JSON.stringify(businessData.documents) : null,
        id
      ];

      await pool.query(query, values);
      return await this.getById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 删除业务
   */
  static async delete(id) {
    try {
      const existing = await this.getById(id);
      if (!existing) return null;
      const [result] = await pool.query('DELETE FROM regulation_businesses WHERE id = ?', [id]);
      return existing;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取业务统计
   */
  static async getStatistics(filters = {}) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
          COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_count,
          COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk_count,
          COUNT(CASE WHEN risk_level = 'medium' THEN 1 END) as medium_risk_count,
          COUNT(CASE WHEN risk_level = 'low' THEN 1 END) as low_risk_count
        FROM regulation_businesses
        WHERE 1=1
      `;
      const params = [];

      if (filters.company_id) {
        query += ` AND company_id = ?`;
        params.push(filters.company_id);
      }

      const [rows] = await pool.query(query, params);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

export default RegulationBusiness;
