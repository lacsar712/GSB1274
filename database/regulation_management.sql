-- 监管相关数据库初始化脚本（MySQL 8.0）
-- 包含：业务、抽检、消息、消息设置，以及为运单表补充监管字段

-- 业务表
CREATE TABLE IF NOT EXISTS regulation_businesses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_code VARCHAR(50) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(50) NOT NULL,
  company_id INT NOT NULL,
  description TEXT,
  start_date DATETIME,
  end_date DATETIME,
  status VARCHAR(20) DEFAULT 'active',
  risk_level VARCHAR(20) DEFAULT 'low',
  contact_person VARCHAR(100),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  address TEXT,
  documents JSON,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reg_business_company_id (company_id),
  INDEX idx_reg_business_status (status),
  INDEX idx_reg_business_risk_level (risk_level),
  INDEX idx_reg_business_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 抽检表
CREATE TABLE IF NOT EXISTS regulation_inspections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inspection_code VARCHAR(50) NOT NULL,
  inspection_title VARCHAR(255) NOT NULL,
  inspection_type VARCHAR(50),
  company_id INT NOT NULL,
  business_id INT,
  inspector_id INT,
  inspection_date DATETIME,
  scheduled_date DATETIME,
  description TEXT,
  inspection_items JSON,
  status VARCHAR(20) DEFAULT 'scheduled',
  result VARCHAR(20),
  score DECIMAL(5,2),
  findings TEXT,
  recommendations TEXT,
  attachments JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reg_ins_company_id (company_id),
  INDEX idx_reg_ins_business_id (business_id),
  INDEX idx_reg_ins_status (status),
  INDEX idx_reg_ins_result (result),
  INDEX idx_reg_ins_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 监管消息表
CREATE TABLE IF NOT EXISTS regulation_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50),
  title VARCHAR(255),
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  INDEX idx_reg_msg_user_id (user_id),
  INDEX idx_reg_msg_type (type),
  INDEX idx_reg_msg_is_read (is_read),
  INDEX idx_reg_msg_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 监管消息设置表
CREATE TABLE IF NOT EXISTS regulation_message_settings (
  user_id INT PRIMARY KEY,
  settings JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 注意：以下语句在列已存在时会报错，初次执行用于补充字段
ALTER TABLE waybills ADD COLUMN regulation_status VARCHAR(20) NULL;
ALTER TABLE waybills ADD INDEX idx_waybills_regulation_status (regulation_status);
ALTER TABLE waybills ADD COLUMN risk_level VARCHAR(20) NULL;
ALTER TABLE waybills ADD INDEX idx_waybills_risk_level (risk_level);
ALTER TABLE waybills ADD COLUMN regulation_notes TEXT NULL;
ALTER TABLE waybills ADD COLUMN regulation_result TEXT NULL;
