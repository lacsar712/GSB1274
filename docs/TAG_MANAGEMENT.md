# 标签库管理

## 功能概述

标签库管理模块用于管理运单标签信息，支持标签的创建、编辑、删除和查询。标签可以用于对运单进行分类和标记，便于运单的管理和检索。

## 功能特性

### 1. 标签展示
- **标签云视图**：以标签云的形式展示所有标签，标签大小根据使用次数动态调整
- **列表视图**：以表格形式展示标签详细信息，支持批量操作
- **实时搜索**：支持按标签名称和描述进行实时搜索过滤

### 2. 标签管理
- **创建标签**：支持添加新标签，可自定义标签名称、颜色和描述
- **编辑标签**：支持修改标签信息
- **删除标签**：支持单个删除和批量删除（仅限未使用的标签）
- **使用统计**：自动统计标签使用次数

### 3. 标签属性
- 标签名称（必填，最多50字符，唯一）
- 标签颜色（支持颜色选择器）
- 标签描述（可选，最多200字符）
- 使用次数（自动统计）

## 前端页面

### 标签列表页面
**路径**: `/tags`  
**组件**: [`frontend/src/views/tag/List.vue`](frontend/src/views/tag/List.vue:1)

#### 页面功能
1. **标签云视图**
   - 以标签云形式展示所有标签
   - 标签大小根据使用次数动态调整
   - 点击标签可进入编辑模式
   - 支持悬停效果和动画

2. **列表视图**
   - 表格形式展示标签详细信息
   - 支持多选和批量操作
   - 显示标签名称、描述、使用次数、创建时间
   - 提供编辑和删除操作按钮

3. **搜索功能**
   - 实时搜索标签名称和描述
   - 自动过滤显示结果

4. **创建/编辑对话框**
   - 表单验证
   - 颜色选择器
   - 字数限制提示

#### 视图切换
- 标签云视图：适合快速浏览和选择标签
- 列表视图：适合详细管理和批量操作

## 后端接口

### API 端点

#### 1. 获取标签列表（分页）
```
GET /api/tags
```

**查询参数**:
- `page`: 页码（默认：1）
- `pageSize`: 每页数量（默认：100）
- `keyword`: 搜索关键词（可选）
- `sortBy`: 排序字段（默认：usageCount）
- `sortOrder`: 排序方式（默认：DESC）

**响应示例**:
```json
{
  "code": 200,
  "message": "获取标签列表成功",
  "data": {
    "tags": [
      {
        "id": 1,
        "name": "紧急",
        "color": "#ff4d4f",
        "description": "紧急运单",
        "usageCount": 15,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 100,
    "totalPages": 1
  }
}
```

#### 2. 获取所有标签（不分页）
```
GET /api/tags/all
```

**用途**: 用于标签云展示和标签选择器

**响应示例**:
```json
{
  "code": 200,
  "message": "获取标签成功",
  "data": [
    {
      "id": 1,
      "name": "紧急",
      "color": "#ff4d4f",
      "description": "紧急运单",
      "usageCount": 15
    }
  ]
}
```

#### 3. 获取单个标签详情
```
GET /api/tags/:tagId
```

**路径参数**:
- `tagId`: 标签ID

