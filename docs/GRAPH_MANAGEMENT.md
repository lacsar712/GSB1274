# 图数据库管理

## 功能概述

图数据库管理模块用于管理和可视化图数据结构，支持节点和边的存储、查询和可视化展示。通过图数据库，可以更好地表达和分析实体之间的复杂关系。

## 功能特性

### 1. 图数据管理
- **节点管理**：支持创建、查询节点
- **边管理**：支持创建、查询边（关系）
- **属性存储**：节点和边都支持自定义属性
- **类型分类**：节点支持类型分类，边支持标签分类

### 2. 图数据查询
- **节点查询**：按ID、类型、关键词查询节点
- **关系查询**：按边标签查询关系
- **深度查询**：支持指定深度的关系扩展查询
- **组合查询**：支持多条件组合查询

### 3. 图数据可视化
- **力导向图**：使用力导向布局展示图数据
- **交互操作**：支持节点拖拽、缩放等交互
- **筛选功能**：支持按类型、标签筛选显示
- **统计信息**：显示节点数和边数统计

## 数据模型

### GraphNode 模型
**文件**: [`backend/src/models/GraphNode.js`](backend/src/models/GraphNode.js:1)

**字段说明**:
| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INTEGER | 主键ID | 自增 |
| nodeId | STRING(100) | 节点唯一标识 | 必填，唯一 |
| label | STRING(200) | 节点标签 | 必填 |
| type | STRING(50) | 节点类型 | 必填 |
| properties | JSON | 节点属性 | 可选 |
| metadata | JSON | 元数据 | 可选 |
| createdBy | INTEGER | 创建人ID | 可选 |
| updatedBy | INTEGER | 更新人ID | 可选 |

### GraphEdge 模型
**文件**: [`backend/src/models/GraphEdge.js`](backend/src/models/GraphEdge.js:1)

**字段说明**:
| 字段 | 类型 | 说明 | 约束 |
|------|------|------|------|
| id | INTEGER | 主键ID | 自增 |
| edgeId | STRING(100) | 边唯一标识 | 必填，唯一 |
| sourceNodeId | STRING(100) | 源节点ID | 必填 |
| targetNodeId | STRING(100) | 目标节点ID | 必填 |
| label | STRING(200) | 边标签/关系类型 | 必填 |
| properties | JSON | 边属性 | 可选 |
| weight | FLOAT | 边权重 | 默认：1.0 |
| metadata | JSON | 元数据 | 可选 |
| createdBy | INTEGER | 创建人ID | 可选 |
| updatedBy | INTEGER | 更新人ID | 可选 |

## 后端接口

### API 端点

#### 1. 获取图数据
```
GET /api/graph
```

**查询参数**:
- `nodeType`: 节点类型（可选）
- `edgeLabel`: 边标签（可选）
- `limit`: 数据限制（默认：1000）

**响应示例**:
```json
{
  "code": 200,
  "message": "获取图数据成功",
  "data": {
    "nodes": [
      {
        "id": "node1",
        "label": "用户A",
        "type": "user",
        "properties": { "age": 25 }
      }
    ],
    "edges": [
      {
        "id": "edge1",
        "source": "node1",
        "target": "node2",
        "label": "关注",
        "weight": 1.0
      }
    ]
  }
}
```

#### 2. 查询图数据
```
POST /api/graph/query
```

**请求体**:
```json
{
  "nodeIds": ["node1", "node2"],
  "nodeTypes": ["user", "product"],
  "edgeLabels": ["关注", "购买"],
  "depth": 2,
  "keyword": "用户"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "查询图数据成功",
  "data": {
    "nodes": [...],
    "edges": [...]
  }
}
```

## 前端页面

### 图数据可视化页面
**路径**: `/graph/visualization`  
**组件**: [`frontend/src/views/graph/Visualization.vue`](frontend/src/views/graph/Visualization.vue:1)

**功能**:
- 力导向图展示
- 节点类型筛选
- 边标签筛选
- 查询对话框
- 统计信息显示

**注意**: 实际项目中需要安装 ECharts 或 D3.js 等图形库来渲染力导向图。

### 图数据查询页面
**路径**: `/graph/query`  
**组件**: [`frontend/src/views/graph/Query.vue`](frontend/src/views/graph/Query.vue:1)

**功能**:
- 多条件查询
- 深度查询
- 结果展示（节点列表、边列表）
- 可视化跳转

## 前端 API 调用

**文件**: [`frontend/src/api/graph.js`](frontend/src/api/graph.js:1)

```javascript
import { getGraphData, queryGraphData } from '@/api/graph';

// 获取图数据
const result = await getGraphData({
  nodeType: 'user',
  edgeLabel: '关注',
  limit: 1000
});

// 查询图数据
const queryResult = await queryGraphData({
  nodeIds: ['node1'],
  depth: 2
});
```

## 路由配置

**文件**: [`frontend/src/router/index.js`](frontend/src/router/index.js:1)

```javascript
{
  path: '/graph',
  name: 'Graph',
  children: [
    {
      path: 'visualization',
      name: 'GraphVisualization',
      component: () => import('@/views/graph/Visualization.vue'),
      meta: { title: '图数据可视化' }
    },
    {
      path: 'query',
      name: 'GraphQuery',
      component: () => import('@/views/graph/Query.vue'),
      meta: { title: '图数据查询' }
    }
  ]
}
```

## 使用场景

1. **社交网络分析**：用户关系、好友推荐
2. **知识图谱**：实体关系、知识推理
3. **供应链管理**：供应商关系、物流路径
4. **风险传导分析**：风险关联、影响评估
5. **组织架构**：人员关系、汇报链路

## 技术建议

### 图形可视化库选择

1. **ECharts**
   - 优点：易用、中文文档完善、性能好
   - 适用：中小规模图数据（< 1000节点）
   - 安装：`npm install echarts`

2. **D3.js**
   - 优点：灵活、功能强大、社区活跃
   - 适用：需要高度自定义的场景
   - 安装：`npm install d3`

3. **Cytoscape.js**
   - 优点：专业图分析、布局算法丰富
   - 适用：复杂图分析场景
   - 安装：`npm install cytoscape`

### 性能优化建议

1. **数据分页**：大规模图数据分批加载
2. **视口裁剪**：只渲染可见区域的节点
3. **层次渲染**：根据缩放级别调整细节
4. **缓存策略**：缓存查询结果
5. **索引优化**：为常用查询字段建立索引

## 扩展功能建议

1. **图算法**：最短路径、社区发现、中心性分析
2. **图编辑**：可视化编辑节点和边
3. **图导入导出**：支持多种图数据格式
4. **图版本管理**：记录图数据变更历史
5. **图权限控制**：节点和边的访问权限
6. **图数据同步**：与外部图数据库同步
7. **图分析报告**：生成图分析统计报告
