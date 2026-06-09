# 驾驶员管理模块

## 功能概述

驾驶员管理模块提供完整的驾驶员信息管理功能，包括驾驶员的基本信息、驾驶证信息、从业资格证信息、紧急联系人信息等。支持驾驶员的创建、查询、更新、删除等操作。

## 功能特性

- ✅ 驾驶员列表查询（支持分页、搜索、筛选）
- ✅ 驾驶员详情查看
- ✅ 驾驶员信息创建
- ✅ 驾驶员信息更新
- ✅ 驾驶员删除（单个/批量）
- ✅ 驾驶员状态管理（在职/离职/停职）
- ✅ 驾驶员统计信息
- ✅ 驾驶证信息管理
- ✅ 从业资格证管理
- ✅ 紧急联系人管理

## 数据模型

### 驾驶员信息字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | Integer | 是 | 驾驶员ID（自动生成） |
| name | String(100) | 是 | 驾驶员姓名 |
| phone | String(20) | 是 | 联系电话（唯一） |
| idCard | String(18) | 是 | 身份证号（唯一） |
| licenseNumber | String(50) | 是 | 驾驶证号（唯一） |
| licenseType | String(10) | 是 | 驾驶证类型（A1/A2/B1/B2/C1等） |
| licenseIssueDate | Date | 否 | 驾驶证发证日期 |
| licenseExpiryDate | Date | 否 | 驾驶证有效期 |
| qualificationNumber | String(50) | 否 | 从业资格证号 |
| qualificationExpiryDate | Date | 否 | 从业资格证有效期 |
| gender | Enum | 否 | 性别（male/female） |
| birthDate | Date | 否 | 出生日期 |
| address | String(255) | 否 | 住址 |
| emergencyContact | String(100) | 否 | 紧急联系人 |
| emergencyPhone | String(20) | 否 | 紧急联系电话 |
| companyId | Integer | 否 | 所属公司ID |
| status | Enum | 是 | 状态（active/inactive/suspended） |
| hireDate | Date | 否 | 入职日期 |
| remarks | Text | 否 | 备注 |
| avatar | String(255) | 否 | 头像URL |
| drivingYears | Integer | 否 | 驾龄（年） |
| createdBy | Integer | 否 | 创建人ID |
| updatedBy | Integer | 否 | 更新人ID |
| createdAt | DateTime | 是 | 创建时间（自动生成） |
| updatedAt | DateTime | 是 | 更新时间（自动生成） |

### 驾驶员状态说明

- **active**: 在职 - 驾驶员正常在职状态
- **inactive**: 离职 - 驾驶员已离职
- **suspended**: 停职 - 驾驶员暂时停职

## API 接口

### 1. 获取驾驶员列表

**接口地址**: `GET /api/drivers`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | Integer | 否 | 页码（默认1） |
| pageSize | Integer | 否 | 每页数量（默认10） |
| keyword | String | 否 | 关键词（姓名/手机号/身份证/驾驶证号） |
| status | String | 否 | 状态筛选 |
| companyId | Integer | 否 | 公司ID筛选 |
| licenseType | String | 否 | 驾驶证类型筛选 |

**响应示例**:

