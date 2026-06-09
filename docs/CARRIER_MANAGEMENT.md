# 承运人管理模块

## 功能概述

承运人管理模块用于管理实际承运人信息，包括承运人的基本信息、资质信息、运营统计等。支持承运人的创建、查询、更新和删除操作。

## 数据库设计

### carriers 表结构

```sql
CREATE TABLE carriers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL COMMENT '承运人名称',
  contact_person VARCHAR(100) NOT NULL COMMENT '联系人',
  contact_phone VARCHAR(20) NOT NULL COMMENT '联系电话',
  contact_email VARCHAR(100) COMMENT '联系邮箱',
  address TEXT COMMENT '地址',
  business_license VARCHAR(100) COMMENT '营业执照号',
  transport_license VARCHAR(100) COMMENT '道路运输许可证',
  vehicle_count INT DEFAULT 0 COMMENT '车辆数量',
  driver_count INT DEFAULT 0 COMMENT '司机数量',
  service_area TEXT COMMENT '服务区域',
  description TEXT COMMENT '描述',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_name (name),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='承运人表';
```

### 字段说明

- **id**: 承运人唯一标识
- **name**: 承运人名称（必填）
- **contact_person**: 联系人姓名（必填）
- **contact_phone**: 联系电话（必填，格式：11位手机号）
- **contact_email**: 联系邮箱（选填）
- **address**: 详细地址（选填）
- **business_license**: 营业执照号（选填）
- **transport_license**: 道路运输许可证号（选填）
- **vehicle_count**: 车辆数量（默认0）
- **driver_count**: 司机数量（默认0）
- **service_area**: 服务区域（选填）
- **description**: 承运人描述（选填）
- **status**: 状态（active-活跃，inactive-停用，suspended-暂停）
- **created_at**: 创建时间
- **updated_at**: 更新时间

## API 接口

### 1. 获取承运人列表

**接口地址**: `GET /api/carriers`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 否 | 承运人名称（模糊搜索） |
| contact_person | string | 否 | 联系人（模糊搜索） |
| status | string | 否 | 状态（active/inactive/suspended） |
| page | number | 否 | 页码（默认1） |
| pageSize | number | 否 | 每页数量（默认10） |

**响应示例**:

