# 新增子系统说明文档

本文档说明了新增的两个子系统的功能和使用方法。

## 3.2 城市末端配送服务子系统

### 功能描述
提供依托综合枢纽的城市末端配送服务管理功能，包括配送订单管理、配送员调度、配送轨迹跟踪和配送统计分析。

### 主要功能

#### 1. 配送订单管理
- 创建配送订单
- 查询配送订单列表
- 查看配送订单详情
- 更新配送订单状态
- 分配配送员
- 删除配送订单

#### 2. 配送统计分析
- 订单统计（总订单数、待分配、配送中、已完成等）
- 配送趋势分析
- 配送员绩效统计
- 货物重量和体积统计

### 技术实现

#### 后端接口
- **基础路径**: `/api/deliveries`
- **接口列表**:
  - `POST /` - 创建配送订单
  - `GET /` - 获取配送订单列表
  - `GET /statistics` - 获取配送统计数据
  - `GET /trend` - 获取配送趋势数据
  - `GET /driver-performance` - 获取配送员绩效数据
  - `GET /order/:order_no` - 根据订单号获取配送订单
  - `GET /:id` - 获取配送订单详情
  - `PUT /:id` - 更新配送订单
  - `PUT /:id/status` - 更新配送状态
  - `PUT /:id/assign` - 分配配送员
  - `DELETE /:id` - 删除配送订单

#### 前端页面
- **配送仪表板**: [`/delivery/dashboard`](frontend/src/views/delivery/Dashboard.vue)
  - 展示配送统计数据卡片
  - 订单趋势图表
  - 订单状态分布饼图
  - 配送员绩效排行柱状图
  
- **配送订单列表**: [`/delivery/list`](frontend/src/views/delivery/List.vue)
  - 订单列表展示
  - 多条件筛选（枢纽、状态、配送类型、日期范围、关键词）
  - 订单操作（查看、编辑、分配、删除）
  - 分页功能

#### 数据库表
- [`deliveries`](database/delivery_service.sql) - 配送订单表
- `delivery_tracks` - 配送轨迹表
- `delivery_ratings` - 配送评价表

### 使用说明

1. **创建配送订单**
   - 访问配送订单列表页面
   - 点击"新建订单"按钮
   - 填写发件人、收件人、货物信息
   - 选择配送类型（即时/预约）
   - 提交创建

2. **分配配送员**
   - 在订单列表中找到待分配订单
   - 点击"分配"按钮
   - 输入配送员ID和姓名
   - 确认分配

3. **查看统计数据**
   - 访问配送仪表板
   - 查看实时统计数据
   - 选择日期范围查看趋势
   - 查看配送员绩效排行

---

## 3.3 企业营运车辆安全服务子系统

### 功能描述
提供企业营运车辆的安全管理功能，包括安全事件监控、实时位置跟踪、安全统计分析和高风险车辆预警。

### 主要功能

#### 1. 安全事件管理
- 记录车辆安全事件
- 查询安全事件列表
- 查看事件详情
- 处理安全事件
- 删除安全事件

#### 2. 实时监控
- 车辆实时位置展示（地图）
- 高风险车辆列表
- 安全事件实时预警

#### 3. 统计分析
- 安全事件统计（总数、严重事件、待处理等）
- 事件类型分布
- 事件趋势分析
- 高风险车辆排行

### 技术实现

#### 后端接口
- **基础路径**: `/api/vehicle-safety`
- **接口列表**:
  - `POST /` - 创建车辆安全记录
  - `GET /` - 获取车辆安全记录列表
  - `GET /statistics` - 获取车辆安全统计数据
  - `GET /event-distribution` - 获取事件类型分布
  - `GET /trend` - 获取趋势数据
  - `GET /locations` - 获取车辆实时位置
  - `GET /high-risk` - 获取高风险车辆列表
  - `GET /:id` - 获取车辆安全记录详情
  - `PUT /:id` - 更新车辆安全记录
  - `PUT /:id/status` - 更新处理状态
  - `DELETE /:id` - 删除车辆安全记录

#### 前端页面
- **安全监控仪表板**: [`/vehicle-safety/dashboard`](frontend/src/views/vehicleSafety/Dashboard.vue)
  - 安全统计数据卡片
  - 车辆实时位置地图（需集成地图API）
  - 高风险车辆列表
  - 事件趋势图表
  - 事件类型分布饼图
  
- **安全事件列表**: [`/vehicle-safety/list`](frontend/src/views/vehicleSafety/List.vue)
  - 事件列表展示
  - 多条件筛选（车辆、事件类型、事件等级、处理状态、日期范围）
  - 事件操作（查看、处理、删除）
  - 分页功能

