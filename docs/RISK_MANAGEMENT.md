# 风险库管理

## 功能概述

风险库管理模块用于管理企业运营过程中的风险信息，支持风险的识别、评估、应对和监控。通过系统化的风险管理，帮助企业及时发现和应对潜在风险，降低风险对业务的影响。

## 功能特性

### 1. 风险展示
- **时间线展示**：以时间线方式展示风险信息，直观呈现风险发生的时间顺序
- **多维度筛选**：支持按分类、等级、状态进行筛选
- **实时搜索**：支持按风险标题、描述、责任人进行实时搜索
- **分页展示**：支持分页浏览，提高加载性能

### 2. 风险管理
- **创建风险**：支持添加新风险，记录风险的详细信息
- **查看详情**：支持查看风险的完整信息
- **编辑风险**：支持修改风险信息
- **删除风险**：支持删除不需要的风险
- **状态跟踪**：支持风险状态的全生命周期管理

### 3. 风险属性
- 风险标题（必填，最多200字符）
- 风险分类（可选，支持自定义）
- 风险等级（必选：低/中/高/严重）
- 风险描述（可选，最多1000字符）
- 影响范围（可选，最多1000字符）
- 发生概率（可选：极低/低/中/高/极高）
- 应对措施（可选，最多1000字符）
- 风险状态（必选：已识别/评估中/应对中/监控中/已关闭）
- 责任人（可选，最多100字符）
- 识别日期（可选，默认当前时间）
- 截止日期（可选）
- 关闭日期（自动设置）
- 关联项目（可选，最多100字符）
- 标签（可选，支持多个）
- 附件（可选，支持多个）

## 前端页面

### 风险列表页面
**路径**: `/risks`  
**组件**: [`frontend/src/views/risk/List.vue`](frontend/src/views/risk/List.vue:1)

#### 页面功能
1. **时间线展示**
   - 以时间线形式展示风险信息
   - 按识别日期排序
   - 时间线节点颜色根据风险等级显示
   - 支持悬停效果和动画

2. **筛选功能**
   - 按分类筛选风险
   - 按风险等级筛选（低/中/高/严重）
   - 按状态筛选（已识别/评估中/应对中/监控中/已关闭）
   - 支持组合筛选

3. **搜索功能**
   - 实时搜索风险标题、描述或责任人
   - 自动过滤显示结果

4. **操作功能**
   - 创建新风险
   - 查看风险详情
   - 编辑风险信息
   - 删除风险

5. **分页功能**
   - 支持自定义每页显示数量
   - 页码跳转
   - 显示总数统计

### 风险详情页面
**路径**: `/risks/:id`  
**组件**: [`frontend/src/views/risk/Detail.vue`](frontend/src/views/risk/Detail.vue:1)

#### 页面功能
1. **基本信息展示**
   - 风险标题、分类、等级、状态
   - 发生概率、责任人、关联项目

2. **详细信息展示**
   - 风险描述
   - 影响范围
   - 应对措施

3. **时间信息展示**
   - 识别日期、截止日期、关闭日期
   - 创建时间、更新时间

4. **附加信息展示**
   - 标签列表
   - 附件列表

5. **操作功能**
   - 编辑风险
   - 返回列表

### 风险创建页面
**路径**: `/risks/create`  
**组件**: [`frontend/src/views/risk/Create.vue`](frontend/src/views/risk/Create.vue:1)

#### 页面功能
1. **表单输入**
   - 风险基本信息输入
   - 风险分类选择（支持新建分类）
   - 风险等级选择
   - 发生概率选择
   - 风险状态选择
   - 时间选择
   - 标签选择（支持新建标签）

2. **表单验证**
   - 必填字段验证
   - 字段长度验证
   - 实时验证反馈

3. **操作按钮**
   - 创建风险
   - 重置表单
   - 取消返回

## 后端接口

### API 端点

