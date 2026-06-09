-- 企业信息表
CREATE TABLE IF NOT EXISTS companies (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '企业ID',
  name VARCHAR(200) NOT NULL COMMENT '企业名称',
  credit_code VARCHAR(18) NOT NULL UNIQUE COMMENT '统一社会信用代码',
  legal_person VARCHAR(50) NOT NULL COMMENT '法人代表',
  contact_person VARCHAR(50) NOT NULL COMMENT '联系人',
  contact_phone VARCHAR(20) NOT NULL COMMENT '联系电话',
  contact_email VARCHAR(100) NOT NULL COMMENT '联系邮箱',
  address VARCHAR(300) NOT NULL COMMENT '企业地址',
  business_license VARCHAR(500) COMMENT '营业执照文件路径',
  other_documents TEXT COMMENT '其他资质文件路径（多个文件用逗号分隔）',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '审核状态',
  reject_reason TEXT COMMENT '驳回原因',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  approved_at DATETIME COMMENT '审核通过时间',
  rejected_at DATETIME COMMENT '驳回时间',
  INDEX idx_status (status),
  INDEX idx_credit_code (credit_code),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='企业信息表';

INSERT INTO companies (name, credit_code, legal_person, contact_person, contact_phone, contact_email, address, status, approved_at) VALUES
('苏州物流科技有限公司', '91320500000000001X', '张三', '李四', '13800000001', 'contact@example.com', '苏州市工业园区', 'approved', NOW()),
('测试企业A', '91320500000000002X', '王五', '赵六', '13800000002', 'test@example.com', '苏州市姑苏区', 'approved', NOW());
