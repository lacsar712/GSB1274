-- 城市末端配送服务数据库表结构

-- 配送订单表
CREATE TABLE IF NOT EXISTS deliveries (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '配送订单ID',
  order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
  company_id VARCHAR(50) COMMENT '企业ID',
  hub_id VARCHAR(50) NOT NULL COMMENT '枢纽ID',
  hub_name VARCHAR(100) NOT NULL COMMENT '枢纽名称',
  
  -- 发件人信息
  sender_name VARCHAR(50) NOT NULL COMMENT '发件人姓名',
  sender_phone VARCHAR(20) NOT NULL COMMENT '发件人电话',
  sender_address VARCHAR(200) NOT NULL COMMENT '发件人地址',
  
  -- 收件人信息
  receiver_name VARCHAR(50) NOT NULL COMMENT '收件人姓名',
  receiver_phone VARCHAR(20) NOT NULL COMMENT '收件人电话',
  receiver_address VARCHAR(200) NOT NULL COMMENT '收件人地址',
  receiver_lat DECIMAL(10, 6) COMMENT '收件人纬度',
  receiver_lng DECIMAL(10, 6) COMMENT '收件人经度',
  
  -- 货物信息
  goods_type VARCHAR(50) COMMENT '货物类型',
  goods_weight DECIMAL(10, 2) COMMENT '货物重量(kg)',
  goods_volume DECIMAL(10, 2) COMMENT '货物体积(m³)',
  
  -- 配送信息
  delivery_type VARCHAR(20) NOT NULL DEFAULT 'instant' COMMENT '配送类型: instant-即时配送, scheduled-预约配送',
  scheduled_time DATETIME COMMENT '预约配送时间',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '订单状态: pending-待分配, assigned-已分配, picking-取货中, delivering-配送中, completed-已完成, cancelled-已取消',
  
  -- 配送员信息
  driver_id VARCHAR(50) COMMENT '配送员ID',
  driver_name VARCHAR(50) COMMENT '配送员姓名',
  assigned_at DATETIME COMMENT '分配时间',
  picked_at DATETIME COMMENT '取货时间',
  completed_at DATETIME COMMENT '完成时间',
  
  -- 其他信息
  remark TEXT COMMENT '备注',
  created_by VARCHAR(50) COMMENT '创建人',
  updated_by VARCHAR(50) COMMENT '更新人',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX idx_company_id (company_id),
  INDEX idx_hub_id (hub_id),
  INDEX idx_status (status),
  INDEX idx_delivery_type (delivery_type),
  INDEX idx_driver_id (driver_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配送订单表';

-- 配送轨迹表
CREATE TABLE IF NOT EXISTS delivery_tracks (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '轨迹ID',
  delivery_id INT NOT NULL COMMENT '配送订单ID',
  latitude DECIMAL(10, 6) NOT NULL COMMENT '纬度',
  longitude DECIMAL(10, 6) NOT NULL COMMENT '经度',
  location VARCHAR(200) COMMENT '位置描述',
  status VARCHAR(20) COMMENT '状态',
  remark VARCHAR(200) COMMENT '备注',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  INDEX idx_delivery_id (delivery_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配送轨迹表';

-- 配送评价表
CREATE TABLE IF NOT EXISTS delivery_ratings (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '评价ID',
  delivery_id INT NOT NULL COMMENT '配送订单ID',
  rating INT NOT NULL COMMENT '评分(1-5)',
  service_rating INT COMMENT '服务评分',
  speed_rating INT COMMENT '速度评分',
  attitude_rating INT COMMENT '态度评分',
  comment TEXT COMMENT '评价内容',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  
  INDEX idx_delivery_id (delivery_id),
  INDEX idx_rating (rating),
  FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配送评价表';

-- 注入中文示例配送订单数据
INSERT INTO deliveries (
  order_no, company_id, hub_id, hub_name,
  sender_name, sender_phone, sender_address,
  receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
  goods_type, goods_weight, goods_volume,
  delivery_type, scheduled_time, status,
  driver_name, assigned_at, picked_at, completed_at,
  remark, created_by
) VALUES
('DL-20260101-0001', '1', 'HZ-001', '苏州工业园区集散中心',
 '张三', '13800138000', '江苏省苏州市工业园区星海街道1号',
 '李四', '13800138001', '江苏省苏州市姑苏区观前街88号', 31.310000, 120.620000,
 '电子产品', 12.50, 0.12,
 'instant', NULL, 'completed',
 '王配送', '2026-02-01 09:00:00', '2026-02-01 09:30:00', '2026-02-01 10:30:00',
 '加急订单', 'system'),
('DL-20260101-0002', '1', 'HZ-002', '苏州相城区集散中心',
 '王五', '13800138002', '江苏省苏州市相城区黄桥街道9号',
 '赵六', '13800138003', '江苏省苏州市吴中区木渎古镇南门', 31.270000, 120.520000,
 '生鲜食品', 8.20, 0.08,
 'scheduled', '2026-02-02 14:00:00', 'delivering',
 '刘配送', '2026-02-02 13:00:00', '2026-02-02 13:30:00', NULL,
 '需冷链运输', 'system');

-- 注入中文示例配送轨迹
INSERT INTO delivery_tracks (delivery_id, latitude, longitude, location, status, remark) VALUES
(1, 31.310500, 120.620500, '工业园区唯亭街道', 'delivering', '路线正常'),
(1, 31.305000, 120.615000, '星海广场附近', 'delivering', '交通顺畅'),
(2, 31.280000, 120.560000, '相城区黄桥', 'delivering', '低速行驶，注意保鲜');

-- 注入中文示例评价
INSERT INTO delivery_ratings (delivery_id, rating, service_rating, speed_rating, attitude_rating, comment) VALUES
(1, 5, 5, 5, 5, '配送及时，态度很好，包装完好'),
(2, 4, 4, 3, 4, '总体满意，速度稍慢但冷链保障到位');

INSERT INTO deliveries (
  order_no, company_id, hub_id, hub_name,
  sender_name, sender_phone, sender_address,
  receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
  goods_type, goods_weight, goods_volume,
  delivery_type, scheduled_time, status,
  driver_name, assigned_at, picked_at, completed_at,
  remark, created_by
) VALUES
('DL-20260206-0101', '1', 'HZ-003', '苏州吴中区集散中心',
 '陈七', '13800138004', '江苏省苏州市吴中区木渎镇金山路18号',
 '周八', '13800138005', '江苏省苏州市吴江区松陵街道流虹路128号', 31.160000, 120.620000,
 '家居用品', 25.30, 0.80,
 'instant', NULL, 'assigned',
 '宋配送', '2026-02-06 11:00:00', NULL, NULL,
 '请注意大件搬运，现场照片：https://upload.wikimedia.org/wikipedia/commons/1/1b/Moving_boxes.jpg', 'system');

INSERT INTO delivery_tracks (delivery_id, latitude, longitude, location, status, remark) VALUES
((SELECT id FROM deliveries WHERE order_no='DL-20260206-0101'), 31.165000, 120.625000, '吴中区金山路', 'delivering', '正常行驶'),
((SELECT id FROM deliveries WHERE order_no='DL-20260206-0101'), 31.170000, 120.630000, '越溪街道', 'delivering', '拥堵缓行');

INSERT INTO delivery_ratings (delivery_id, rating, service_rating, speed_rating, attitude_rating, comment) VALUES
((SELECT id FROM deliveries WHERE order_no='DL-20260206-0101'), 5, 5, 4, 5, '搬运规范，服务到位');

INSERT INTO deliveries (
  order_no, company_id, hub_id, hub_name,
  sender_name, sender_phone, sender_address,
  receiver_name, receiver_phone, receiver_address, receiver_lat, receiver_lng,
  goods_type, goods_weight, goods_volume,
  delivery_type, scheduled_time, status,
  driver_name, assigned_at, picked_at, completed_at,
  remark, created_by
) VALUES
('DL-20260206-0102', '1', 'HZ-001', '苏州工业园区集散中心',
 '钱九', '13800138006', '江苏省苏州市工业园区独墅湖大道288号',
 '吴十', '13800138007', '江苏省苏州市姑苏区桐泾北路100号', 31.330000, 120.600000,
 '食品饮料', 15.80, 0.40,
 'scheduled', '2026-02-06 16:00:00', 'picking',
 '张配送', '2026-02-06 15:20:00', '2026-02-06 15:40:00', NULL,
 '到达后需核验签收，现场照片：https://upload.wikimedia.org/wikipedia/commons/b/b1/Bottled_water_in_boxes.jpg', 'system');

INSERT INTO delivery_tracks (delivery_id, latitude, longitude, location, status, remark) VALUES
((SELECT id FROM deliveries WHERE order_no='DL-20260206-0102'), 31.335000, 120.605000, '独墅湖大道', 'picking', '已取货'),
((SELECT id FROM deliveries WHERE order_no='DL-20260206-0102'), 31.340000, 120.610000, '星湖街', 'delivering', '前往姑苏区');