#### 1. 获取风险列表（分页）
```
GET /api/risks
```

**查询参数**:
- `page`: 页码（默认：1）
- `pageSize`: 每页数量（默认：20）
- `keyword`: 搜索关键词（可选）
- `category`: 风险分类（可选）
- `level`: 风险等级（可选：low/medium/high/critical）
- `status`: 风险状态（可选：identified/assessing/mitigating/monitoring/closed）
- `sortBy`: 排序字段（默认：identifiedDate）
- `sortOrder`: 排序方式（默认：DESC）

**响应示例**:
```json
{
  "code": 200,
  "message": "获取风险列表成功",
  "data": {
    "risks": [
      {
        "id": 1,
        "title": "系统安全漏洞",
        "category": "技术风险",
        "level": "high",
        "description": "发现系统存在安全漏洞",
        "impact": "可能导致数据泄露",
        "probability": "medium",
        "mitigation": "立即修复漏洞并加强安全防护",
        "status": "mitigating",
        "owner": "张三",
        "identifiedDate": "2024-01-01T00:00:00.000Z",
        "dueDate": "2024-01-15T00:00:00.000Z",
        "relatedProject": "系统升级项目",
        "tags": ["紧急", "安全"],
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

#### 2. 获取风险分类列表
```
GET /api/risks/categories
```

**用途**: 用于分类筛选和分类选择器

**响应示例**:
```json
{
  "code": 200,
  "message": "获取风险分类成功",
  "data": ["技术风险", "市场风险", "财务风险", "运营风险"]
}
```

#### 3. 获取风险统计
```
GET /api/risks/statistics
```

**用途**: 用于风险统计分析

**响应示例**:
```json
{
  "code": 200,
  "message": "获取风险统计成功",
  "data": {
    "total": 50,
    "byLevel": [
      { "level": "low", "count": 10 },
      { "level": "medium", "count": 20 },
      { "level": "high", "count": 15 },
      { "level": "critical", "count": 5 }
    ],
    "byStatus": [
      { "status": "identified", "count": 5 },
      { "status": "assessing", "count": 10 },
      { "status": "mitigating", "count": 15 },
      { "status": "monitoring", "count": 10 },
      { "status": "closed", "count": 10 }
    ]
  }
}
```

#### 4. 获取单个风险详情
```
GET /api/risks/:riskId
```

**路径参数**:
- `riskId`: 风险ID

**响应示例**:
```json
{
  "code": 200,
  "message": "获取风险详情成功",
  "data": {
    "id": 1,
    "title": "系统安全漏洞",
    "category": "技术风险",
    "level": "high",
    "description": "发现系统存在安全漏洞",
    "impact": "可能导致数据泄露",
    "probability": "medium",
    "mitigation": "立即修复漏洞并加强安全防护",
    "status": "mitigating",
    "owner": "张三",
    "identifiedDate": "2024-01-01T00:00:00.000Z",
    "dueDate": "2024-01-15T00:00:00.000Z",
    "closedDate": null,
    "relatedProject": "系统升级项目",
    "tags": ["紧急", "安全"],
    "attachments": [
      {
        "name": "漏洞报告.pdf",
        "url": "/uploads/reports/vulnerability.pdf"
      }
    ],
    "createdBy": 1,
    "updatedBy": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 5. 创建风险
```
POST /api/risks
```

**请求体**:
```json
{
  "title": "系统安全漏洞",
  "category": "技术风险",
  "level": "high",
  "description": "发现系统存在安全漏洞",
  "impact": "可能导致数据泄露",
  "probability": "medium",
  "mitigation": "立即修复漏洞并加强安全防护",
  "status": "identified",
  "owner": "张三",
  "identifiedDate": "2024-01-01T00:00:00.000Z",
  "dueDate": "2024-01-15T00:00:00.000Z",
  "relatedProject": "系统升级项目",
  "tags": ["紧急", "安全"]
}
```

**响应示例**:
```json
{
  "code": 201,
  "message": "创建风险成功",
  "data": {
    "id": 1,
    "title": "系统安全漏洞",
    "category": "技术风险",
    "level": "high",
    "status": "identified",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 6. 更新风险
```
PUT /api/risks/:riskId
```

**路径参数**:
- `riskId`: 风险ID

**请求体**:
```json
{
  "title": "系统安全漏洞",
  "status": "mitigating",
  "mitigation": "已修复漏洞并加强安全防护"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "更新风险成功",
  "data": {
    "id": 1,
    "title": "系统安全漏洞",
    "status": "mitigating",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
}
```

#### 7. 删除风险
```
DELETE /api/risks/:riskId
```

**路径参数**:
- `riskId`: 风险ID

**响应示例**:
```json
{
  "code": 200,
  "message": "删除风险成功"
}
```

#### 8. 批量删除风险
```
POST /api/risks/batch/delete
```

**请求体**:
```json
{
  "riskIds": [1, 2, 3]
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "批量删除风险成功",
  "data": {
    "deletedCount": 3
  }
}
```

## 数据模型

### Risk 模型
**文件**: [`backend/src/models/Risk.js`](backend/src/models/Risk.js:1)

**字段说明**:
| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INTEGER | 风险ID | 主键，自增 |
| title | STRING(200) | 风险标题 | 必填 |
| category | STRING(50) | 风险分类 | 可选 |
| level | ENUM | 风险等级 | low/medium/high/critical，默认：medium |
| description | TEXT | 风险描述 | 可选 |
| impact | TEXT | 影响范围 | 可选 |
| probability | ENUM | 发生概率 | very_low/low/medium/high/very_high |
| mitigation | TEXT | 应对措施 | 可选 |
| status | ENUM | 风险状态 | identified/assessing/mitigating/monitoring/closed，默认：identified |
| owner | STRING(100) | 责任人 | 可选 |
| identifiedDate | DATE | 识别日期 | 可选 |
| dueDate | DATE | 截止日期 | 可选 |
| closedDate | DATE | 关闭日期 | 可选 |
| relatedProject | STRING(100) | 关联项目 | 可选 |
| tags | JSON | 标签 | 可选 |
| attachments | JSON | 附件 | 可选 |
| createdBy | INTEGER | 创建人ID | 可选 |
| updatedBy | INTEGER | 更新人ID | 可选 |
| createdAt | DATE | 创建时间 | 自动生成 |
| updatedAt | DATE | 更新时间 | 自动更新 |

**索引**:
- `category`: 风险分类索引
- `level`: 风险等级索引
- `status`: 状态索引
- `identifiedDate`: 识别日期索引
- `createdBy`: 创建人索引

## 前端 API 调用

### API 文件
**文件**: [`frontend/src/api/risk.js`](frontend/src/api/risk.js:1)

### 使用示例

```javascript
import { 
  getRisks,
  getRiskById,
  createRisk, 
  updateRisk, 
  deleteRisk,
  getRiskCategories,
  getRiskStatistics
} from '@/api/risk';

// 获取风险列表（分页）
const result = await getRisks({
  page: 1,
  pageSize: 20,
  keyword: '安全',
  category: '技术风险',
  level: 'high',
  status: 'mitigating'
});

// 获取风险分类
const categories = await getRiskCategories();

// 获取风险统计
const statistics = await getRiskStatistics();

// 获取风险详情
const risk = await getRiskById(1);

// 创建风险
const newRisk = await createRisk({
  title: '系统安全漏洞',
  category: '技术风险',
  level: 'high',
  description: '发现系统存在安全漏洞',
  status: 'identified',
  owner: '张三'
});

// 更新风险
const updatedRisk = await updateRisk(1, {
  status: 'mitigating',
  mitigation: '已修复漏洞'
});

// 删除风险
await deleteRisk(1);

// 批量删除风险
await batchDeleteRisks([1, 2, 3]);
```

## 路由配置

### 前端路由
**文件**: [`frontend/src/router/index.js`](frontend/src/router/index.js:1)

```javascript
{
  path: '/risks',
  name: 'Risks',
  children: [
    {
      path: '',
      name: 'RiskList',
      component: () => import('@/views/risk/List.vue'),
      meta: { title: '风险库' }
    },
    {
      path: 'create',
      name: 'RiskCreate',
      component: () => import('@/views/risk/Create.vue'),
      meta: { title: '创建风险' }
    },
    {
      path: ':id',
      name: 'RiskDetail',
      component: () => import('@/views/risk/Detail.vue'),
      meta: { title: '风险详情' }
    },
    {
      path: 'edit/:id',
      name: 'RiskEdit',
      component: () => import('@/views/risk/Create.vue'),
      meta: { title: '编辑风险' }
    }
  ]
}
```

### 后端路由
**文件**: [`backend/src/routes/risks.js`](backend/src/routes/risks.js:1)

## 业务规则

### 1. 风险创建规则
- 风险标题必填，长度1-200字符
- 风险等级必选，默认为中等
- 风险状态必选，默认为已识别
- 识别日期默认为当前时间

### 2. 风险等级规则
- 低（low）：影响较小，可以接受
- 中（medium）：需要关注，制定应对计划
- 高（high）：需要立即处理，优先级高
- 严重（critical）：严重威胁，需要紧急处理

### 3. 风险状态规则
- 已识别（identified）：风险已被识别，待评估
- 评估中（assessing）：正在评估风险的影响和概率
- 应对中（mitigating）：正在实施应对措施
- 监控中（monitoring）：风险已得到控制，持续监控
- 已关闭（closed）：风险已解决或不再存在

### 4. 状态转换规则
- 风险状态可以按照生命周期顺序转换
- 当状态变更为已关闭时，自动设置关闭日期
- 已关闭的风险可以重新打开

### 5. 发生概率规则
- 极低（very_low）：几乎不可能发生
- 低（low）：不太可能发生
- 中（medium）：可能发生
- 高（high）：很可能发生
- 极高（very_high）：几乎肯定发生

## 使用场景

### 1. 技术风险管理
- 系统安全漏洞
- 技术债务
- 性能问题
- 兼容性问题

### 2. 市场风险管理
- 市场竞争加剧
- 客户需求变化
- 价格波动
- 政策变化

### 3. 财务风险管理
- 资金短缺
- 成本超支
- 收入下降
- 汇率波动

### 4. 运营风险管理
- 供应链中断
- 人员流失
- 质量问题
- 合规风险

### 5. 项目风险管理
- 进度延误
- 资源不足
- 需求变更
- 沟通问题

## 注意事项

1. **及时识别**: 建立风险识别机制，及时发现潜在风险
2. **准确评估**: 客观评估风险的等级和发生概率
3. **有效应对**: 制定切实可行的应对措施
4. **持续监控**: 定期检查风险状态，及时调整应对策略
5. **责任明确**: 为每个风险指定责任人，确保落实
6. **文档完整**: 详细记录风险信息，便于追溯和分析
7. **时间管理**: 设置合理的截止日期，确保及时处理

## 扩展功能建议

1. **风险评分**: 根据等级和概率自动计算风险评分
2. **风险矩阵**: 可视化展示风险等级和概率的分布
3. **风险预警**: 当风险接近截止日期时发送提醒
4. **风险报告**: 生成风险统计报告和趋势分析
5. **风险关联**: 支持风险之间的关联关系
6. **风险模板**: 预设常见风险模板，快速创建
7. **风险审批**: 支持风险的审批流程
8. **风险历史**: 记录风险的变更历史
9. **风险导出**: 支持风险数据的导出
10. **风险看板**: 以看板形式展示不同状态的风险
