import pool from '../config/database.js';

class Company {
  // 创建企业
  static async create(companyData) {
    const {
      name,
      creditCode,
      legalPerson,
      contactPerson,
      contactPhone,
      contactEmail,
      address,
      businessLicense,
      otherDocuments
    } = companyData;

    const [result] = await pool.execute(
      `INSERT INTO companies 
      (name, credit_code, legal_person, contact_person, contact_phone, 
       contact_email, address, business_license, other_documents, status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [name, creditCode, legalPerson, contactPerson, contactPhone, 
       contactEmail, address, businessLicense, otherDocuments]
    );

    return result.insertId;
  }

  // 获取待审核企业列表
  static async getPendingList() {
    const [rows] = await pool.execute(
      `SELECT 
              id, 
              CONVERT(CAST(name AS BINARY) USING utf8mb4) AS name, 
              credit_code, 
              CONVERT(CAST(legal_person AS BINARY) USING utf8mb4) AS legal_person, 
              CONVERT(CAST(contact_person AS BINARY) USING utf8mb4) AS contact_person, 
              CONVERT(CAST(contact_phone AS BINARY) USING utf8mb4) AS contact_phone, 
              CONVERT(CAST(contact_email AS BINARY) USING utf8mb4) AS contact_email, 
              CONVERT(CAST(address AS BINARY) USING utf8mb4) AS address, 
              business_license, 
              other_documents, 
              CONVERT(CAST(status AS BINARY) USING utf8mb4) AS status, 
              created_at 
       FROM companies 
       WHERE status = 'pending' 
       ORDER BY created_at DESC`
    );
    return rows;
  }

  // 根据ID获取企业信息
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT 
              id, 
              CONVERT(CAST(name AS BINARY) USING utf8mb4) AS name, 
              credit_code, 
              CONVERT(CAST(legal_person AS BINARY) USING utf8mb4) AS legal_person, 
              CONVERT(CAST(contact_person AS BINARY) USING utf8mb4) AS contact_person, 
              CONVERT(CAST(contact_phone AS BINARY) USING utf8mb4) AS contact_phone, 
              CONVERT(CAST(contact_email AS BINARY) USING utf8mb4) AS contact_email, 
              CONVERT(CAST(address AS BINARY) USING utf8mb4) AS address, 
              business_license, 
              other_documents, 
              CONVERT(CAST(status AS BINARY) USING utf8mb4) AS status, 
              created_at, updated_at, 
              approved_at, rejected_at, 
              CONVERT(CAST(reject_reason AS BINARY) USING utf8mb4) AS reject_reason 
       FROM companies 
       WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  // 审核通过
  static async approve(id) {
    const [result] = await pool.execute(
      `UPDATE companies 
       SET status = 'approved', approved_at = NOW(), updated_at = NOW() 
       WHERE id = ? AND status = 'pending'`,
      [id]
    );
    return result.affectedRows > 0;
  }

  // 驳回申请
  static async reject(id, reason) {
    const [result] = await pool.execute(
      `UPDATE companies 
       SET status = 'rejected', rejected_at = NOW(), 
           reject_reason = ?, updated_at = NOW() 
       WHERE id = ? AND status = 'pending'`,
      [reason, id]
    );
    return result.affectedRows > 0;
  }

  // 检查企业信用代码是否已存在
  static async existsByCreditCode(creditCode) {
    const [rows] = await pool.execute(
      'SELECT id FROM companies WHERE credit_code = ?',
      [creditCode]
    );
    return rows.length > 0;
  }

  // 获取所有企业列表（支持状态筛选）
  static async getList(status = null) {
    let query = `SELECT 
                        id, 
                        CONVERT(CAST(name AS BINARY) USING utf8mb4) AS name, 
                        credit_code, 
                        CONVERT(CAST(legal_person AS BINARY) USING utf8mb4) AS legal_person, 
                        CONVERT(CAST(contact_person AS BINARY) USING utf8mb4) AS contact_person,
                        CONVERT(CAST(contact_phone AS BINARY) USING utf8mb4) AS contact_phone, 
                        CONVERT(CAST(contact_email AS BINARY) USING utf8mb4) AS contact_email, 
                        CONVERT(CAST(address AS BINARY) USING utf8mb4) AS address, 
                        CONVERT(CAST(status AS BINARY) USING utf8mb4) AS status,
                        created_at, approved_at
                 FROM companies`;
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  // 更新企业信息
  static async update(id, companyData) {
    const {
      name,
      legalPerson,
      contactPerson,
      contactPhone,
      contactEmail,
      address
    } = companyData;

    const [result] = await pool.execute(
      `UPDATE companies
       SET name = ?, legal_person = ?, contact_person = ?,
           contact_phone = ?, contact_email = ?, address = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [name, legalPerson, contactPerson, contactPhone, contactEmail, address, id]
    );
    return result.affectedRows > 0;
  }