```json
{
  "code": 200,
  "message": "获取驾驶员列表成功",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "张三",
        "phone": "13800138000",
        "idCard": "110101199001011234",
        "licenseNumber": "110101199001011234",
        "licenseType": "A2",
        "gender": "male",
        "status": "active",
        "drivingYears": 10,
        "hireDate": "2020-01-01",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

### 2. 获取驾驶员详情

**接口地址**: `GET /api/drivers/:driverId`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| driverId | Integer | 是 | 驾驶员ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "获取驾驶员详情成功",
  "data": {
    "id": 1,
    "name": "张三",
    "phone": "13800138000",
    "idCard": "110101199001011234",
    "licenseNumber": "110101199001011234",
    "licenseType": "A2",
    "licenseIssueDate": "2010-01-01",
    "licenseExpiryDate": "2030-01-01",
    "qualificationNumber": "Q123456789",
    "qualificationExpiryDate": "2028-01-01",
    "gender": "male",
    "birthDate": "1990-01-01",
    "address": "北京市朝阳区xxx街道xxx号",
    "emergencyContact": "李四",
    "emergencyPhone": "13900139000",
    "companyId": 1,
    "status": "active",
    "hireDate": "2020-01-01",
    "remarks": "优秀驾驶员",
    "avatar": null,
    "drivingYears": 10,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. 创建驾驶员

**接口地址**: `POST /api/drivers`

**请求体**:

```json
{
  "name": "张三",
  "phone": "13800138000",
  "idCard": "110101199001011234",
  "licenseNumber": "110101199001011234",
  "licenseType": "A2",
  "licenseIssueDate": "2010-01-01",
  "licenseExpiryDate": "2030-01-01",
  "qualificationNumber": "Q123456789",
  "qualificationExpiryDate": "2028-01-01",
  "gender": "male",
  "birthDate": "1990-01-01",
  "address": "北京市朝阳区xxx街道xxx号",
  "emergencyContact": "李四",
  "emergencyPhone": "13900139000",
  "companyId": 1,
  "status": "active",
  "hireDate": "2020-01-01",
  "remarks": "优秀驾驶员",
  "drivingYears": 10
}
```

**响应示例**:

```json
{
  "code": 201,
  "message": "创建驾驶员成功",
  "data": {
    "id": 1,
    "name": "张三",
    "phone": "13800138000",
    // ... 其他字段
  }
}
```

### 4. 更新驾驶员

**接口地址**: `PUT /api/drivers/:driverId`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| driverId | Integer | 是 | 驾驶员ID |

**请求体**: 同创建驾驶员接口

**响应示例**:

```json
{
  "code": 200,
  "message": "更新驾驶员成功",
  "data": {
    "id": 1,
    "name": "张三",
    // ... 其他字段
  }
}
```

### 5. 删除驾驶员

**接口地址**: `DELETE /api/drivers/:driverId`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| driverId | Integer | 是 | 驾驶员ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "删除驾驶员成功"
}
```

### 6. 批量删除驾驶员

**接口地址**: `POST /api/drivers/batch/delete`

**请求体**:

```json
{
  "driverIds": [1, 2, 3]
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "批量删除驾驶员成功"
}
```

### 7. 更新驾驶员状态

**接口地址**: `PATCH /api/drivers/:driverId/status`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| driverId | Integer | 是 | 驾驶员ID |

**请求体**:

```json
{
  "status": "active"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "更新驾驶员状态成功",
  "data": {
    "id": 1,
    "status": "active",
    // ... 其他字段
  }
}
```

### 8. 获取驾驶员统计信息

**接口地址**: `GET /api/drivers/statistics`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| companyId | Integer | 否 | 公司ID筛选 |

**响应示例**:

```json
{
  "code": 200,
  "message": "获取驾驶员统计信息成功",
  "data": {
    "total": 100,
    "active": 80,
    "inactive": 15,
    "suspended": 5,
    "licenseTypes": [
      {
        "type": "A1",
        "count": 20
      },
      {
        "type": "A2",
        "count": 30
      },
      {
        "type": "B2",
        "count": 25
      },
      {
        "type": "C1",
        "count": 25
      }
    ]
  }
}
```

## 前端页面

### 1. 驾驶员列表页面

**路由**: `/drivers`

**功能**:
- 展示驾驶员列表（表格形式）
- 支持关键词搜索（姓名/手机号/身份证/驾驶证号）
- 支持状态筛选
- 支持驾驶证类型筛选
- 显示统计信息卡片
- 支持单个删除
- 支持批量删除
- 支持状态快速切换
- 支持分页

**文件位置**: [`frontend/src/views/driver/List.vue`](frontend/src/views/driver/List.vue)

### 2. 驾驶员详情页面

**路由**: `/drivers/:id`

**功能**:
- 展示驾驶员完整信息
- 分区域展示（基本信息、驾驶证信息、紧急联系人、工作信息、系统信息）
- 支持编辑跳转
- 支持删除操作

**文件位置**: [`frontend/src/views/driver/Detail.vue`](frontend/src/views/driver/Detail.vue)

### 3. 驾驶员创建/编辑页面

**路由**: 
- 创建: `/drivers/create`
- 编辑: `/drivers/:id/edit`

**功能**:
- 表单录入驾驶员信息
- 表单验证（必填项、格式验证）
- 支持创建和编辑两种模式
- 分区域录入（基本信息、驾驶证信息、紧急联系人、工作信息）

**文件位置**: [`frontend/src/views/driver/Create.vue`](frontend/src/views/driver/Create.vue)

## 数据库表结构

