import db from '../config/database.js';

class CompanyConfig {
  // 获取所有企业配置
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        id,
        company_id,
        CONVERT(CAST(config_key AS BINARY) USING utf8mb4) AS config_key,
        CONVERT(CAST(config_value AS BINARY) USING utf8mb4) AS config_value,
        CONVERT(CAST(config_type AS BINARY) USING utf8mb4) AS config_type,
        CONVERT(CAST(description AS BINARY) USING utf8mb4) AS description,
        CONVERT(CAST(status AS BINARY) USING utf8mb4) AS status,
        created_at,
        updated_at
      FROM company_configs
      WHERE 1=1
    `;
    const params = [];

    if (filters.companyId) {
      query += ' AND company_id = ?';
      params.push(filters.companyId);
    }

    if (filters.configType) {
      query += ' AND config_type = ?';
      params.push(filters.configType);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      const size = parseInt(filters.limit);
      query += ` LIMIT ${size}`;
      if (filters.offset) {
        const off = parseInt(filters.offset);
        query += ` OFFSET ${off}`;
      }
    }

    const [rows] = await db.query(query, params);
    return rows;
  }

  // 获取配置总数
  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) as total FROM company_configs WHERE 1=1';
    const params = [];

    if (filters.companyId) {
      query += ' AND company_id = ?';
      params.push(filters.companyId);
    }

    if (filters.configType) {
      query += ' AND config_type = ?';
      params.push(filters.configType);
    }

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    const [rows] = await db.query(query, params);
    return rows[0].total;
  }

  // 根据ID获取配置
  static async findById(id) {
    const [rows] = await db.query(
      `SELECT 
        id,
        company_id,
        CONVERT(CAST(config_key AS BINARY) USING utf8mb4) AS config_key,
        CONVERT(CAST(config_value AS BINARY) USING utf8mb4) AS config_value,
        CONVERT(CAST(config_type AS BINARY) USING utf8mb4) AS config_type,
        CONVERT(CAST(description AS BINARY) USING utf8mb4) AS description,
        CONVERT(CAST(status AS BINARY) USING utf8mb4) AS status,
        created_at,
        updated_at
      FROM company_configs
      WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  // 根据企业ID和配置键获取配置
  static async findByCompanyAndKey(companyId, configKey) {
    const [rows] = await db.query(
      `SELECT 
        id,
        company_id,
        CONVERT(CAST(config_key AS BINARY) USING utf8mb4) AS config_key,
        CONVERT(CAST(config_value AS BINARY) USING utf8mb4) AS config_value,
        CONVERT(CAST(config_type AS BINARY) USING utf8mb4) AS config_type,
        CONVERT(CAST(description AS BINARY) USING utf8mb4) AS description,
        CONVERT(CAST(status AS BINARY) USING utf8mb4) AS status,
        created_at,
        updated_at
      FROM company_configs
      WHERE company_id = ? AND config_key = ?`,
      [companyId, configKey]
    );
    return rows[0];
  }

  // 创建配置
  static async create(configData) {
    const {
      companyId,
      configKey,
      configValue,
      configType,
      description,
      status = 'active'
    } = configData;

    const [result] = await db.query(
      `INSERT INTO company_configs 
       (company_id, config_key, config_value, config_type, description, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [companyId, configKey, configValue, configType, description, status]
    );

    return this.findById(result.insertId);
  }

  // 更新配置
  static async update(id, configData) {
    const {
      configValue,
      configType,
      description,
      status
    } = configData;

    const updates = [];
    const params = [];

    if (configValue !== undefined) {
      updates.push('config_value = ?');
      params.push(configValue);
    }

    if (configType !== undefined) {
      updates.push('config_type = ?');
      params.push(configType);
    }

    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }

    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    await db.query(
      `UPDATE company_configs SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  // 删除配置
  static async delete(id) {
    const [result] = await db.query(
      'DELETE FROM company_configs WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // 批量获取企业配置
  static async findByCompanyId(companyId) {
    const [rows] = await db.query(
      `SELECT 
        id,
        company_id,
        CONVERT(CAST(config_key AS BINARY) USING utf8mb4) AS config_key,
        CONVERT(CAST(config_value AS BINARY) USING utf8mb4) AS config_value,
        CONVERT(CAST(config_type AS BINARY) USING utf8mb4) AS config_type,
        CONVERT(CAST(description AS BINARY) USING utf8mb4) AS description,
        CONVERT(CAST(status AS BINARY) USING utf8mb4) AS status,
        created_at,
        updated_at
      FROM company_configs
      WHERE company_id = ?
      ORDER BY config_key`,
      [companyId]
    );
    return rows;
  }

  // 获取配置类型列表
  static async getConfigTypes() {
    const [rows] = await db.query(
      'SELECT DISTINCT CONVERT(CAST(config_type AS BINARY) USING utf8mb4) AS config_type FROM company_configs ORDER BY config_type'
    );
    return rows.map(row => row.config_type);
  }
}

export default CompanyConfig;