  // 上传企业资质文件
  static async uploadQualification(id, filePath) {
    const company = await this.findById(id);
    if (!company) return false;

    // 将新文件路径添加到现有文件列表
    let documents = company.other_documents ? company.other_documents.split(',') : [];
    documents.push(filePath);

    const [result] = await pool.execute(
      `UPDATE companies
       SET other_documents = ?, updated_at = NOW()
       WHERE id = ?`,
      [documents.join(','), id]
    );
    return result.affectedRows > 0;
  }

  // 删除企业资质文件
  static async deleteQualification(id, filePath) {
    const company = await this.findById(id);
    if (!company) return false;

    // 从文件列表中移除指定文件
    let documents = company.other_documents ? company.other_documents.split(',') : [];
    documents = documents.filter(doc => doc !== filePath);

    const [result] = await pool.execute(
      `UPDATE companies
       SET other_documents = ?, updated_at = NOW()
       WHERE id = ?`,
      [documents.join(','), id]
    );
    return result.affectedRows > 0;
  }

  // 获取企业系统配置
  static async getConfig(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT config FROM company_configs WHERE company_id = ?',
        [id]
      );
      
      if (rows.length === 0) {
        return null;
      }
      
      return typeof rows[0].config === 'string'
        ? JSON.parse(rows[0].config)
        : rows[0].config;
    } catch (error) {
      if (error && (error.code === 'ER_NO_SUCH_TABLE' || (error.sqlMessage && error.sqlMessage.includes('company_configs')))) {
        return null;
      }
      throw error;
    }
  }

  // 更新企业系统配置
  static async updateConfig(id, configData) {
    const configJson = JSON.stringify(configData);
    try {
      // 先检查是否存在配置
      const existing = await this.getConfig(id);
      
      if (existing) {
        const [result] = await pool.execute(
          `UPDATE company_configs
           SET config = ?, updated_at = NOW()
           WHERE company_id = ?`,
          [configJson, id]
        );
        return { success: result.affectedRows > 0, skipped: false };
      } else {
        const [result] = await pool.execute(
          `INSERT INTO company_configs (company_id, config, created_at, updated_at)
           VALUES (?, ?, NOW(), NOW())`,
          [id, configJson]
        );
        return { success: result.affectedRows > 0, skipped: false };
      }
    } catch (error) {
      if (error && (error.code === 'ER_NO_SUCH_TABLE' || (error.sqlMessage && error.sqlMessage.includes('company_configs')))) {
        return { success: true, skipped: true };
      }
      throw error;
    }
  }

  // 获取企业用户列表
  static async getUsers(companyId, filters = {}) {
    const { page = 1, pageSize = 10, username, role, status } = filters;
    const offset = (page - 1) * pageSize;
    
    let query = `SELECT 
                        id, 
                        CONVERT(CAST(username AS BINARY) USING utf8mb4) AS username, 
                        CONVERT(CAST(real_name AS BINARY) USING utf8mb4) AS realName, 
                        CONVERT(CAST(email AS BINARY) USING utf8mb4) AS email, 
                        phone,
                        CONVERT(CAST(role AS BINARY) USING utf8mb4) AS role, 
                        permissions, 
                        CONVERT(CAST(status AS BINARY) USING utf8mb4) AS status, 
                        last_login_at as lastLoginAt,
                        created_at as createdAt
                 FROM company_users
                 WHERE company_id = ?`;
    const params = [companyId];
    
    if (username) {
      query += ' AND username LIKE ?';
      params.push(`%${username}%`);
    }
    
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    // 获取总数
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const [countRows] = await pool.execute(countQuery, params);
    const total = countRows[0].total;
    
    const size = parseInt(pageSize);
    const off = parseInt(offset);
    query += ` ORDER BY created_at DESC LIMIT ${size} OFFSET ${off}`;
    
    const [rows] = await pool.execute(query, params);
    
    // 解析permissions字段
    const users = rows.map(user => ({
      ...user,
      permissions: user.permissions ? JSON.parse(user.permissions) : []
    }));
    
    return {
      users,
      total,
      page,
      pageSize
    };
  }

  // 检查用户名是否存在
  static async userExists(companyId, username) {
    const [rows] = await pool.execute(
      'SELECT id FROM company_users WHERE company_id = ? AND username = ?',
      [companyId, username]
    );
    return rows.length > 0;
  }

  static async getUserByUsername(companyId, username) {
    const [rows] = await pool.execute(
      `SELECT 
              id, 
              CONVERT(CAST(username AS BINARY) USING utf8mb4) AS username, 
              CONVERT(CAST(real_name AS BINARY) USING utf8mb4) AS realName, 
              CONVERT(CAST(email AS BINARY) USING utf8mb4) AS email, 
              phone,
              CONVERT(CAST(role AS BINARY) USING utf8mb4) AS role, 
              permissions, 
              CONVERT(CAST(status AS BINARY) USING utf8mb4) AS status, 
              last_login_at as lastLoginAt,
              created_at as createdAt
       FROM company_users
       WHERE company_id = ? AND username = ?`,
      [companyId, username]
    );
    const user = rows[0] || null;
    if (!user) return null;
    return {
      ...user,
      permissions: user.permissions ? JSON.parse(user.permissions) : []
    };
  }

  // 创建企业用户
  static async createUser(companyId, userData) {
    const {
      username,
      realName,
      email,
      phone,
      password,
      role,
      permissions,
      status
    } = userData;
    
    const permissionsJson = JSON.stringify(permissions || []);
    
    // 这里应该对密码进行加密，简化处理
    const hashedPassword = password; // 实际应使用bcrypt等加密
    
    const [result] = await pool.execute(
      `INSERT INTO company_users
       (company_id, username, real_name, email, phone, password,
        role, permissions, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [companyId, username, realName, email, phone, hashedPassword,
       role, permissionsJson, status || 'active']
    );
    
    return result.insertId;
  }

  // 更新企业用户
  static async updateUser(companyId, userId, userData) {
    const {
      realName,
      email,
      phone,
      role,
      permissions,
      status
    } = userData;
    
    const permissionsJson = JSON.stringify(permissions || []);
    
    const [result] = await pool.execute(
      `UPDATE company_users
       SET real_name = ?, email = ?, phone = ?, role = ?,
           permissions = ?, status = ?, updated_at = NOW()
       WHERE id = ? AND company_id = ?`,
      [realName, email, phone, role, permissionsJson, status, userId, companyId]
    );
    
    return result.affectedRows > 0;
  }

  // 删除企业用户
  static async deleteUser(companyId, userId) {
    const [result] = await pool.execute(
      'DELETE FROM company_users WHERE id = ? AND company_id = ?',
      [userId, companyId]
    );
    return result.affectedRows > 0;
  }

  // 获取企业日志
  static async getLogs(companyId, filters = {}) {
    const {
      page = 1,
      pageSize = 20,
      action,
      module,
      username,
      ip,
      startTime,
      endTime
    } = filters;
    const offset = (page - 1) * pageSize;
    
    let query = `SELECT 
                        id, 
                        CONVERT(CAST(action AS BINARY) USING utf8mb4) AS action, 
                        CONVERT(CAST(module AS BINARY) USING utf8mb4) AS module, 
                        CONVERT(CAST(description AS BINARY) USING utf8mb4) AS description, 
                        user_id as userId,
                        CONVERT(CAST(username AS BINARY) USING utf8mb4) AS username, 
                        CONVERT(CAST(ip AS BINARY) USING utf8mb4) AS ip, 
                        user_agent as userAgent, 
                        CONVERT(CAST(status AS BINARY) USING utf8mb4) AS status,
                        request_data as requestData, response_data as responseData,
                        error, created_at as createdAt
                 FROM company_logs
                 WHERE company_id = ?`;
    const params = [companyId];
    
    if (action) {
      query += ' AND action = ?';
      params.push(action);
    }
    
    if (module) {
      query += ' AND module = ?';
      params.push(module);
    }
    
    if (username) {
      query += ' AND username LIKE ?';
      params.push(`%${username}%`);
    }
    
    if (ip) {
      query += ' AND ip LIKE ?';
      params.push(`%${ip}%`);
    }
    
    if (startTime) {
      query += ' AND created_at >= ?';
      params.push(startTime);
    }
    
    if (endTime) {
      query += ' AND created_at <= ?';
      params.push(endTime);
    }
    
    // 获取总数
    const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as total FROM');
    const [countRows] = await pool.execute(countQuery, params);
    const total = countRows[0].total;
    
    const size2 = parseInt(pageSize);
    const off2 = parseInt(offset);
    query += ` ORDER BY created_at DESC LIMIT ${size2} OFFSET ${off2}`;
    
    const [rows] = await pool.execute(query, params);
    
    return {
      logs: rows,
      total,
      page,
      pageSize
    };
  }

  // 导出企业日志
  static async exportLogs(companyId, filters = {}) {
    const { action, module, username, ip, startTime, endTime } = filters;
    
    let query = `SELECT 
                        id, 
                        CONVERT(CAST(action AS BINARY) USING utf8mb4) AS action, 
                        CONVERT(CAST(module AS BINARY) USING utf8mb4) AS module, 
                        CONVERT(CAST(description AS BINARY) USING utf8mb4) AS description, 
                        CONVERT(CAST(username AS BINARY) USING utf8mb4) AS username, 
                        CONVERT(CAST(ip AS BINARY) USING utf8mb4) AS ip, 
                        CONVERT(CAST(status AS BINARY) USING utf8mb4) AS status,
                        created_at as createdAt
                 FROM company_logs
                 WHERE company_id = ?`;
    const params = [companyId];
    
    if (action) {
      query += ' AND action = ?';
      params.push(action);
    }
    
    if (module) {
      query += ' AND module = ?';
      params.push(module);
    }
    
    if (username) {
      query += ' AND username LIKE ?';
      params.push(`%${username}%`);
    }
    
    if (ip) {
      query += ' AND ip LIKE ?';
      params.push(`%${ip}%`);
    }
    
    if (startTime) {
      query += ' AND created_at >= ?';
      params.push(startTime);
    }
    
    if (endTime) {
      query += ' AND created_at <= ?';
      params.push(endTime);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 10000'; // 限制导出数量
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }
}

export default Company;
