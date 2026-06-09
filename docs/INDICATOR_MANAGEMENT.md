# 指标库管理

## 功能概述

指标库管理模块用于管理运营指标信息，支持指标的创建、编辑、删除和查询。指标可以用于企业运营数据的统计分析和绩效评估，帮助企业进行数据驱动的决策。

## 功能特性

### 1. 指标展示
- **卡片式布局**：以卡片形式展示指标信息，直观清晰
- **多维度筛选**：支持按分类、状态、统计频率进行筛选
- **实时搜索**：支持按指标名称、编码、描述进行实时搜索
- **分页展示**：支持分页浏览，提高加载性能

### 2. 指标管理
- **创建指标**：支持添加新指标，可配置指标的各项属性
- **编辑指标**：支持修改指标信息
- **删除指标**：支持删除不需要的指标
- **状态管理**：支持启用/停用指标

### 3. 指标属性
- 指标名称（必填，最多100字符）
- 指标编码（必填，最多50字符，唯一）
- 指标分类（可选，支持自定义）
- 计量单位（可选，如：元、件、%等）
- 指标描述（可选，最多500字符）
- 计算公式（可选，最多500字符）
- 数据来源（可选，最多100字符）
- 统计频率（必选：每日/每周/每月/每季度/每年）
- 目标值（可选，数值类型）
- 状态（必选：启用/停用）

## 前端页面

### 指标列表页面
**路径**: `/indicators`  
**组件**: [`frontend/src/views/indicator/List.vue`](frontend/src/views/indicator/List.vue:1)

#### 页面功能
1. **卡片式展示**
   - 以卡片形式展示指标信息
   - 每个卡片显示指标的关键信息
   - 支持悬停效果和动画
   - 响应式布局，自适应不同屏幕尺寸

2. **筛选功能**
   - 按分类筛选指标
   - 按状态筛选（启用/停用）
   - 按统计频率筛选
   - 支持组合筛选

3. **搜索功能**
   - 实时搜索指标名称、编码或描述
   - 自动过滤显示结果

4. **操作功能**
   - 创建新指标
   - 编辑指标信息
   - 删除指标
   - 查看指标详情

5. **分页功能**
   - 支持自定义每页显示数量
   - 页码跳转
   - 显示总数统计

### 指标创建页面
**路径**: `/indicators/create`  
**组件**: [`frontend/src/views/indicator/Create.vue`](frontend/src/views/indicator/Create.vue:1)

#### 页面功能
1. **表单输入**
   - 指标基本信息输入
   - 指标分类选择（支持新建分类）
   - 统计频率选择
   - 目标值设置
   - 状态选择

2. **表单验证**
   - 必填字段验证
   - 字段长度验证
   - 编码格式验证（仅支持字母、数字、下划线和横线）
   - 实时验证反馈

3. **操作按钮**
   - 创建指标
   - 重置表单
   - 取消返回

### 指标编辑页面
**路径**: `/indicators/edit/:id`  
**组件**: [`frontend/src/views/indicator/Edit.vue`](frontend/src/views/indicator/Edit.vue:1)

#### 页面功能
1. **数据加载**
   - 自动加载指标详情
   - 表单数据回填

2. **表单编辑**
   - 修改指标信息
   - 表单验证
   - 实时验证反馈

3. **操作按钮**
   - 保存修改
   - 取消返回

## 后端接口

### API 端点

#### 1. 获取指标列表（分页）
```
GET /api/indicators
```

**查询参数**:
- `page`: 页码（默认：1）
- `pageSize`: 每页数量（默认：20）
- `keyword`: 搜索关键词（可选）
- `category`: 指标分类（可选）
- `status`: 状态（可选：active/inactive）
- `frequency`: 统计频率（可选：daily/weekly/monthly/quarterly/yearly）
- `sortBy`: 排序字段（默认：createdAt）
- `sortOrder`: 排序方式（默认：DESC）

**响应示例**:
```json
{
  "code": 200,
  "message": "获取指标列表成功",
  "data": {
    "indicators": [
      {
        "id": 1,
        "name": "月度营收",
        "code": "MONTHLY_REVENUE",
        "category": "财务指标",
        "unit": "元",
        "description": "每月总营业收入",
        "formula": "SUM(订单金额)",
        "dataSource": "订单系统",
        "frequency": "monthly",
        "targetValue": 1000000.00,
        "status": "active",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3
  }
}
```

#### 2. 获取所有指标（不分页）
```
GET /api/indicators/all
```

**查询参数**:
- `status`: 状态筛选（可选，默认：active）

**用途**: 用于指标选择器和下拉列表

**响应示例**:
```json
{
  "code": 200,
  "message": "获取指标成功",
  "data": [
    {
      "id": 1,
      "name": "月度营收",
      "code": "MONTHLY_REVENUE",
      "category": "财务指标",
      "unit": "元",
      "status": "active"
    }
  ]
}
```