**响应示例**:
```json
{
  "code": 200,
  "message": "获取标签详情成功",
  "data": {
    "id": 1,
    "name": "紧急",
    "color": "#ff4d4f",
    "description": "紧急运单",
    "usageCount": 15,
    "createdBy": 1,
    "updatedBy": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 4. 创建标签
```
POST /api/tags
```

**请求体**:
```json
{
  "name": "紧急",
  "color": "#ff4d4f",
  "description": "紧急运单"
}
```

**响应示例**:
```json
{
  "code": 201,
  "message": "创建标签成功",
  "data": {
    "id": 1,
    "name": "紧急",
    "color": "#ff4d4f",
    "description": "紧急运单",
    "usageCount": 0,
    "createdBy": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 5. 更新标签
```
PUT /api/tags/:tagId
```

**路径参数**:
- `tagId`: 标签ID

**请求体**:
```json
{
  "name": "紧急",
  "color": "#ff4d4f",
  "description": "紧急运单（更新）"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "更新标签成功",
  "data": {
    "id": 1,
    "name": "紧急",
    "color": "#ff4d4f",
    "description": "紧急运单（更新）",
    "usageCount": 15,
    "updatedBy": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 6. 删除标签
```
DELETE /api/tags/:tagId
```

**路径参数**:
- `tagId`: 标签ID

**限制**: 只能删除未使用的标签（usageCount = 0）

**响应示例**:
```json
{
  "code": 200,
  "message": "删除标签成功"
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "该标签正在使用中，无法删除"
}
```

#### 7. 批量删除标签
```
POST /api/tags/batch/delete
```

**请求体**:
```json
{
  "tagIds": [1, 2, 3]
}
```

**限制**: 只能删除未使用的标签

**响应示例**:
```json
{
  "code": 200,
  "message": "批量删除标签成功",
  "data": {
    "deletedCount": 3
  }
}
```

**错误响应**:
```json
{
  "code": 400,
  "message": "部分标签正在使用中，无法删除",
  "data": {
    "tagsInUse": [
      { "id": 1, "name": "紧急" }
    ]
  }
}
```

#### 8. 增加标签使用次数
```
POST /api/tags/:tagId/increment
```

**路径参数**:
- `tagId`: 标签ID

**用途**: 当运单添加标签时调用

**响应示例**:
```json
{
  "code": 200,
  "message": "更新使用次数成功",
  "data": {
    "usageCount": 16
  }
}
```

#### 9. 减少标签使用次数
```
POST /api/tags/:tagId/decrement
```

**路径参数**:
- `tagId`: 标签ID

**用途**: 当运单移除标签时调用

**响应示例**:
```json
{
  "code": 200,
  "message": "更新使用次数成功",
  "data": {
    "usageCount": 15
  }
}
```

## 数据模型

### Tag 模型
**文件**: [`backend/src/models/Tag.js`](backend/src/models/Tag.js:1)

**字段说明**:
| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INTEGER | 标签ID | 主键，自增 |
| name | STRING(50) | 标签名称 | 必填，唯一 |
| color | STRING(20) | 标签颜色 | 默认：#1890ff |
| description | STRING(200) | 标签描述 | 可选 |
| usageCount | INTEGER | 使用次数 | 默认：0 |
| createdBy | INTEGER | 创建人ID | 可选 |
| updatedBy | INTEGER | 更新人ID | 可选 |
| createdAt | DATE | 创建时间 | 自动生成 |
| updatedAt | DATE | 更新时间 | 自动更新 |

**索引**:
- `name`: 标签名称索引
- `createdBy`: 创建人索引

## 前端 API 调用

### API 文件
**文件**: [`frontend/src/api/tag.js`](frontend/src/api/tag.js:1)

### 使用示例

```javascript
import { 
  getAllTags, 
  createTag, 
  updateTag, 
  deleteTag 
} from '@/api/tag';

// 获取所有标签
const tags = await getAllTags();

// 创建标签
const newTag = await createTag({
  name: '紧急',
  color: '#ff4d4f',
  description: '紧急运单'
});

// 更新标签
const updatedTag = await updateTag(1, {
  name: '紧急',
  color: '#ff4d4f',
  description: '紧急运单（更新）'
});

// 删除标签
await deleteTag(1);
```

## 路由配置

### 前端路由
**文件**: [`frontend/src/router/index.js`](frontend/src/router/index.js:1)

```javascript
{
  path: '/tags',
  name: 'Tags',
  children: [
    {
      path: '',
      name: 'TagList',
      component: () => import('@/views/tag/List.vue'),
      meta: { title: '标签库' }
    }
  ]
}
```

### 后端路由
**文件**: [`backend/src/routes/tags.js`](backend/src/routes/tags.js:1)

## 业务规则

### 1. 标签创建规则
- 标签名称必填，长度1-50字符
- 标签名称必须唯一
- 标签颜色默认为 #1890ff
- 标签描述可选，最多200字符

### 2. 标签删除规则
- 只能删除未使用的标签（usageCount = 0）
- 正在使用的标签无法删除
- 批量删除时，如果包含正在使用的标签，整个操作失败

### 3. 标签使用规则
- 当运单添加标签时，自动增加标签使用次数
- 当运单移除标签时，自动减少标签使用次数
- 使用次数不会小于0

### 4. 标签显示规则
- 标签云视图中，标签大小根据使用次数动态调整
- 使用次数越多，标签显示越大
- 标签按使用次数降序排列

## 使用场景

### 1. 运单分类
- 为运单添加标签进行分类
- 如：紧急、普通、冷链、危险品等

### 2. 运单检索
- 通过标签快速筛选运单
- 支持多标签组合查询

### 3. 数据统计
- 统计各类标签的使用情况
- 分析运单分布特征

### 4. 业务管理
- 根据标签进行业务优先级管理
- 标签驱动的工作流程

## 注意事项

1. **标签唯一性**: 标签名称必须唯一，创建或更新时会进行检查
2. **删除限制**: 正在使用的标签无法删除，需要先移除所有关联
3. **颜色格式**: 支持十六进制颜色代码，如 #1890ff
4. **使用计数**: 使用次数由系统自动维护，不应手动修改
5. **性能优化**: 标签云视图适合展示少量标签（建议不超过100个）

## 扩展功能建议

1. **标签分组**: 支持标签分类管理
2. **标签权限**: 支持标签的访问权限控制
3. **标签模板**: 预设常用标签模板
4. **标签关联**: 支持标签之间的关联关系
5. **标签统计**: 提供更详细的标签使用统计报表
6. **标签导入导出**: 支持标签的批量导入导出
