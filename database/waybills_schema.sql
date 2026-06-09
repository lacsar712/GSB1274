CREATE TABLE IF NOT EXISTS drivers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  license_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plate_number VARCHAR(20) NOT NULL,
  vehicle_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS carriers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS waybills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  waybill_number VARCHAR(50) NOT NULL,
  company_id INT NOT NULL,
  driver_id INT,
  vehicle_id INT,
  carrier_id INT,
  cargo_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'created',
  regulation_status VARCHAR(20),
  risk_level VARCHAR(20),
  regulation_notes TEXT,
  regulation_result TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_waybills_company_id (company_id),
  INDEX idx_waybills_created_at (created_at),
  INDEX idx_waybills_status (status),
  INDEX idx_waybills_regulation_status (regulation_status),
  INDEX idx_waybills_risk_level (risk_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO drivers (name, phone, license_number)
VALUES ('王司机', '13800000001', '苏A12345');

INSERT INTO vehicles (plate_number, vehicle_type)
VALUES ('苏A·12345', '重型货车');

INSERT INTO carriers (name)
VALUES ('测试承运人A');

INSERT INTO waybills (waybill_number, company_id, driver_id, vehicle_id, carrier_id, cargo_name, status, regulation_status, risk_level)
VALUES ('WB-0001', 1, 1, 1, 1, '电子产品', 'created', 'pending', 'medium');

-- 追加多条中文示例运单
INSERT INTO waybills (waybill_number, company_id, driver_id, vehicle_id, carrier_id, cargo_name, status, regulation_status, risk_level) VALUES
('WB-0012', 1, 1, 1, 1, '智能手机', 'in_transit', 'approved', 'low'),
('WB-0013', 1, 1, 1, 1, '笔记本电脑', 'in_transit', 'pending', 'medium'),
('WB-0014', 1, 1, 1, 1, '液体化工品', 'created', 'rejected', 'high'),
('WB-0015', 1, 1, 1, 1, '冷链食品', 'delivered', 'approved', 'low');