#### 3. 获取指标分类列表
```
GET /api/indicators/categories
```

**用途**: 用于分类筛选和分类选择器

**响应示例**:
```json
{
  "code": 200,
  "message": "获取指标分类成功",
  "data": ["财务指标", "运营指标", "客户指标", "效率指标"]
}
```

#### 4. 获取单个指标详情
```
GET /api/indicators/:indicatorId
```

**路径参数**:
- `indicatorId`: 指标ID

**响应示例**:
```json
{
  "code": 200,
  "message": "获取指标详情成功",
  "data": {
    "id": 1,
    "name": "月度营收",
    "code": "MONTHLY_REVENUE",
    "category": "财务指标",
    "unit": "元",
    "description": "每月总营业收入",
    "formula": "SUM(订单金额)",
    "dataSource": "订单系统",
    "frequency": "monthly",
    "targetValue": 1000000.00,
    "status": "active",
    "createdBy": 1,
    "updatedBy": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 5. 创建指标
```
POST /api/indicators
```

**请求体**:
```json
{
  "name": "月度营收",
  "code": "MONTHLY_REVENUE",
  "category": "财务指标",
  "unit": "元",
  "description": "每月总营业收入",
  "formula": "SUM(订单金额)",
  "dataSource": "订单系统",
  "frequency": "monthly",
  "targetValue": 1000000.00,
  "status": "active"
}
```

**响应示例**:
```json
{
  "code": 201,
  "message": "创建指标成功",
  "data": {
    "id": 1,
    "name": "月度营收",
    "code": "MONTHLY_REVENUE",
    "category": "财务指标",
    "unit": "元",
    "description": "每月总营业收入",
    "formula": "SUM(订单金额)",
    "dataSource": "订单系统",
    "frequency": "monthly",
    "targetValue": 1000000.00,
    "status": "active",
    "createdBy": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 6. 更新指标
```
PUT /api/indicators/:indicatorId
```

**路径参数**:
- `indicatorId`: 指标ID

**请求体**:
```json
{
  "name": "月度营收",
  "code": "MONTHLY_REVENUE",
  "category": "财务指标",
  "unit": "元",
  "description": "每月总营业收入（更新）",
  "formula": "SUM(订单金额)",
  "dataSource": "订单系统",
  "frequency": "monthly",
  "targetValue": 1200000.00,
  "status": "active"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "更新指标成功",
  "data": {
    "id": 1,
    "name": "月度营收",
    "code": "MONTHLY_REVENUE",
    "category": "财务指标",
    "unit": "元",
    "description": "每月总营业收入（更新）",
    "formula": "SUM(订单金额)",
    "dataSource": "订单系统",
    "frequency": "monthly",
    "targetValue": 1200000.00,
    "status": "active",
    "updatedBy": 1,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 7. 删除指标
```
DELETE /api/indicators/:indicatorId
```

**路径参数**:
- `indicatorId`: 指标ID

**响应示例**:
```json
{
  "code": 200,
  "message": "删除指标成功"
}
```

#### 8. 批量删除指标
```
POST /api/indicators/batch/delete
```

**请求体**:
```json
{
  "indicatorIds": [1, 2, 3]
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "批量删除指标成功",
  "data": {
    "deletedCount": 3
  }
}
```

## 数据模型

### Indicator 模型
**文件**: [`backend/src/models/Indicator.js`](backend/src/models/Indicator.js:1)

**字段说明**:
| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INTEGER | 指标ID | 主键，自增 |
| name | STRING(100) | 指标名称 | 必填 |
| code | STRING(50) | 指标编码 | 必填，唯一 |
| category | STRING(50) | 指标分类 | 可选 |
| unit | STRING(20) | 计量单位 | 可选 |
| description | TEXT | 指标描述 | 可选 |
| formula | TEXT | 计算公式 | 可选 |
| dataSource | STRING(100) | 数据来源 | 可选 |
| frequency | ENUM | 统计频率 | daily/weekly/monthly/quarterly/yearly |
| targetValue | DECIMAL(15,2) | 目标值 | 可选 |
| status | ENUM | 状态 | active/inactive，默认：active |
| createdBy | INTEGER | 创建人ID | 可选 |
| updatedBy | INTEGER | 更新人ID | 可选 |
| createdAt | DATE | 创建时间 | 自动生成 |
| updatedAt | DATE | 更新时间 | 自动更新 |

**索引**:
- `code`: 指标编码索引（唯一）
- `category`: 指标分类索引
- `status`: 状态索引
- `createdBy`: 创建人索引

## 前端 API 调用

### API 文件
**文件**: [`frontend/src/api/indicator.js`](frontend/src/api/indicator.js:1)

### 使用示例

```javascript
import { 
  getIndicators,
  getAllIndicators,
  getIndicatorById,
  createIndicator, 
  updateIndicator, 
  deleteIndicator,
  getIndicatorCategories
} from '@/api/indicator';

// 获取指标列表（分页）
const result = await getIndicators({
  page: 1,
  pageSize: 20,
  keyword: '营收',
  category: '财务指标',
  status: 'active'
});

// 获取所有指标（不分页）
const indicators = await getAllIndicators({ status: 'active' });

// 获取指标分类
const categories = await getIndicatorCategories();

// 获取指标详情
const indicator = await getIndicatorById(1);

// 创建指标
const newIndicator = await createIndicator({
  name: '月度营收',
  code: 'MONTHLY_REVENUE',
  category: '财务指标',
  unit: '元',
  description: '每月总营业收入',
  frequency: 'monthly',
  targetValue: 1000000.00,
  status: 'active'
});

// 更新指标
const updatedIndicator = await updateIndicator(1, {
  name: '月度营收',
  targetValue: 1200000.00
});

// 删除指标
await deleteIndicator(1);

// 批量删除指标
await batchDeleteIndicators([1, 2, 3]);
```

## 路由配置

### 前端路由
**文件**: [`frontend/src/router/index.js`](frontend/src/router/index.js:1)

```javascript
{
  path: '/indicators',
  name: 'Indicators',
  children: [
    {
      path: '',
      name: 'IndicatorList',
      component: () => import('@/views/indicator/List.vue'),
      meta: { title: '指标库' }
    },
    {
      path: 'create',
      name: 'IndicatorCreate',
      component: () => import('@/views/indicator/Create.vue'),
      meta: { title: '创建指标' }
    },
    {
      path: 'edit/:id',
      name: 'IndicatorEdit',
      component: () => import('@/views/indicator/Edit.vue'),
      meta: { title: '编辑指标' }
    }
  ]
}
```

### 后端路由
**文件**: [`backend/src/routes/indicators.js`](backend/src/routes/indicators.js:1)

## 业务规则

### 1. 指标创建规则
- 指标名称必填，长度1-100字符
- 指标编码必填，长度1-50字符，必须唯一
- 指标编码只能包含字母、数字、下划线和横线
- 统计频率必选
- 状态默认为启用（active）

### 2. 指标编码规则
- 编码必须唯一，不能重复
- 建议使用大写字母和下划线组合
- 编码应具有业务含义，便于识别
- 示例：MONTHLY_REVENUE、CUSTOMER_COUNT、ORDER_RATE

### 3. 指标分类规则
- 支持自定义分类
- 建议按业务领域分类：财务指标、运营指标、客户指标、效率指标等
- 分类可以为空

### 4. 统计频率规则
- 支持5种频率：每日、每周、每月、每季度、每年
- 频率决定了指标的统计周期
- 不同频率的指标可能需要不同的数据采集策略

### 5. 目标值规则
- 目标值为可选项
- 支持小数，最多2位小数
- 用于绩效评估和目标管理

### 6. 状态管理规则
- 启用状态的指标可以用于数据统计
- 停用状态的指标不参与统计，但保留历史数据
- 可以随时切换指标状态

## 使用场景

### 1. 财务指标管理
- 营收指标：月度营收、季度营收、年度营收
- 成本指标：运营成本、人力成本、物流成本
- 利润指标：毛利润、净利润、利润率

### 2. 运营指标管理
- 订单指标：订单量、订单金额、订单完成率
- 运输指标：运输量、运输里程、准时率
- 效率指标：周转率、装载率、空驶率

### 3. 客户指标管理
- 客户数量：新增客户、活跃客户、流失客户
- 客户价值：客户生命周期价值、客户贡献度
- 客户满意度：满意度评分、投诉率、复购率

### 4. 绩效评估
- 设定各项指标的目标值
- 定期统计实际值
- 对比目标值和实际值，评估绩效

### 5. 数据分析
- 基于指标进行数据分析
- 生成各类统计报表
- 支持决策制定

## 注意事项

1. **编码唯一性**: 指标编码必须唯一，创建或更新时会进行检查
2. **编码规范**: 建议使用有意义的编码，便于理解和维护
3. **分类管理**: 合理规划指标分类，便于指标的组织和查找
4. **目标值设置**: 目标值应基于历史数据和业务目标合理设定
5. **状态管理**: 停用的指标不会被删除，可以随时重新启用
6. **数据来源**: 明确指标的数据来源，确保数据的准确性
7. **计算公式**: 记录指标的计算公式，便于理解和验证

## 扩展功能建议

1. **指标详情页**: 展示指标的详细信息和历史数据
2. **指标数据录入**: 支持手动录入指标数据
3. **指标数据导入**: 支持从外部系统导入指标数据
4. **指标趋势分析**: 展示指标的历史趋势图表
5. **指标对比分析**: 支持多个指标的对比分析
6. **指标预警**: 当指标偏离目标值时发出预警
7. **指标报表**: 生成各类指标统计报表
8. **指标权限**: 支持指标的访问权限控制
9. **指标版本**: 支持指标定义的版本管理
10. **指标关联**: 支持指标之间的关联关系定义