```sql
CREATE TABLE `drivers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '驾驶员姓名',
  `phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
  `id_card` VARCHAR(18) NOT NULL COMMENT '身份证号',
  `license_number` VARCHAR(50) NOT NULL COMMENT '驾驶证号',
  `license_type` VARCHAR(10) NOT NULL COMMENT '驾驶证类型',
  `license_issue_date` DATE NULL COMMENT '驾驶证发证日期',
  `license_expiry_date` DATE NULL COMMENT '驾驶证有效期',
  `qualification_number` VARCHAR(50) NULL COMMENT '从业资格证号',
  `qualification_expiry_date` DATE NULL COMMENT '从业资格证有效期',
  `gender` ENUM('male', 'female') NULL COMMENT '性别',
  `birth_date` DATE NULL COMMENT '出生日期',
  `address` VARCHAR(255) NULL COMMENT '住址',
  `emergency_contact` VARCHAR(100) NULL COMMENT '紧急联系人',
  `emergency_phone` VARCHAR(20) NULL COMMENT '紧急联系电话',
  `company_id` INT NULL COMMENT '所属公司ID',
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active' COMMENT '状态',
  `hire_date` DATE NULL COMMENT '入职日期',
  `remarks` TEXT NULL COMMENT '备注',
  `avatar` VARCHAR(255) NULL COMMENT '头像URL',
  `driving_years` INT NULL COMMENT '驾龄（年）',
  `created_by` INT NULL COMMENT '创建人ID',
  `updated_by` INT NULL COMMENT '更新人ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`),
  UNIQUE KEY `uk_id_card` (`id_card`),
  UNIQUE KEY `uk_license_number` (`license_number`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='驾驶员信息表';
```

## 文件结构

```
backend/
├── src/
│   ├── models/
│   │   └── Driver.js              # 驾驶员数据模型
│   ├── controllers/
│   │   └── driverController.js    # 驾驶员控制器
│   └── routes/
│       └── drivers.js             # 驾驶员路由

frontend/
├── src/
│   ├── api/
│   │   └── driver.js              # 驾驶员API接口
│   ├── views/
│   │   └── driver/
│   │       ├── List.vue           # 驾驶员列表页面
│   │       ├── Detail.vue         # 驾驶员详情页面
│   │       └── Create.vue         # 驾驶员创建/编辑页面
│   └── router/
│       └── index.js               # 路由配置（包含驾驶员路由）
```

## 使用说明

### 后端部署

1. 确保数据库已创建 `drivers` 表
2. 在 [`backend/src/app.js`](backend/src/app.js:12) 中已注册驾驶员路由
3. 启动后端服务

### 前端使用

1. 访问 `/drivers` 查看驾驶员列表
2. 点击"新增驾驶员"按钮创建驾驶员
3. 点击"查看"按钮查看驾驶员详情
4. 点击"编辑"按钮编辑驾驶员信息
5. 点击"删除"按钮删除驾驶员
6. 使用搜索和筛选功能快速查找驾驶员

## 注意事项

1. **唯一性约束**: 手机号、身份证号、驾驶证号必须唯一
2. **必填字段**: 姓名、手机号、身份证号、驾驶证号、驾驶证类型为必填项
3. **状态管理**: 驾驶员状态分为在职、离职、停职三种
4. **数据验证**: 
   - 手机号格式验证（11位数字，1开头）
   - 身份证号格式验证（18位）
5. **权限控制**: 建议添加权限验证，确保只有授权用户可以操作
6. **数据关联**: 驾驶员可以关联到公司（通过 companyId）

## 扩展功能建议

1. **证件照片上传**: 支持上传驾驶证、身份证照片
2. **证件到期提醒**: 驾驶证、从业资格证到期前自动提醒
3. **驾驶员评分**: 添加驾驶员评分和评价功能
4. **违章记录**: 记录驾驶员违章信息
5. **培训记录**: 记录驾驶员培训历史
6. **工作记录**: 关联运单，查看驾驶员工作历史
7. **导入导出**: 支持批量导入导出驾驶员信息
8. **数据统计**: 更详细的驾驶员数据分析和报表

## 更新日志

### v1.0.0 (2024-01-01)
- ✅ 初始版本发布
- ✅ 实现驾驶员基本CRUD功能
- ✅ 实现驾驶员列表查询和筛选
- ✅ 实现驾驶员状态管理
- ✅ 实现驾驶员统计功能
