# 企业统计分析功能

## 功能概述

为企业提供全面的数据统计分析功能，包括运营概览、收入统计、数据导出等。

## 功能特性

### 1. 企业运营概览
- 总运单数统计
- 总收入统计
- 本月运单数和收入
- 运单状态分布（饼图）
- 收入统计（柱状图）
- 运单状态详情表格

### 2. 收入统计分析
- 收入趋势图（折线图）
- 支付方式分布（饼图）
- 货物类型收入（柱状图）
- 收入明细表格
- 支持按天/周/月分组
- 自定义日期范围查询

### 3. 数据导出
- 支持导出概览数据
- 支持导出收入数据
- JSON格式导出

## 后端接口

### 1. 获取企业运营概览
```
GET /api/companies/{id}/statistics/overview
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "company": {
      "id": "1",
      "name": "示例企业"
    },
    "waybills": {
      "total": 100,
      "pending": 10,
      "inTransit": 30,
      "arrived": 20,
      "signed": 35,
      "abnormal": 3,
      "cancelled": 2
    },
    "revenue": {
      "total": 50000,
      "paid": 40000,
      "unpaid": 10000
    },
    "monthly": {
      "waybills": 25,
      "revenue": 12000
    }
  }
}
```

### 2. 获取收入统计数据
```
GET /api/companies/{id}/statistics/revenue?startDate=2024-01-01&endDate=2024-01-31&groupBy=day
```

**查询参数：**
- `startDate`: 开始日期（可选，默认30天前）
- `endDate`: 结束日期（可选，默认今天）
- `groupBy`: 分组方式（day/week/month，默认day）

**响应示例：**
```json
{
  "success": true,
  "data": {
    "trend": [
      {
        "_id": "2024-01-01",
        "totalRevenue": 5000,
        "paidRevenue": 4000,
        "unpaidRevenue": 1000,
        "waybillCount": 10
      }
    ],
    "paymentMethod": [
      {
        "_id": "现金",
        "count": 20,
        "revenue": 10000
      }
    ],
    "cargoType": [
      {
        "_id": "普货",
        "count": 50,
        "revenue": 25000
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

### 3. 导出统计数据
```
GET /api/companies/{id}/statistics/export?startDate=2024-01-01&endDate=2024-01-31&type=all
```

**查询参数：**
- `startDate`: 开始日期（可选）
- `endDate`: 结束日期（可选）
- `type`: 导出类型（overview/revenue/all，默认overview）

## 前端页面

### 1. 企业运营概览页面
**路由：** `/statistics/overview`

**功能：**
- 选择企业查看统计数据
- 展示运营概览卡片
- 运单状态分布饼图
- 收入统计柱状图
- 运单状态详情表格
- 导出数据功能

### 2. 收入统计分析页面
**路由：** `/statistics/revenue`

**功能：**
- 选择企业查看收入数据
- 日期范围筛选
- 分组方式选择（按天/周/月）
- 收入趋势折线图
- 支付方式分布饼图
- 货物类型收入柱状图
- 收入明细表格
- 导出数据功能

## 安装依赖

在使用前端页面之前，需要安装ECharts依赖：

```bash
cd frontend
npm install echarts vue-echarts
```

## 使用说明

### 1. 查看企业运营概览
1. 访问 `/statistics/overview`
2. 在下拉框中选择要查看的企业
3. 系统自动加载并展示该企业的运营数据
4. 可以点击"导出数据"按钮导出统计数据

### 2. 查看收入统计分析
1. 访问 `/statistics/revenue`
2. 选择要查看的企业
3. 设置日期范围和分组方式
4. 点击"查询"按钮加载数据
5. 查看各种图表和明细数据
6. 可以点击"导出"按钮导出收入数据

## 技术栈

### 后端
- Node.js + Express
- MySQL（企业数据）
- MongoDB（运单数据）

### 前端
- Vue 3
- Element Plus
- ECharts 5
- Axios

## 注意事项

1. 只有审核通过的企业才能查看统计数据
2. 统计数据基于运单数据实时计算
3. 导出的数据为JSON格式
4. 图表会自动响应窗口大小变化
5. 移动端适配已优化

## 文件结构

```
backend/
├── src/
│   ├── controllers/
│   │   └── statisticsController.js    # 统计分析控制器
│   └── routes/
│       └── statistics.js               # 统计分析路由

frontend/
├── src/
│   ├── api/
│   │   └── statistics.js               # 统计分析API接口
│   └── views/
│       └── statistics/
│           ├── Overview.vue            # 运营概览页面
│           └── Revenue.vue             # 收入统计页面
```

## API调用示例

### JavaScript
```javascript
import { getStatisticsOverview, getRevenueStatistics, exportStatistics } from '@/api/statistics';

// 获取运营概览
const overview = await getStatisticsOverview('企业ID');

// 获取收入统计
const revenue = await getRevenueStatistics('企业ID', {
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  groupBy: 'day'
});

// 导出数据
const data = await exportStatistics('企业ID', {
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  type: 'all'
});
```

## 未来扩展

- [ ] 支持更多图表类型
- [ ] 支持导出Excel格式
- [ ] 添加数据对比功能
- [ ] 支持自定义报表
- [ ] 添加数据预测功能
