-- 企业系统配置表
CREATE TABLE IF NOT EXISTS company_configs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  config JSON NOT NULL COMMENT '系统配置JSON数据',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE KEY uk_company_id (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企业系统配置表';

-- 企业用户表
CREATE TABLE IF NOT EXISTS company_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  username VARCHAR(50) NOT NULL COMMENT '用户名',
  real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
  email VARCHAR(100) NOT NULL COMMENT '邮箱',
  phone VARCHAR(20) NOT NULL COMMENT '手机号',
  password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
  role VARCHAR(20) NOT NULL DEFAULT 'operator' COMMENT '角色：admin-管理员，operator-操作员，viewer-查看者',
  permissions JSON COMMENT '权限列表JSON数组',
  status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态：active-启用，inactive-禁用',
  last_login_at DATETIME COMMENT '最后登录时间',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE KEY uk_company_username (company_id, username),
  INDEX idx_company_id (company_id),
  INDEX idx_username (username),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企业用户表';

-- 企业操作日志表
CREATE TABLE IF NOT EXISTS company_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  user_id INT COMMENT '操作用户ID',
  username VARCHAR(50) COMMENT '操作用户名',
  action VARCHAR(50) NOT NULL COMMENT '操作类型：login-登录，logout-登出，create-创建，update-更新，delete-删除，view-查看，export-导出',
  module VARCHAR(50) NOT NULL COMMENT '模块：waybill-运单，message-消息，statistics-统计，api-API，user-用户，config-配置',
  description VARCHAR(500) NOT NULL COMMENT '操作描述',
  ip VARCHAR(50) COMMENT 'IP地址',
  user_agent VARCHAR(500) COMMENT '用户代理',
  request_data JSON COMMENT '请求数据',
  response_data JSON COMMENT '响应数据',
  status VARCHAR(20) NOT NULL DEFAULT 'success' COMMENT '状态：success-成功，failed-失败',
  error TEXT COMMENT '错误信息',
  created_at DATETIME NOT NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_company_id (company_id),
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_module (module),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企业操作日志表';

-- 插入示例配置数据
INSERT INTO company_configs (company_id, config, created_at, updated_at)
SELECT id, JSON_OBJECT(
  'companyName', name,
  'language', 'zh-CN',
  'timezone', 'Asia/Shanghai',
  'waybillPrefix', '',
  'autoAudit', false,
  'waybillRetentionDays', 365,
  'messagePushEnabled', true,
  'emailNotificationEnabled', false,
  'notificationEmail', contact_email,
  'apiRateLimit', 1000,
  'ipWhitelist', '',
  'passwordStrength', 'medium',
  'sessionTimeout', 120,
  'loginLockEnabled', true,
  'maxLoginAttempts', 5
), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM companies
WHERE status = 'approved'
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 插入示例用户数据（为已审核通过的企业创建默认管理员账户）
INSERT INTO company_users (company_id, username, real_name, email, phone, password, role, permissions, status, created_at, updated_at)
SELECT 
  id,
  CONCAT('admin_', id) as username,
  contact_person as real_name,
  contact_email as email,
  contact_phone as phone,
  'admin123' as password, -- 实际应用中应该加密
  'admin' as role,
  JSON_ARRAY(
    'waybill.view', 'waybill.create', 'waybill.edit', 'waybill.delete',
    'message.view', 'message.send',
    'statistics.view',
    'api.manage',
    'user.manage',
    'config.manage'
  ) as permissions,
  'active' as status,
  CURRENT_TIMESTAMP as created_at,
  CURRENT_TIMESTAMP as updated_at
FROM companies
WHERE status = 'approved'
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
