# 企业配置库功能文档

## 功能概述

企业配置库提供了完整的企业配置信息管理功能，支持配置的创建、查询、更新和删除操作。

## 功能特性

### 1. 配置管理
- 支持多种配置类型（系统配置、业务配置、通知配置、支付配置等）
- 配置键值对存储，支持复杂配置值
- 配置状态管理（启用/禁用）
- 配置描述信息

### 2. 前端页面

#### 2.1 企业配置列表页面
**路径**: `/company-configs`

**功能**:
- 卡片式布局展示配置信息
- 支持按企业ID、配置类型、状态筛选
- 分页显示配置列表
- 支持创建、编辑、删除配置
- 查看配置详情

**页面组件**: [`frontend/src/views/companyConfig/List.vue`](frontend/src/views/companyConfig/List.vue)

#### 2.2 企业配置详情页面
**路径**: `/company-configs/:id`

**功能**:
- 展示配置完整信息
- 支持在线编辑配置
- 支持删除配置
- 显示配置创建和更新时间

**页面组件**: [`frontend/src/views/companyConfig/Detail.vue`](frontend/src/views/companyConfig/Detail.vue)

### 3. 后端接口

#### 3.1 获取企业配置列表
```
GET /api/company-configs
```

**查询参数**:
- `companyId`: 企业ID（可选）
- `configType`: 配置类型（可选）
- `status`: 状态（可选）
- `page`: 页码（默认1）
- `limit`: 每页数量（默认10）

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_id": 1,
      "config_key": "max_waybills_per_day",
      "config_value": "100",
      "config_type": "business",
      "description": "每日最大运单数量",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### 3.2 创建企业配置
```
POST /api/company-configs
```

**请求体**:
```json
{
  "companyId": 1,
  "configKey": "notification_email",
  "configValue": "admin@company.com",
  "configType": "notification",
  "description": "通知邮箱",
  "status": "active"
}
```

#### 3.3 更新企业配置
```
PUT /api/company-configs/:configId
```

**请求体**:
```json
{
  "configValue": "new_value",
  "configType": "system",
  "description": "更新后的描述",
  "status": "active"
}
```

#### 3.4 获取企业配置详情
```
GET /api/company-configs/:configId
```

#### 3.5 删除企业配置
```
DELETE /api/company-configs/:configId
```

#### 3.6 根据企业ID获取所有配置
```
GET /api/company-configs/company/:companyId
```

#### 3.7 获取配置类型列表
```
GET /api/company-configs/types
```

### 4. 数据模型

**数据库表**: `company_configs`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键ID |
| company_id | INT | 企业ID |
| config_key | VARCHAR(100) | 配置键 |
| config_value | TEXT | 配置值 |
| config_type | VARCHAR(50) | 配置类型 |
| description | TEXT | 配置描述 |
| status | ENUM | 状态（active/inactive） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

**模型文件**: [`backend/src/models/CompanyConfig.js`](backend/src/models/CompanyConfig.js:1)

### 5. 配置类型说明

- **system**: 系统配置（如自动审核开关）
- **business**: 业务配置（如每日最大运单数量）
- **notification**: 通知配置（如通知邮箱、短信接口）
- **payment**: 支付配置（如支付方式、支付接口）
- **other**: 其他配置

## 使用示例

### 前端调用示例

```javascript
import { 
  getCompanyConfigs, 
  createCompanyConfig, 
  updateCompanyConfig 
} from '@/api/companyConfig';

// 获取配置列表
const configs = await getCompanyConfigs({
  companyId: 1,
  configType: 'business',
  page: 1,
  limit: 10
});

// 创建配置
const newConfig = await createCompanyConfig({
  companyId: 1,
  configKey: 'max_drivers',
  configValue: '50',
  configType: 'business',
  description: '最大驾驶员数量'
});

// 更新配置
const updated = await updateCompanyConfig(configId, {
  configValue: '100',
  status: 'active'
});
```

## 注意事项

1. 配置键（config_key）在同一企业内必须唯一
2. 配置值（config_value）支持存储JSON格式的复杂数据
3. 删除配置前请确认该配置未被系统使用
4. 建议定期备份重要配置信息

## 相关文件

- 前端API: [`frontend/src/api/companyConfig.js`](frontend/src/api/companyConfig.js:1)
- 后端路由: [`backend/src/routes/companyConfigs.js`](backend/src/routes/companyConfigs.js:1)
- 后端控制器: [`backend/src/controllers/companyConfigController.js`](backend/src/controllers/companyConfigController.js:1)
- 数据库脚本: [`backend/database/company_configs.sql`](backend/database/company_configs.sql:1)
