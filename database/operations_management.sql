-- 运营管理系统数据库初始化脚本

-- ============================================
-- 运营消息中心
-- ============================================

-- 运营消息表
CREATE TABLE IF NOT EXISTS operations_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  type VARCHAR(50) DEFAULT 'system',
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'active',
  read_status VARCHAR(20) DEFAULT 'unread',
  sender VARCHAR(100),
  receiver VARCHAR(100),
  attachments JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_operations_messages_type ON operations_messages(type);
CREATE INDEX IF NOT EXISTS idx_operations_messages_status ON operations_messages(status);
CREATE INDEX IF NOT EXISTS idx_operations_messages_read_status ON operations_messages(read_status);
CREATE INDEX IF NOT EXISTS idx_operations_messages_created_at ON operations_messages(created_at);

-- 消息设置表
CREATE TABLE IF NOT EXISTS message_settings (
  user_id INTEGER PRIMARY KEY,
  email_notification BOOLEAN DEFAULT true,
  sms_notification BOOLEAN DEFAULT false,
  push_notification BOOLEAN DEFAULT true,
  notification_types TEXT[],
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 运维监控
-- ============================================

-- 系统日志表
CREATE TABLE IF NOT EXISTS system_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  level VARCHAR(20) NOT NULL,
  module VARCHAR(50),
  message TEXT NOT NULL,
  details JSON,
  user_id INTEGER,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_module ON system_logs(module);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);

-- ============================================
-- 运营系统管理
-- ============================================

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT,
  config_type VARCHAR(20) DEFAULT 'string',
  description TEXT,
  category VARCHAR(50) DEFAULT 'system',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_system_config_category ON system_config(category);
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);

-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INTEGER,
  username VARCHAR(100),
  action VARCHAR(50) NOT NULL,
  module VARCHAR(50),
  description TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  request_data JSON,
  response_data JSON,
  status VARCHAR(20) DEFAULT 'success',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_operation_logs_user_id ON operation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_logs_action ON operation_logs(action);
CREATE INDEX IF NOT EXISTS idx_operation_logs_module ON operation_logs(module);
CREATE INDEX IF NOT EXISTS idx_operation_logs_created_at ON operation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_operation_logs_status ON operation_logs(status);

-- ============================================
-- 插入示例数据
-- ============================================

-- 插入示例消息
INSERT INTO operations_messages (title, content, type, priority, sender, receiver) VALUES
('系统维护通知', '系统将于今晚22:00-24:00进行维护，期间服务可能暂时中断，请提前做好准备。', 'system', 'high', '系统管理员', '所有用户'),
('新功能上线', '运营管理系统新增了性能监控功能，欢迎体验使用。', 'operation', 'medium', '产品团队', '所有用户'),
('数据库告警', '数据库连接数接近上限，请及时处理。', 'alert', 'high', '监控系统', '运维团队'),
('每周报表', '本周系统运行报表已生成，请查看附件。', 'notification', 'low', '系统', '管理员');

-- 插入系统配置示例
INSERT INTO system_config (config_key, config_value, config_type, description, category, is_public) VALUES
('system.name', '运营管理系统', 'string', '系统名称', 'system', true),
('system.version', '1.0.0', 'string', '系统版本', 'system', true),
('system.maintenance_mode', 'false', 'boolean', '维护模式', 'system', false),
('database.max_connections', '100', 'number', '最大数据库连接数', 'database', false),
('database.connection_timeout', '30000', 'number', '连接超时时间(ms)', 'database', false),
('security.session_timeout', '3600', 'number', '会话超时时间(秒)', 'security', false),
('security.password_min_length', '8', 'number', '密码最小长度', 'security', true),
('security.enable_2fa', 'false', 'boolean', '启用双因素认证', 'security', true),
('notification.email_enabled', 'true', 'boolean', '启用邮件通知', 'notification', false),
('notification.sms_enabled', 'false', 'boolean', '启用短信通知', 'notification', false),
('performance.cache_enabled', 'true', 'boolean', '启用缓存', 'performance', false),
('performance.cache_ttl', '300', 'number', '缓存过期时间(秒)', 'performance', false),
('feature.api_rate_limit', '1000', 'number', 'API速率限制(请求/小时)', 'feature', false),
('feature.file_upload_max_size', '10485760', 'number', '文件上传最大大小(字节)', 'feature', true);

-- 插入系统日志示例
INSERT INTO system_logs (level, module, message, user_id, ip_address) VALUES
('info', 'system', '系统启动成功', NULL, '127.0.0.1'),
('info', 'auth', '用户登录成功', 1, '192.168.1.100'),
('warning', 'database', '数据库连接数较高', NULL, '127.0.0.1'),
('error', 'api', 'API请求失败: 超时', 2, '192.168.1.101'),
('info', 'system', '系统配置更新', 1, '192.168.1.100');

-- 插入操作日志示例
INSERT INTO operation_logs (user_id, username, action, module, description, ip_address, status) VALUES
(1, 'admin', 'login', 'auth', '管理员登录系统', '192.168.1.100', 'success'),
(1, 'admin', 'update', 'system', '更新系统配置', '192.168.1.100', 'success'),
(2, 'operator', 'create', 'data', '创建新数据记录', '192.168.1.101', 'success'),
(2, 'operator', 'query', 'data', '查询数据列表', '192.168.1.101', 'success'),
(1, 'admin', 'update', 'permission', '更新用户权限', '192.168.1.100', 'success');

-- ============================================
-- 创建视图
-- ============================================

-- 未读消息统计视图
CREATE OR REPLACE VIEW unread_messages_stats AS
SELECT 
  type,
  COUNT(*) as unread_count
FROM operations_messages
WHERE read_status = 'unread' AND status = 'active'
GROUP BY type;

-- 系统日志统计视图
CREATE OR REPLACE VIEW system_logs_stats AS
SELECT 
  level,
  module,
  DATE(created_at) as log_date,
  COUNT(*) as log_count
FROM system_logs
GROUP BY level, module, DATE(created_at);

-- 操作日志统计视图
CREATE OR REPLACE VIEW operation_logs_stats AS
SELECT 
  action,
  module,
  DATE(created_at) as log_date,
  COUNT(*) as operation_count,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count,
  COUNT(CASE WHEN status != 'success' THEN 1 END) as failure_count
FROM operation_logs
GROUP BY action, module, DATE(created_at);

-- ============================================
-- 创建函数
-- ============================================

-- 自动更新 updated_at 字段的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为相关表创建触发器
DROP TRIGGER IF EXISTS update_operations_messages_updated_at ON operations_messages;
CREATE TRIGGER update_operations_messages_updated_at
  BEFORE UPDATE ON operations_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_message_settings_updated_at ON message_settings;
CREATE TRIGGER update_message_settings_updated_at
  BEFORE UPDATE ON message_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_config_updated_at ON system_config;
CREATE TRIGGER update_system_config_updated_at
  BEFORE UPDATE ON system_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 权限设置
-- ============================================

-- 注意：根据实际情况调整用户和权限
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- ============================================
-- 完成
-- ============================================

-- 显示创建的表
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'operations_messages',
    'message_settings',
    'system_logs',
    'system_config',
    'operation_logs'
  )
ORDER BY table_name;

COMMENT ON TABLE operations_messages IS '运营消息表';
COMMENT ON TABLE message_settings IS '消息设置表';
COMMENT ON TABLE system_logs IS '系统日志表';
COMMENT ON TABLE system_config IS '系统配置表';
COMMENT ON TABLE operation_logs IS '操作日志表';
