# 运营统计分析功能文档

## 功能概述

运营统计分析功能提供全面的运营数据统计和可视化分析，支持多维度数据查询、图表展示和数据导出。

## 功能特性

### 1. 数据统计维度
- 运单数量统计（按状态分类）
- 收入统计（总收入、已收款、未收款）
- 企业活跃度统计
- 时间趋势分析
- Top企业排行
- 支付方式分布

### 2. 前端页面

#### 2.1 运营统计仪表板
**路径**: `/operations/dashboard`

**功能**:
- 核心指标卡片展示（企业数、运单数、收入等）
- 运单状态分布饼图
- 收入统计柱状图
- 支持按企业ID、日期范围筛选
- 数据导出功能

**页面组件**: [`frontend/src/views/operations/Dashboard.vue`](frontend/src/views/operations/Dashboard.vue)

**特点**:
- 现代化卡片式布局
- 渐变色彩设计
- 响应式图表
- 实时数据更新

#### 2.2 运营收入统计页面
**路径**: `/operations/revenue`

**功能**:
- 收入趋势折线图（支持按天/周/月分组）
- Top 10企业收入排行
- 支付方式分布饼图
- 收入明细数据表格
- 收款率分析
- 数据导出功能

**页面组件**: [`frontend/src/views/operations/Revenue.vue`](frontend/src/views/operations/Revenue.vue)

**图表类型**:
- 折线图：展示收入趋势（使用ECharts）
- 横向柱状图：Top企业排行
- 饼图：支付方式分布
- 数据表格：详细收入明细

### 3. 后端接口

#### 3.1 获取运营概览
```
GET /api/operations/statistics/overview
```

**查询参数**:
- `companyId`: 企业ID（可选，不传则统计全部）
- `startDate`: 开始日期（可选，默认30天前）
- `endDate`: 结束日期（可选，默认今天）

**响应示例**:
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-01-31T23:59:59.999Z"
    },
    "companies": {
      "total": 100,
      "active": 85
    },
    "waybills": {
      "total": 5000,
      "pending": 500,
      "inTransit": 1500,
      "arrived": 800,
      "signed": 2000,
      "abnormal": 150,
      "cancelled": 50
    },
    "revenue": {
      "total": 5000000,
      "paid": 4500000,
      "unpaid": 500000
    }
  }
}
```

#### 3.2 获取收入统计
```
GET /api/operations/statistics/revenue
```

**查询参数**:
- `companyId`: 企业ID（可选）
- `startDate`: 开始日期（可选）
- `endDate`: 结束日期（可选）
- `groupBy`: 分组方式（day/week/month，默认day）

**响应示例**:
```json
{
  "success": true,
  "data": {
    "trend": [
      {
        "_id": "2024-01-01",
        "totalRevenue": 100000,
        "paidRevenue": 90000,
        "unpaidRevenue": 10000,
        "waybillCount": 50
      }
    ],
    "topCompanies": [
      {
        "_id": "1",
        "companyName": "物流公司A",
        "waybillCount": 500,
        "revenue": 500000
      }
    ],
    "paymentMethod": [
      {
        "_id": "bank_transfer",
        "count": 300,
        "revenue": 300000
      }
    ],
    "period": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-01-31T23:59:59.999Z",
      "groupBy": "day"
    }
  }
}
```

#### 3.3 导出运营数据
```
GET /api/operations/statistics/export
```

**查询参数**:
- `companyId`: 企业ID（可选）
- `startDate`: 开始日期（可选）
- `endDate`: 结束日期（可选）
- `type`: 导出类型（overview/revenue/all，默认overview）

**响应**: JSON文件下载

### 4. 图表配置

#### 4.1 运单状态分布饼图
- 类型：环形饼图（Doughnut Chart）
- 颜色方案：6色渐变
- 交互：悬停显示详情
- 图例：右侧垂直布局

#### 4.2 收入趋势折线图
- 类型：面积折线图（Area Line Chart）
- 数据系列：总收入、已收款、未收款
- 颜色：蓝色（总收入）、绿色（已收款）、橙色（未收款）
- 交互：十字准星、数据点提示
- 渐变填充：增强视觉效果

#### 4.3 Top企业排行柱状图
- 类型：横向柱状图（Horizontal Bar Chart）
- 渐变色：紫色渐变
- 数据标签：显示在柱状图右侧
- 排序：按收入降序

#### 4.4 支付方式分布饼图
- 类型：环形饼图
- 颜色方案：5色配色
- 图例：右侧垂直布局
- 百分比显示

### 5. 数据处理

#### 5.1 日期范围处理
- 默认查询最近30天数据
- 支持自定义日期范围
- 自动处理时区转换

#### 5.2 数据聚合
- 按日/周/月分组统计
- 多维度数据汇总
- 实时计算统计指标

#### 5.3 数据格式化
- 金额格式化（千分位分隔）
- 日期格式化（本地化显示）
- 百分比计算和显示

### 6. 性能优化

- 数据分页加载
- 图表懒加载
- 响应式图表自适应
- 数据缓存机制

## 使用示例

### 前端调用示例

```javascript
import { 
  getOperationsOverview, 
  getOperationsRevenue,
  exportOperationsData 
} from '@/api/statistics';

