import pool from '../config/database.js';

class RegulationInspection {
  /**
   * 获取抽检列表
   */
  static async getAll(filters = {}) {
    try {
      let query = `
        SELECT 
          ri.*,
          CONVERT(CAST(ri.inspection_title AS BINARY) USING utf8mb4) AS inspection_title,
          CONVERT(CAST(ri.inspection_type AS BINARY) USING utf8mb4) AS inspection_type,
          CONVERT(CAST(ri.status AS BINARY) USING utf8mb4) AS status,
          CONVERT(CAST(ri.result AS BINARY) USING utf8mb4) AS result,
          CONVERT(CAST(ri.description AS BINARY) USING utf8mb4) AS description,
          CONVERT(CAST(ri.findings AS BINARY) USING utf8mb4) AS findings,
          CONVERT(CAST(ri.recommendations AS BINARY) USING utf8mb4) AS recommendations,
          CONVERT(CAST(rb.business_name AS BINARY) USING utf8mb4) AS business_name,
          CONVERT(CAST(c.name AS BINARY) USING utf8mb4) AS company_name,
          CONVERT(CAST(u.username AS BINARY) USING utf8mb4) AS inspector_name
        FROM regulation_inspections ri
        LEFT JOIN regulation_businesses rb ON ri.business_id = rb.id
        LEFT JOIN companies c ON ri.company_id = c.id
        LEFT JOIN users u ON ri.inspector_id = u.id
        WHERE 1=1
      `;
      const params = [];

      // 添加筛选条件
      if (filters.company_id) {
        query += ` AND ri.company_id = ?`;
        params.push(filters.company_id);
      }

      if (filters.business_id) {
        query += ` AND ri.business_id = ?`;
        params.push(filters.business_id);
      }

      if (filters.inspection_type) {
        query += ` AND ri.inspection_type = ?`;
        params.push(filters.inspection_type);
      }

      if (filters.status) {
        query += ` AND ri.status = ?`;
        params.push(filters.status);
      }

      if (filters.result) {
        query += ` AND ri.result = ?`;
        params.push(filters.result);
      }

      if (filters.search) {
        query += ` AND (ri.inspection_code LIKE ? OR ri.inspection_title LIKE ?)`;
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      // 排序
      query += ` ORDER BY ri.created_at DESC`;

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
   * 根据ID获取抽检详情
   */
  static async getById(id) {
    try {
      const query = `
        SELECT 
          ri.*,
          CONVERT(CAST(ri.inspection_title AS BINARY) USING utf8mb4) AS inspection_title,
          CONVERT(CAST(ri.inspection_type AS BINARY) USING utf8mb4) AS inspection_type,
          CONVERT(CAST(ri.status AS BINARY) USING utf8mb4) AS status,
          CONVERT(CAST(ri.result AS BINARY) USING utf8mb4) AS result,
          CONVERT(CAST(ri.description AS BINARY) USING utf8mb4) AS description,
          CONVERT(CAST(ri.findings AS BINARY) USING utf8mb4) AS findings,
          CONVERT(CAST(ri.recommendations AS BINARY) USING utf8mb4) AS recommendations,
          CONVERT(CAST(rb.business_name AS BINARY) USING utf8mb4) AS business_name,
          rb.business_code,
          CONVERT(CAST(c.name AS BINARY) USING utf8mb4) AS company_name,
          c.credit_code as company_credit_code,
          CONVERT(CAST(u.username AS BINARY) USING utf8mb4) AS inspector_name,
          u.email as inspector_email
        FROM regulation_inspections ri
        LEFT JOIN regulation_businesses rb ON ri.business_id = rb.id
        LEFT JOIN companies c ON ri.company_id = c.id
        LEFT JOIN users u ON ri.inspector_id = u.id
        WHERE ri.id = ?
      `;
      const [rows] = await pool.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * 创建抽检
   */
  static async create(inspectionData) {
    try {
      const query = `
        INSERT INTO regulation_inspections (
          inspection_code,
          inspection_title,
          inspection_type,
          company_id,
          business_id,
          inspector_id,
          inspection_date,
          scheduled_date,
          description,
          inspection_items,
          status,
          result,
          score,
          findings,
          recommendations,
          attachments,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const values = [
        inspectionData.inspection_code,
        inspectionData.inspection_title,
        inspectionData.inspection_type,
        inspectionData.company_id,
        inspectionData.business_id || null,
        inspectionData.inspector_id,
        inspectionData.inspection_date || null,
        inspectionData.scheduled_date || null,
        inspectionData.description || null,
        inspectionData.inspection_items ? JSON.stringify(inspectionData.inspection_items) : null,
        inspectionData.status || 'scheduled',
        inspectionData.result || null,
        inspectionData.score || null,
        inspectionData.findings || null,
        inspectionData.recommendations || null,
        inspectionData.attachments ? JSON.stringify(inspectionData.attachments) : null
      ];

      const [result] = await pool.query(query, values);
      const insertedId = result.insertId;
      if (!insertedId) return null;
      return await this.getById(insertedId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 更新抽检
   */
  static async update(id, inspectionData) {
    try {
      const query = `
        UPDATE regulation_inspections
        SET
          inspection_title = COALESCE(?, inspection_title),
          inspection_type = COALESCE(?, inspection_type),
          inspector_id = COALESCE(?, inspector_id),
          inspection_date = COALESCE(?, inspection_date),
          scheduled_date = COALESCE(?, scheduled_date),
          description = COALESCE(?, description),
          inspection_items = COALESCE(?, inspection_items),
          status = COALESCE(?, status),
          result = COALESCE(?, result),
          score = COALESCE(?, score),
          findings = COALESCE(?, findings),
          recommendations = COALESCE(?, recommendations),
          attachments = COALESCE(?, attachments),
          updated_at = NOW()
        WHERE id = ?
      `;

      const values = [
        inspectionData.inspection_title,
        inspectionData.inspection_type,
        inspectionData.inspector_id,
        inspectionData.inspection_date,
        inspectionData.scheduled_date,
        inspectionData.description,
        inspectionData.inspection_items ? JSON.stringify(inspectionData.inspection_items) : null,
        inspectionData.status,
        inspectionData.result,
        inspectionData.score,
        inspectionData.findings,
        inspectionData.recommendations,
        inspectionData.attachments ? JSON.stringify(inspectionData.attachments) : null,
        id
      ];

      await pool.query(query, values);
      return await this.getById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 删除抽检
   */
  static async delete(id) {
    try {
      const existing = await this.getById(id);
      if (!existing) return null;
      await pool.query('DELETE FROM regulation_inspections WHERE id = ?', [id]);
      return existing;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取抽检统计
   */
  static async getStatistics(filters = {}) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_count,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
          COUNT(CASE WHEN result = 'passed' THEN 1 END) as passed_count,
          COUNT(CASE WHEN result = 'failed' THEN 1 END) as failed_count,
          AVG(score) as average_score
        FROM regulation_inspections
        WHERE 1=1
      `;
      const params = [];

      if (filters.company_id) {
        query += ` AND company_id = ?`;
        params.push(filters.company_id);
      }

      if (filters.business_id) {
        query += ` AND business_id = ?`;
        params.push(filters.business_id);
      }

      const [rows] = await pool.query(query, params);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

export default RegulationInspection;
