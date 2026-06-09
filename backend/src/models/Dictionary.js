import pool from '../config/database.js';

class Dictionary {
  // 获取字典列表
  static async getList(filters = {}) {
    const {
      page = 1,
      pageSize = 10,
      type,
      code,
      name,
      status
    } = filters;
    const offset = (page - 1) * pageSize;
    
    let query = `SELECT 
                        id, 
                        CONVERT(CAST(type AS BINARY) USING utf8mb4) as type, 
                        CONVERT(CAST(code AS BINARY) USING utf8mb4) as code, 
                        CONVERT(CAST(name AS BINARY) USING utf8mb4) as name, 
                        CONVERT(CAST(value AS BINARY) USING utf8mb4) as value, 
                        CONVERT(CAST(description AS BINARY) USING utf8mb4) as description, 
                        sort_order as sortOrder, 
                        CONVERT(CAST(status AS BINARY) USING utf8mb4) as status, 
                        created_at as createdAt, updated_at as updatedAt
                 FROM dictionaries
                 WHERE 1=1`;
    const params = [];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    if (code) {
      query += ' AND code LIKE ?';
      params.push(`%${code}%`);
    }
    
    if (name) {
      query += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    // 获取总数
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const [countRows] = await pool.execute(countQuery, params);
    const total = countRows[0].total;
    
    // 获取分页数据
    const size = parseInt(pageSize);
    const off = parseInt(offset);
    query += ` ORDER BY type, sort_order, created_at DESC LIMIT ${size} OFFSET ${off}`;
    
    const [rows] = await pool.execute(query, params);
    
    return {
      dictionaries: rows,
      total,
      page,
      pageSize
    };
  }

  // 根据ID获取字典信息
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT 
              id, 
              CONVERT(CAST(type AS BINARY) USING utf8mb4) as type, 
              CONVERT(CAST(code AS BINARY) USING utf8mb4) as code, 
              CONVERT(CAST(name AS BINARY) USING utf8mb4) as name, 
              CONVERT(CAST(value AS BINARY) USING utf8mb4) as value, 
              CONVERT(CAST(description AS BINARY) USING utf8mb4) as description,
              sort_order as sortOrder, 
              CONVERT(CAST(status AS BINARY) USING utf8mb4) as status,
              created_at as createdAt, updated_at as updatedAt
       FROM dictionaries
       WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  // 根据类型获取字典列表
  static async findByType(type) {
    const [rows] = await pool.execute(
      `SELECT 
              id, 
              CONVERT(CAST(type AS BINARY) USING utf8mb4) as type, 
              CONVERT(CAST(code AS BINARY) USING utf8mb4) as code, 
              CONVERT(CAST(name AS BINARY) USING utf8mb4) as name, 
              CONVERT(CAST(value AS BINARY) USING utf8mb4) as value, 
              CONVERT(CAST(description AS BINARY) USING utf8mb4) as description,
              sort_order as sortOrder, 
              CONVERT(CAST(status AS BINARY) USING utf8mb4) as status,
              created_at as createdAt, updated_at as updatedAt
       FROM dictionaries
       WHERE type = ? AND status = 'active'
       ORDER BY sort_order, created_at`,
      [type]
    );
    return rows;
  }

  // 根据代码获取字典信息
  static async findByCode(code) {
    const [rows] = await pool.execute(
      `SELECT 
              id, 
              CONVERT(CAST(type AS BINARY) USING utf8mb4) as type, 
              CONVERT(CAST(code AS BINARY) USING utf8mb4) as code, 
              CONVERT(CAST(name AS BINARY) USING utf8mb4) as name, 
              CONVERT(CAST(value AS BINARY) USING utf8mb4) as value, 
              CONVERT(CAST(description AS BINARY) USING utf8mb4) as description,
              sort_order as sortOrder, 
              CONVERT(CAST(status AS BINARY) USING utf8mb4) as status,
              created_at as createdAt, updated_at as updatedAt
       FROM dictionaries
       WHERE code = ?`,
      [code]
    );
    return rows[0];
  }

  // 创建字典
  static async create(dictionaryData) {
    const {
      type,
      code,
      name,
      value,
      description,
      sortOrder = 0,
      status = 'active'
    } = dictionaryData;

    const [result] = await pool.execute(
      `INSERT INTO dictionaries
       (type, code, name, value, description, sort_order, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [type, code, name, value, description, sortOrder, status]
    );

    return result.insertId;
  }

  // 更新字典
  static async update(id, dictionaryData) {
    const {
      type,
      code,
      name,
      value,
      description,
      sortOrder,
      status
    } = dictionaryData;

    const [result] = await pool.execute(
      `UPDATE dictionaries
       SET type = ?, code = ?, name = ?, value = ?, 
           description = ?, sort_order = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [type, code, name, value, description, sortOrder, status, id]
    );

    return result.affectedRows > 0;
  }

  // 删除字典
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM dictionaries WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // 检查代码是否已存在
  static async existsByCode(code, excludeId = null) {
    let query = 'SELECT id FROM dictionaries WHERE code = ?';
    const params = [code];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows.length > 0;
  }

  // 获取所有字典类型
  static async getTypes() {
    const [rows] = await pool.execute(
      `SELECT DISTINCT CONVERT(CAST(type AS BINARY) USING utf8mb4) as type
       FROM dictionaries
       ORDER BY type`
    );
    return rows.map(row => row.type);
  }

  // 批量更新排序
  static async updateSortOrder(items) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      for (const item of items) {
        await connection.execute(
          'UPDATE dictionaries SET sort_order = ?, updated_at = NOW() WHERE id = ?',
          [item.sortOrder, item.id]
        );
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // 更新状态
  static async updateStatus(id, status) {
    const [result] = await pool.execute(
      'UPDATE dictionaries SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }
}

export default Dictionary;