// 获取运营概览
const overview = await getOperationsOverview({
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

// 获取收入统计
const revenue = await getOperationsRevenue({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  groupBy: 'day'
});

// 导出数据
const exportData = await exportOperationsData({
  type: 'all',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

### ECharts图表初始化示例

```javascript
import * as echarts from 'echarts';

// 初始化图表
const chart = echarts.init(chartDom);

// 配置选项
const option = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  xAxis: {
    type: 'category',
    data: dates
  },
  yAxis: {
    type: 'value',
    name: '金额（元）'
  },
  series: [
    {
      name: '总收入',
      type: 'line',
      data: revenueData,
      smooth: true,
      areaStyle: {
        color: 'rgba(64, 158, 255, 0.3)'
      }
    }
  ]
};

// 设置配置
chart.setOption(option);

// 响应式调整
window.addEventListener('resize', () => chart.resize());
```

## 数据可视化设计

### 1. 颜色方案
- 主色调：蓝色系（#409eff）
- 成功色：绿色系（#67c23a）
- 警告色：橙色系（#e6a23c）
- 危险色：红色系（#f56c6c）
- 渐变色：紫色渐变、蓝绿渐变

### 2. 布局设计
- 卡片式布局
- 网格系统（Grid Layout）
- 响应式设计（移动端适配）
- 阴影和圆角增强层次感

### 3. 交互设计
- 悬停效果
- 点击查看详情
- 筛选条件实时更新
- 加载状态提示

## 注意事项

1. 大数据量查询时建议限制日期范围
2. 图表渲染前确保DOM元素已挂载
3. 组件销毁时需要销毁图表实例，避免内存泄漏
4. 导出数据时注意文件大小限制
5. 移动端访问时图表会自动适配屏幕尺寸

## 相关文件

### 前端文件
- 仪表板页面: [`frontend/src/views/operations/Dashboard.vue`](frontend/src/views/operations/Dashboard.vue:1)
- 收入统计页面: [`frontend/src/views/operations/Revenue.vue`](frontend/src/views/operations/Revenue.vue:1)
- API接口: [`frontend/src/api/statistics.js`](frontend/src/api/statistics.js:1)
- 路由配置: [`frontend/src/router/index.js`](frontend/src/router/index.js:387)

### 后端文件
- 统计控制器: [`backend/src/controllers/statisticsController.js`](backend/src/controllers/statisticsController.js:410)
- 统计路由: [`backend/src/routes/statistics.js`](backend/src/routes/statistics.js:1)

## 扩展功能建议

1. 添加更多统计维度（如地区分布、货物类型分析）
2. 支持自定义报表生成
3. 添加数据对比功能（同比、环比）
4. 实现数据预警机制
5. 支持导出Excel格式
6. 添加数据钻取功能
