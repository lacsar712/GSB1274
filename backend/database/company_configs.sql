-- 企业配置表
CREATE TABLE IF NOT EXISTS company_configs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL COMMENT '企业ID',
  config_key VARCHAR(100) NOT NULL COMMENT '配置键',
  config_value TEXT NOT NULL COMMENT '配置值',
  config_type VARCHAR(50) NOT NULL COMMENT '配置类型（如：system, business, notification等）',
  description TEXT COMMENT '配置描述',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY unique_company_config (company_id, config_key),
  INDEX idx_company_id (company_id),
  INDEX idx_config_type (config_type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='企业配置表';

-- 插入示例数据
INSERT INTO company_configs (company_id, config_key, config_value, config_type, description) VALUES
(1, 'max_waybills_per_day', '100', 'business', '每日最大运单数量'),
(1, 'notification_email', 'admin@company1.com', 'notification', '通知邮箱'),
(1, 'auto_audit', 'true', 'system', '自动审核开关'),
(1, 'payment_method', 'bank_transfer', 'business', '支付方式'),
(2, 'max_waybills_per_day', '200', 'business', '每日最大运单数量'),
(2, 'notification_email', 'admin@company2.com', 'notification', '通知邮箱');
