INSERT INTO drivers (name, phone, license_number) VALUES
('王强', '13800000010', '苏A12345'),
('李敏', '13800000011', '苏B54321'),
('张伟', '13800000012', '苏C67890');

INSERT INTO vehicles (plate_number, vehicle_type) VALUES
('苏A·12345', '重型货车'),
('苏B·67890', '中型货车'),
('苏C·54321', '轻型货车');

INSERT INTO carriers (name) VALUES
('苏州承运人一号'),
('苏州承运人二号'),
('苏州承运人三号');

INSERT INTO waybills (waybill_number, company_id, driver_id, vehicle_id, carrier_id, cargo_name, status, regulation_status, risk_level) VALUES
('WB-0002', 1, 2, 2, 2, '电子产品', 'created', 'approved', 'low'),
('WB-0003', 1, 3, 3, 3, '食品', 'in_transit', 'pending', 'medium'),
('WB-0004', 1, 1, 2, 1, '化工品', 'in_transit', 'rejected', 'high'),
('WB-0005', 1, 2, 3, 2, '纺织品', 'delivered', 'approved', 'low'),
('WB-0006', 1, 3, 1, 3, '机械设备', 'created', 'pending', 'medium'),
('WB-0007', 1, 1, 1, 1, '药品', 'delivered', 'approved', 'low'),
('WB-0008', 1, 2, 2, 2, '饮料', 'in_transit', 'pending', 'medium'),
('WB-0009', 1, 3, 3, 3, '家具', 'created', 'rejected', 'high'),
('WB-0010', 1, 1, 3, 2, '钢材', 'in_transit', 'approved', 'low'),
('WB-0011', 1, 2, 1, 3, '玻璃制品', 'delivered', 'pending', 'medium');

INSERT INTO regulation_inspections (
  inspection_code, inspection_title, inspection_type, company_id, business_id,
  inspector_id, status, result, score
) VALUES
('RI-0002', 'Routine Check A', 'routine', 1, NULL, 1, 'completed', 'passed', 95.0),
('RI-0003', '日常抽检B', 'routine', 1, NULL, 1, 'completed', 'failed', 60.0),
('RI-0004', '专项检查C', 'special', 1, NULL, 1, 'scheduled', NULL, NULL),
('RI-0005', '复检D', 'followup', 1, NULL, 1, 'in_progress', NULL, NULL),
('RI-0006', '随机抽检E', 'random', 1, NULL, 1, 'completed', 'passed', 88.0);

INSERT INTO regulation_messages (user_id, type, title, content, is_read) VALUES
(1, 'inspection_result', '抽检合格', '日常抽检结果：合格', false),
(1, 'inspection_result', '抽检不合格', '日常抽检结果：不合格', false),
(1, 'waybill_status', '运单监管通过', 'WB-0002 监管审核通过', true),
(1, 'system_notice', '系统更新', '监管模块已更新，优化统计与批量操作', false),
(1, 'business_alert', '高风险运单提醒', '运单 WB-0004 被标记为高风险请关注', false);

-- 为抽检附件补充真实图片URL（维基共享资源示例）
UPDATE regulation_inspections 
SET attachments = JSON_ARRAY(
  JSON_OBJECT('name','检查现场照片1','url','https://upload.wikimedia.org/wikipedia/commons/3/3c/Truck_in_China.jpg'),
  JSON_OBJECT('name','货物外包装','url','https://upload.wikimedia.org/wikipedia/commons/4/47/Cardboard_boxes_on_pallet.jpg')
) WHERE inspection_code IN ('RI-0003','RI-0006');
