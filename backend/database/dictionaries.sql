-- 字典表
CREATE TABLE IF NOT EXISTS `dictionaries` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '字典ID',
  `type` VARCHAR(50) NOT NULL COMMENT '字典类型',
  `code` VARCHAR(50) NOT NULL COMMENT '字典代码',
  `name` VARCHAR(100) NOT NULL COMMENT '字典名称',
  `value` VARCHAR(255) NOT NULL COMMENT '字典值',
  `description` TEXT COMMENT '描述',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT '状态：active-启用，inactive-禁用',
  `created_at` DATETIME NOT NULL COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典表';

-- 插入示例数据
INSERT INTO `dictionaries` (`type`, `code`, `name`, `value`, `description`, `sort_order`, `status`, `created_at`) VALUES
('user_status', 'active', '启用', 'active', '用户状态：启用', 1, 'active', CURRENT_TIMESTAMP),
('user_status', 'inactive', '禁用', 'inactive', '用户状态：禁用', 2, 'active', CURRENT_TIMESTAMP),
('user_status', 'locked', '锁定', 'locked', '用户状态：锁定', 3, 'active', CURRENT_TIMESTAMP),
('company_status', 'pending', '待审核', 'pending', '企业状态：待审核', 1, 'active', CURRENT_TIMESTAMP),
('company_status', 'approved', '已通过', 'approved', '企业状态：已通过', 2, 'active', CURRENT_TIMESTAMP),
('company_status', 'rejected', '已驳回', 'rejected', '企业状态：已驳回', 3, 'active', CURRENT_TIMESTAMP),
('vehicle_type', 'truck', '货车', 'truck', '车辆类型：货车', 1, 'active', CURRENT_TIMESTAMP),
('vehicle_type', 'van', '厢式货车', 'van', '车辆类型：厢式货车', 2, 'active', CURRENT_TIMESTAMP),
('vehicle_type', 'trailer', '拖车', 'trailer', '车辆类型：拖车', 3, 'active', CURRENT_TIMESTAMP),
('waybill_status', 'pending', '待接单', 'pending', '运单状态：待接单', 1, 'active', CURRENT_TIMESTAMP),
('waybill_status', 'accepted', '已接单', 'accepted', '运单状态：已接单', 2, 'active', CURRENT_TIMESTAMP),
('waybill_status', 'in_transit', '运输中', 'in_transit', '运单状态：运输中', 3, 'active', CURRENT_TIMESTAMP),
('waybill_status', 'completed', '已完成', 'completed', '运单状态：已完成', 4, 'active', CURRENT_TIMESTAMP),
('waybill_status', 'cancelled', '已取消', 'cancelled', '运单状态：已取消', 5, 'active', CURRENT_TIMESTAMP);