#### 数据库表
- [`vehicle_safety`](database/vehicle_safety.sql) - 车辆安全事件表
- `vehicle_safety_rules` - 车辆安全规则表
- `vehicle_safety_alerts` - 车辆安全预警表
- `vehicle_safety_inspections` - 车辆安全检查记录表

### 使用说明

1. **查看安全监控**
   - 访问安全监控仪表板
   - 查看实时统计数据
   - 在地图上查看车辆位置
   - 查看高风险车辆列表

2. **处理安全事件**
   - 在事件列表中找到待处理事件
   - 点击"处理"按钮
   - 选择处理状态
   - 填写处理结果
   - 提交处理

3. **查看统计分析**
   - 访问安全监控仪表板
   - 选择日期范围
   - 查看事件趋势
   - 查看事件类型分布

---

## 设计特点

### 1. 现代化设计风格
- 采用卡片式布局
- 使用渐变色图标
- 响应式设计，支持PC端和移动端

### 2. 数据可视化
- 使用 ECharts 图表库
- 折线图展示趋势
- 饼图展示分布
- 柱状图展示排行

### 3. RESTful API设计
- 遵循RESTful设计原则
- 统一的响应格式
- 完善的错误处理

### 4. 用户体验优化
- 多条件筛选
- 分页加载
- 实时刷新
- 操作反馈

---

## 部署说明

### 1. 数据库初始化
```bash
# 执行配送服务数据库脚本
mysql -u root -p < database/delivery_service.sql

# 执行车辆安全服务数据库脚本
mysql -u root -p < database/vehicle_safety.sql
```

### 2. 后端部署
后端路由已自动注册到 [`backend/src/app.js`](backend/src/app.js:27-28)，无需额外配置。

### 3. 前端部署
前端路由已自动注册到 [`frontend/src/router/index.js`](frontend/src/router/index.js:423-451)，无需额外配置。

### 4. 地图集成（可选）
车辆安全监控仪表板预留了地图组件位置，建议集成：
- 高德地图 API
- 百度地图 API
- 腾讯地图 API

---

## 注意事项

1. **地图功能**: 车辆实时位置监控需要集成第三方地图API才能正常显示
2. **权限控制**: 建议根据实际需求添加用户权限验证
3. **数据安全**: 敏感数据应加密存储和传输
4. **性能优化**: 大数据量时建议添加缓存机制
5. **实时更新**: 可以考虑使用WebSocket实现实时数据推送

---

## 技术栈

### 后端
- Node.js + Express
- MySQL
- RESTful API

### 前端
- Vue 3
- Element Plus
- ECharts
- Vue Router
- Axios

---

## 文件清单

### 后端文件
- [`backend/src/models/Delivery.js`](backend/src/models/Delivery.js) - 配送订单模型
- [`backend/src/models/VehicleSafety.js`](backend/src/models/VehicleSafety.js) - 车辆安全模型
- [`backend/src/controllers/deliveryController.js`](backend/src/controllers/deliveryController.js) - 配送订单控制器
- [`backend/src/controllers/vehicleSafetyController.js`](backend/src/controllers/vehicleSafetyController.js) - 车辆安全控制器
- [`backend/src/routes/deliveries.js`](backend/src/routes/deliveries.js) - 配送订单路由
- [`backend/src/routes/vehicleSafety.js`](backend/src/routes/vehicleSafety.js) - 车辆安全路由

### 前端文件
- [`frontend/src/api/delivery.js`](frontend/src/api/delivery.js) - 配送订单API
- [`frontend/src/api/vehicleSafety.js`](frontend/src/api/vehicleSafety.js) - 车辆安全API
- [`frontend/src/views/delivery/Dashboard.vue`](frontend/src/views/delivery/Dashboard.vue) - 配送仪表板
- [`frontend/src/views/delivery/List.vue`](frontend/src/views/delivery/List.vue) - 配送订单列表
- [`frontend/src/views/vehicleSafety/Dashboard.vue`](frontend/src/views/vehicleSafety/Dashboard.vue) - 安全监控仪表板
- [`frontend/src/views/vehicleSafety/List.vue`](frontend/src/views/vehicleSafety/List.vue) - 安全事件列表

### 数据库文件
- [`database/delivery_service.sql`](database/delivery_service.sql) - 配送服务数据库表
- [`database/vehicle_safety.sql`](database/vehicle_safety.sql) - 车辆安全数据库表
