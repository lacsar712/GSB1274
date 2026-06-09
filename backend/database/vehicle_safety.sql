-- 企业营运车辆安全服务数据库表结构

-- 车辆安全事件表
CREATE TABLE IF NOT EXISTS vehicle_safety (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '安全事件ID',
  
  -- 车辆信息
  vehicle_id VARCHAR(50) NOT NULL COMMENT '车辆ID',
  vehicle_no VARCHAR(20) NOT NULL COMMENT '车牌号',
  company_id VARCHAR(50) NOT NULL COMMENT '企业ID',
  company_name VARCHAR(100) NOT NULL COMMENT '企业名称',
  
  -- 事件信息
  event_type VARCHAR(50) NOT NULL COMMENT '事件类型: speeding-超速, hard_brake-急刹车, hard_acceleration-急加速, fatigue_driving-疲劳驾驶, route_deviation-偏离路线, illegal_parking-违规停车, other-其他',
  event_level VARCHAR(20) NOT NULL COMMENT '事件等级: critical-严重, high-高危, medium-中等, low-低危',
  event_time DATETIME NOT NULL COMMENT '事件发生时间',
  
  -- 位置信息
  location VARCHAR(200) COMMENT '位置描述',
  latitude DECIMAL(10, 6) COMMENT '纬度',
  longitude DECIMAL(10, 6) COMMENT '经度',
  
  -- 车辆状态
  speed DECIMAL(10, 2) COMMENT '车速(km/h)',
  
  -- 事件详情
  description TEXT COMMENT '事件描述',
  
  -- 驾驶员信息
  driver_id VARCHAR(50) COMMENT '驾驶员ID',
  driver_name VARCHAR(50) COMMENT '驾驶员姓名',
  
  -- 处理信息
  status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '处理状态: pending-待处理, processing-处理中, resolved-已处理',
  handle_result TEXT COMMENT '处理结果',
  handled_by VARCHAR(50) COMMENT '处理人',
  handled_at DATETIME COMMENT '处理时间',
  
  -- 其他信息
  created_by VARCHAR(50) COMMENT '创建人',
  updated_by VARCHAR(50) COMMENT '更新人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX idx_vehicle_id (vehicle_id),
  INDEX idx_company_id (company_id),
  INDEX idx_event_type (event_type),
  INDEX idx_event_level (event_level),
  INDEX idx_status (status),
  INDEX idx_event_time (event_time),
  INDEX idx_driver_id (driver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆安全事件表';

-- 车辆安全规则表
CREATE TABLE IF NOT EXISTS vehicle_safety_rules (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '规则ID',
  rule_name VARCHAR(100) NOT NULL COMMENT '规则名称',
  rule_type VARCHAR(50) NOT NULL COMMENT '规则类型',
  rule_level VARCHAR(20) NOT NULL COMMENT '规则等级',
  rule_condition TEXT NOT NULL COMMENT '规则条件(JSON格式)',
  rule_action TEXT COMMENT '规则动作(JSON格式)',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  description TEXT COMMENT '规则描述',
  created_by VARCHAR(50) COMMENT '创建人',
  updated_by VARCHAR(50) COMMENT '更新人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX idx_rule_type (rule_type),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆安全规则表';

-- 车辆安全预警表
CREATE TABLE IF NOT EXISTS vehicle_safety_alerts (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '预警ID',
  vehicle_id VARCHAR(50) NOT NULL COMMENT '车辆ID',
  vehicle_no VARCHAR(20) NOT NULL COMMENT '车牌号',
  alert_type VARCHAR(50) NOT NULL COMMENT '预警类型',
  alert_level VARCHAR(20) NOT NULL COMMENT '预警等级',
  alert_content TEXT NOT NULL COMMENT '预警内容',
  alert_time DATETIME NOT NULL COMMENT '预警时间',
  is_read TINYINT(1) DEFAULT 0 COMMENT '是否已读',
  is_handled TINYINT(1) DEFAULT 0 COMMENT '是否已处理',
  handled_at DATETIME COMMENT '处理时间',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  INDEX idx_vehicle_id (vehicle_id),
  INDEX idx_alert_type (alert_type),
  INDEX idx_alert_level (alert_level),
  INDEX idx_is_read (is_read),
  INDEX idx_is_handled (is_handled),
  INDEX idx_alert_time (alert_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆安全预警表';

-- 车辆安全检查记录表
CREATE TABLE IF NOT EXISTS vehicle_safety_inspections (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '检查记录ID',
  vehicle_id VARCHAR(50) NOT NULL COMMENT '车辆ID',
  vehicle_no VARCHAR(20) NOT NULL COMMENT '车牌号',
  inspection_type VARCHAR(50) NOT NULL COMMENT '检查类型',
  inspection_date DATE NOT NULL COMMENT '检查日期',
  inspector VARCHAR(50) COMMENT '检查人',
  inspection_result VARCHAR(20) NOT NULL COMMENT '检查结果: pass-合格, fail-不合格',
  issues TEXT COMMENT '发现的问题',
  suggestions TEXT COMMENT '整改建议',
  next_inspection_date DATE COMMENT '下次检查日期',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX idx_vehicle_id (vehicle_id),
  INDEX idx_inspection_type (inspection_type),
  INDEX idx_inspection_date (inspection_date),
  INDEX idx_inspection_result (inspection_result)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆安全检查记录表';

-- 注入中文示例安全事件
INSERT INTO vehicle_safety (
  vehicle_id, vehicle_no, company_id, company_name,
  event_type, event_level, event_time,
  location, latitude, longitude, speed,
  description, driver_id, driver_name,
  status, created_by
) VALUES
(1, '苏A·12345', 'C-001', '苏州物流科技有限公司',
 'speeding', 'high', '2026-02-03 08:30:00',
 '沪宁高速苏州段', 31.320000, 120.700000, 110.5,
 '车辆在高速路段发生超速', 'D-0001', '王司机',
 'resolved', 'system'),
(2, '苏B·67890', 'C-001', '苏州物流科技有限公司',
 'hard_brake', 'medium', '2026-02-04 15:20:00',
 '园区现代大道', 31.300000, 120.650000, 45.2,
 '出现急刹车事件，建议保持车距', 'D-0002', '李司机',
 'processing', 'system');

-- 注入中文示例预警
INSERT INTO vehicle_safety_alerts (
  vehicle_id, vehicle_no, alert_type, alert_level, alert_content, alert_time, is_read, is_handled
) VALUES
(1, '苏A·12345', 'speeding', 'high', '检测到连续超速行为，请立即减速', '2026-02-03 08:31:00', 0, 1),
(2, '苏B·67890', 'hard_brake', 'medium', '检测到多次急刹车，请注意安全车距', '2026-02-04 15:21:30', 0, 0);

-- 注入中文示例检查记录
INSERT INTO vehicle_safety_inspections (
  vehicle_id, vehicle_no, inspection_type, inspector, inspection_date, inspection_result, issues, suggestions, next_inspection_date
) VALUES
(1, '苏A·12345', '年度安全检查', '王安检', '2026-01-15', 'pass', NULL, '保持良好车况，定期保养', '2026-12-31'),
(2, '苏B·67890', '临时检查', '李安检', '2026-02-05', 'fail', '刹车片磨损严重', '尽快更换刹车片，复检后上路', '2026-03-01');
