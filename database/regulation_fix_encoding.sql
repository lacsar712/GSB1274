SET NAMES utf8mb4;

-- 统一表字符集并修复示例中文数据
ALTER TABLE companies CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE drivers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE vehicles CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE carriers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE waybills CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

UPDATE companies SET name='测试企业A' WHERE id=1;
UPDATE drivers SET name='王司机' WHERE id=1;
UPDATE drivers SET license_number='苏A12345' WHERE id=1;
UPDATE vehicles SET plate_number='苏A·12345', vehicle_type='重型货车' WHERE id=1;
UPDATE carriers SET name='测试承运人A' WHERE id=1;
UPDATE waybills SET cargo_name='电子产品' WHERE id=1 AND waybill_number='WB-0001';