```json
{
  "code": 200,
  "message": "获取承运人列表成功",
  "data": [
    {
      "id": 1,
      "name": "顺丰速运",
      "contact_person": "张三",
      "contact_phone": "13800138000",
      "contact_email": "zhangsan@sf.com",
      "address": "深圳市福田区",
      "business_license": "91440300XXXXXXXXXX",
      "transport_license": "粤交运许字XXXXXX号",
      "vehicle_count": 100,
      "driver_count": 150,
      "service_area": "全国",
      "description": "专业物流服务",
      "status": "active",
      "waybill_count": 50,
      "total_freight": 150000.00,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

### 2. 获取承运人详情

**接口地址**: `GET /api/carriers/:carrierId`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| carrierId | number | 是 | 承运人ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "获取承运人详情成功",
  "data": {
    "id": 1,
    "name": "顺丰速运",
    "contact_person": "张三",
    "contact_phone": "13800138000",
    "contact_email": "zhangsan@sf.com",
    "address": "深圳市福田区",
    "business_license": "91440300XXXXXXXXXX",
    "transport_license": "粤交运许字XXXXXX号",
    "vehicle_count": 100,
    "driver_count": 150,
    "service_area": "全国",
    "description": "专业物流服务",
    "status": "active",
    "waybill_count": 50,
    "total_freight": 150000.00,
    "avg_rating": 4.8,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "recent_waybills": [
      {
        "id": 1,
        "waybill_number": "WB202401010001",
        "origin": "深圳",
        "destination": "北京",
        "freight_amount": 3000.00,
        "status": "completed",
        "created_at": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 3. 创建承运人

**接口地址**: `POST /api/carriers`

**请求体**:

```json
{
  "name": "顺丰速运",
  "contact_person": "张三",
  "contact_phone": "13800138000",
  "contact_email": "zhangsan@sf.com",
  "address": "深圳市福田区",
  "business_license": "91440300XXXXXXXXXX",
  "transport_license": "粤交运许字XXXXXX号",
  "vehicle_count": 100,
  "driver_count": 150,
  "service_area": "全国",
  "description": "专业物流服务",
  "status": "active"
}
```

**字段说明**:

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 承运人名称 |
| contact_person | string | 是 | 联系人 |
| contact_phone | string | 是 | 联系电话（11位手机号） |
| contact_email | string | 否 | 联系邮箱 |
| address | string | 否 | 地址 |
| business_license | string | 否 | 营业执照号 |
| transport_license | string | 否 | 道路运输许可证 |
| vehicle_count | number | 否 | 车辆数量 |
| driver_count | number | 否 | 司机数量 |
| service_area | string | 否 | 服务区域 |
| description | string | 否 | 描述 |
| status | string | 否 | 状态（默认active） |

**响应示例**:

```json
{
  "code": 201,
  "message": "创建承运人成功",
  "data": {
    "id": 1,
    "name": "顺丰速运",
    "contact_person": "张三",
    "contact_phone": "13800138000",
    "contact_email": "zhangsan@sf.com",
    "address": "深圳市福田区",
    "business_license": "91440300XXXXXXXXXX",
    "transport_license": "粤交运许字XXXXXX号",
    "vehicle_count": 100,
    "driver_count": 150,
    "service_area": "全国",
    "description": "专业物流服务",
    "status": "active",
    "waybill_count": 0,
    "total_freight": 0,
    "avg_rating": 0,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. 更新承运人

**接口地址**: `PUT /api/carriers/:carrierId`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| carrierId | number | 是 | 承运人ID |

**请求体**: 同创建承运人接口

**响应示例**:

```json
{
  "code": 200,
  "message": "更新承运人成功",
  "data": {
    "id": 1,
    "name": "顺丰速运",
    "contact_person": "张三",
    "contact_phone": "13800138000",
    "contact_email": "zhangsan@sf.com",
    "address": "深圳市福田区",
    "business_license": "91440300XXXXXXXXXX",
    "transport_license": "粤交运许字XXXXXX号",
    "vehicle_count": 100,
    "driver_count": 150,
    "service_area": "全国",
    "description": "专业物流服务",
    "status": "active",
    "waybill_count": 50,
    "total_freight": 150000.00,
    "avg_rating": 4.8,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-02T00:00:00.000Z"
  }
}
```

### 5. 删除承运人

**接口地址**: `DELETE /api/carriers/:carrierId`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| carrierId | number | 是 | 承运人ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "删除承运人成功"
}
```

**注意**: 如果承运人有关联的运单记录，将无法删除，返回错误信息。

### 6. 更新承运人状态

**接口地址**: `PATCH /api/carriers/:carrierId/status`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| carrierId | number | 是 | 承运人ID |

**请求体**:

```json
{
  "status": "inactive"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "更新承运人状态成功",
  "data": {
    "id": 1,
    "name": "顺丰速运",
    "status": "inactive",
    "updated_at": "2024-01-02T00:00:00.000Z"
  }
}
```

### 7. 获取承运人统计信息

**接口地址**: `GET /api/carriers/:carrierId/statistics`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| carrierId | number | 是 | 承运人ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "获取承运人统计信息成功",
  "data": {
    "total_waybills": 100,
    "completed_waybills": 80,
    "in_transit_waybills": 15,
    "cancelled_waybills": 5,
    "total_freight": 300000.00,
    "avg_rating": 4.8
  }
}
```

## 前端页面

### 1. 承运人列表页面

**路由**: `/carriers`

**功能**:
- 卡片式布局展示承运人信息
- 支持按名称、联系人、状态筛选
- 显示承运人基本信息和统计数据
- 支持查看详情、编辑、启用/停用、删除操作
- 分页显示

**文件**: [`frontend/src/views/carrier/List.vue`](frontend/src/views/carrier/List.vue)

### 2. 承运人详情页面

**路由**: `/carriers/:id`

**功能**:
- 展示承运人完整信息
- 显示运营统计数据
- 展示最近运单记录
- 支持编辑、启用/停用、删除操作

**文件**: [`frontend/src/views/carrier/Detail.vue`](frontend/src/views/carrier/Detail.vue)

### 3. 承运人创建/编辑页面

**路由**: 
- 创建: `/carriers/create`
- 编辑: `/carriers/:id/edit`

**功能**:
- 表单式录入承运人信息
- 分为基本信息、资质信息、其他信息三个部分
- 支持字段验证
- 创建和编辑共用同一组件

**文件**: [`frontend/src/views/carrier/Create.vue`](frontend/src/views/carrier/Create.vue)

## 后端实现

### 模型层

**文件**: [`backend/src/models/Carrier.js`](backend/src/models/Carrier.js)

**主要方法**:
- `findAll(filters)`: 获取承运人列表（支持筛选和分页）
- `findById(id)`: 获取承运人详情
- `create(carrierData)`: 创建承运人
- `update(id, carrierData)`: 更新承运人
- `delete(id)`: 删除承运人
- `updateStatus(id, status)`: 更新承运人状态
- `getStatistics(id)`: 获取承运人统计信息

### 控制器层

**文件**: [`backend/src/controllers/carrierController.js`](backend/src/controllers/carrierController.js)

**主要方法**:
- `getCarriers`: 处理获取承运人列表请求
- `getCarrierById`: 处理获取承运人详情请求
- `createCarrier`: 处理创建承运人请求
- `updateCarrier`: 处理更新承运人请求
- `deleteCarrier`: 处理删除承运人请求
- `updateCarrierStatus`: 处理更新承运人状态请求
- `getCarrierStatistics`: 处理获取承运人统计信息请求

### 路由层

**文件**: [`backend/src/routes/carriers.js`](backend/src/routes/carriers.js)

**路由配置**:
- `GET /`: 获取承运人列表
- `GET /:carrierId`: 获取承运人详情
- `POST /`: 创建承运人
- `PUT /:carrierId`: 更新承运人
- `DELETE /:carrierId`: 删除承运人
- `PATCH /:carrierId/status`: 更新承运人状态
- `GET /:carrierId/statistics`: 获取承运人统计信息

## 前端 API 封装

**文件**: [`frontend/src/api/carrier.js`](frontend/src/api/carrier.js)

**导出方法**:
- `getCarriers(params)`: 获取承运人列表
- `getCarrierById(carrierId)`: 获取承运人详情
- `createCarrier(data)`: 创建承运人
- `updateCarrier(carrierId, data)`: 更新承运人
- `deleteCarrier(carrierId)`: 删除承运人
- `updateCarrierStatus(carrierId, status)`: 更新承运人状态
- `getCarrierStatistics(carrierId)`: 获取承运人统计信息

## 使用示例

### 创建承运人

```javascript
import { createCarrier } from '@/api/carrier';

const carrierData = {
  name: '顺丰速运',
  contact_person: '张三',
  contact_phone: '13800138000',
  contact_email: 'zhangsan@sf.com',
  address: '深圳市福田区',
  business_license: '91440300XXXXXXXXXX',
  transport_license: '粤交运许字XXXXXX号',
  vehicle_count: 100,
  driver_count: 150,
  service_area: '全国',
  description: '专业物流服务',
  status: 'active'
};

const response = await createCarrier(carrierData);
if (response.code === 201) {
  console.log('创建成功', response.data);
}
```

### 获取承运人列表

```javascript
import { getCarriers } from '@/api/carrier';

const params = {
  name: '顺丰',
  status: 'active',
  page: 1,
  pageSize: 10
};

const response = await getCarriers(params);
if (response.code === 200) {
  console.log('承运人列表', response.data);
  console.log('分页信息', response.pagination);
}
```

### 更新承运人状态

```javascript
import { updateCarrierStatus } from '@/api/carrier';

const response = await updateCarrierStatus(1, 'inactive');
if (response.code === 200) {
  console.log('状态更新成功', response.data);
}
```

## 注意事项

1. **数据验证**:
   - 联系电话必须是11位手机号
   - 邮箱格式必须正确
   - 必填字段不能为空

2. **删除限制**:
   - 如果承运人有关联的运单记录，无法删除
   - 建议使用停用状态代替删除

3. **状态管理**:
   - active: 活跃状态，可以正常使用
   - inactive: 停用状态，不可使用
   - suspended: 暂停状态，临时不可用

4. **权限控制**:
   - 建议添加权限验证中间件
   - 不同角色可能有不同的操作权限

5. **性能优化**:
   - 列表查询使用了分页
   - 使用了数据库索引优化查询性能
   - 统计数据通过聚合查询获取

## 扩展功能建议

1. **批量操作**: 支持批量导入、导出承运人信息
2. **评价系统**: 完善承运人评价和评分机制
3. **资质管理**: 添加资质证件上传和到期提醒
4. **车辆管理**: 关联车辆信息管理
5. **司机管理**: 关联司机信息管理
6. **结算管理**: 添加承运人结算功能
7. **数据分析**: 提供更详细的运营数据分析
