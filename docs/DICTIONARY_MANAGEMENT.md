# 字典库管理

## 功能概述

字典库管理模块用于管理系统中的各类字典数据，提供统一的数据字典维护功能，支持字典的增删改查、状态管理和排序等操作。

## 功能特性

### 1. 字典列表
- 支持按类型、代码、名称、状态筛选
- 分页展示字典数据
- 显示字典类型、代码、名称、值、描述、排序、状态等信息
- 支持查看、编辑、删除操作

### 2. 字典详情
- 展示字典完整信息
- 支持状态切换（启用/禁用）
- 支持快速编辑和删除

### 3. 字典创建/编辑
- 支持创建新字典
- 支持编辑现有字典
- 字段验证确保数据完整性
- 支持设置排序和状态

## 数据库设计

### 字典表 (dictionaries)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 字典ID（主键） |
| type | VARCHAR(50) | 字典类型 |
| code | VARCHAR(50) | 字典代码（唯一） |
| name | VARCHAR(100) | 字典名称 |
| value | VARCHAR(255) | 字典值 |
| description | TEXT | 描述 |
| sort_order | INT | 排序 |
| status | ENUM | 状态（active/inactive） |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 索引设计
- 主键索引：id
- 唯一索引：code
- 普通索引：type, status, sort_order

## API接口

### 1. 获取字典列表
```
GET /api/dictionaries
```

**请求参数：**
- page: 页码（默认1）
- pageSize: 每页数量（默认10）
- type: 字典类型（可选）
- code: 字典代码（可选）
- name: 字典名称（可选）
- status: 状态（可选）

**响应示例：**
```json
{
  "success": true,
  "data": {
    "dictionaries": [
      {
        "id": 1,
        "type": "user_status",
        "code": "active",
        "name": "启用",
        "value": "active",
        "description": "用户状态：启用",
        "sortOrder": 1,
        "status": "active",
        "createdAt": "2024-01-01 00:00:00",
        "updatedAt": "2024-01-01 00:00:00"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

### 2. 获取字典详情
```
GET /api/dictionaries/:id
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "user_status",
    "code": "active",
    "name": "启用",
    "value": "active",
    "description": "用户状态：启用",
    "sortOrder": 1,
    "status": "active",
    "createdAt": "2024-01-01 00:00:00",
    "updatedAt": "2024-01-01 00:00:00"
  }
}
```

### 3. 根据类型获取字典列表
```
GET /api/dictionaries/type/:type
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "user_status",
      "code": "active",
      "name": "启用",
      "value": "active",
      "description": "用户状态：启用",
      "sortOrder": 1,
      "status": "active",
      "createdAt": "2024-01-01 00:00:00",
      "updatedAt": "2024-01-01 00:00:00"
    }
  ]
}
```

### 4. 根据代码获取字典
```
GET /api/dictionaries/code/:code
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "user_status",
    "code": "active",
    "name": "启用",
    "value": "active",
    "description": "用户状态：启用",
    "sortOrder": 1,
    "status": "active",
    "createdAt": "2024-01-01 00:00:00",
    "updatedAt": "2024-01-01 00:00:00"
  }
}
```

### 5. 创建字典
```
POST /api/dictionaries
```

**请求体：**
```json
{
  "type": "user_status",
  "code": "active",
  "name": "启用",
  "value": "active",
  "description": "用户状态：启用",
  "sortOrder": 1,
  "status": "active"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "字典创建成功",
  "data": {
    "dictionaryId": 1
  }
}
```

### 6. 更新字典
```
PUT /api/dictionaries/:id
```

**请求体：**
```json
{
  "type": "user_status",
  "code": "active",
  "name": "启用",
  "value": "active",
  "description": "用户状态：启用",
  "sortOrder": 1,
  "status": "active"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "字典更新成功"
}
```

### 7. 删除字典
```
DELETE /api/dictionaries/:id
```

**响应示例：**
```json
{
  "success": true,
  "message": "字典删除成功"
}
```

### 8. 获取所有字典类型
```
GET /api/dictionaries/types
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    "user_status",
    "company_status",
    "vehicle_type",
    "waybill_status"
  ]
}
```

### 9. 批量更新排序
```
PUT /api/dictionaries/batch/sort
```

**请求体：**
```json
{
  "items": [
    { "id": 1, "sortOrder": 1 },
    { "id": 2, "sortOrder": 2 }
  ]
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "排序更新成功"
}
```

### 10. 更新状态
```
PATCH /api/dictionaries/:id/status
```

**请求体：**
```json
{
  "status": "active"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "状态更新成功"
}
```

## 前端页面

### 1. 字典列表页面
**路由：** `/dictionary/list`

**功能：**
- 搜索筛选（类型、代码、名称、状态）
- 分页展示
- 查看详情
- 编辑字典
- 删除字典
- 新增字典

### 2. 字典详情页面
**路由：** `/dictionary/detail/:id`

**功能：**
- 展示字典完整信息
- 状态切换
- 编辑字典
- 删除字典

### 3. 字典创建/编辑页面
**路由：** 
- 创建：`/dictionary/create`
- 编辑：`/dictionary/edit/:id`

**功能：**
- 表单验证
- 创建新字典
- 编辑现有字典
- 字段说明和提示

## 使用示例

### 创建字典
1. 访问字典列表页面
2. 点击"新增字典"按钮
3. 填写字典信息
4. 点击"创建"按钮

### 编辑字典
1. 在字典列表中找到目标字典
2. 点击"编辑"按钮
3. 修改字典信息
4. 点击"保存"按钮

### 删除字典
1. 在字典列表中找到目标字典
2. 点击"删除"按钮
3. 确认删除操作

### 切换状态
1. 访问字典详情页面
2. 点击"启用"或"禁用"按钮
3. 确认操作

## 预置字典类型

系统预置了以下字典类型：

### 用户状态 (user_status)
- active: 启用
- inactive: 禁用
- locked: 锁定

### 企业状态 (company_status)
- pending: 待审核
- approved: 已通过
- rejected: 已驳回

### 车辆类型 (vehicle_type)
- truck: 货车
- van: 厢式货车
- trailer: 拖车

### 运单状态 (waybill_status)
- pending: 待接单
- accepted: 已接单
- in_transit: 运输中
- completed: 已完成
- cancelled: 已取消

## 注意事项

1. 字典代码必须唯一，不能重复
2. 删除字典前请确认没有被其他模块引用
3. 修改字典值时需谨慎，可能影响其他功能
4. 建议使用英文作为字典代码，便于程序调用
5. 排序值越小，显示越靠前

## 文件结构

```
backend/
├── src/
│   ├── models/
│   │   └── Dictionary.js          # 字典数据模型
│   ├── controllers/
│   │   └── dictionaryController.js # 字典控制器
│   └── routes/
│       └── dictionaries.js         # 字典路由
└── database/
    └── dictionaries.sql            # 数据库表结构

frontend/
├── src/
│   ├── api/
│   │   └── dictionary.js           # 字典API
│   └── views/
│       └── dictionary/
│           ├── List.vue            # 字典列表页面
│           ├── Detail.vue          # 字典详情页面
│           └── Create.vue          # 字典创建/编辑页面
```
