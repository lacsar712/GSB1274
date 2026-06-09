# 车辆库管理功能

## 功能概述

车辆库管理功能提供了完整的车辆信息管理系统，支持车辆的创建、查询、更新和删除操作，并提供表格和地图两种视图方式展示车辆信息。

## 后端实现

### 数据库模型

**文件位置**: [`backend/src/models/Vehicle.js`](backend/src/models/Vehicle.js)

主要功能：
- `findAll()` - 获取车辆列表（支持筛选和分页）
- `findById()` - 获取车辆详情
- `create()` - 创建新车辆
- `update()` - 更新车辆信息
- `delete()` - 删除车辆
- `updateStatus()` - 更新车辆状态
- `updateLocation()` - 更新车辆位置
- `getStatistics()` - 获取车辆统计信息
- `getAllLocations()` - 获取所有车辆位置（用于地图展示）

### 控制器

**文件位置**: [`backend/src/controllers/vehicleController.js`](backend/src/controllers/vehicleController.js)

提供的接口：
- `getVehicles` - 获取车辆列表
- `getVehicleById` - 获取车辆详情
- `createVehicle` - 创建车辆
- `updateVehicle` - 更新车辆
- `deleteVehicle` - 删除车辆
- `updateVehicleStatus` - 更新车辆状态
- `updateVehicleLocation` - 更新车辆位置
- `getVehicleStatistics` - 获取车辆统计信息
- `getVehicleLocations` - 获取车辆位置列表

### 路由配置

**文件位置**: [`backend/src/routes/vehicles.js`](backend/src/routes/vehicles.js)

API端点：
- `GET /api/vehicles` - 获取车辆列表
- `GET /api/vehicles/locations` - 获取所有车辆位置
- `GET /api/vehicles/:vehicleId` - 获取车辆详情
- `POST /api/vehicles` - 创建车辆
- `PUT /api/vehicles/:vehicleId` - 更新车辆
- `DELETE /api/vehicles/:vehicleId` - 删除车辆
- `PATCH /api/vehicles/:vehicleId/status` - 更新车辆状态
- `PATCH /api/vehicles/:vehicleId/location` - 更新车辆位置
- `GET /api/vehicles/:vehicleId/statistics` - 获取车辆统计信息

## 前端实现

### API接口

**文件位置**: [`frontend/src/api/vehicle.js`](frontend/src/api/vehicle.js)

封装的API方法：
- `getVehicles()` - 获取车辆列表
- `getVehicleById()` - 获取车辆详情
- `createVehicle()` - 创建车辆
- `updateVehicle()` - 更新车辆
- `deleteVehicle()` - 删除车辆
- `updateVehicleStatus()` - 更新车辆状态
- `updateVehicleLocation()` - 更新车辆位置
- `getVehicleStatistics()` - 获取车辆统计信息
- `getVehicleLocations()` - 获取车辆位置列表

### 页面组件

#### 1. 车辆列表页面

**文件位置**: [`frontend/src/views/vehicle/List.vue`](frontend/src/views/vehicle/List.vue)

功能特点：
- **双视图模式**：支持表格视图和地图视图切换
- **搜索筛选**：支持按车牌号、车辆类型、状态筛选
- **表格视图**：
  - 显示车牌号、车辆类型、品牌型号、载重容积等信息
  - 显示司机信息和承运人信息
  - 显示当前位置和状态
  - 支持查看、编辑、删除操作
  - 分页功能
- **地图视图**：
  - 显示所有有位置信息的车辆
  - 车辆位置列表展示
  - 点击可查看车辆详情

#### 2. 车辆详情页面

**文件位置**: [`frontend/src/views/vehicle/Detail.vue`](frontend/src/views/vehicle/Detail.vue)

展示内容：
- **基本信息**：车牌号、车辆类型、品牌型号、颜色、年份、载重能力、容积等
- **司机信息**：司机姓名、电话、驾驶证号
- **承运人信息**：承运人名称、联系人、联系电话
- **位置信息**：当前位置、经纬度坐标、地图预览
- **证件信息**：注册日期、保险到期日、年检到期日、GPS设备ID
- **运营统计**：总运单数、总运费、平均评分
- **最近运单**：显示最近10条运单记录

功能操作：
- 编辑车辆信息
- 更新车辆位置
- 切换车辆状态（启用/停用）
- 删除车辆

#### 3. 车辆创建/编辑页面

**文件位置**: [`frontend/src/views/vehicle/Create.vue`](frontend/src/views/vehicle/Create.vue)

表单内容：
- **基本信息**：车牌号（必填）、车辆类型（必填）、品牌、型号、颜色、年份、载重能力、容积、状态
- **司机信息**：司机姓名、电话、驾驶证号
- **承运人信息**：选择关联的承运人
- **证件信息**：注册日期、保险到期日、年检到期日、GPS设备ID
- **位置信息**：当前位置、纬度、经度
- **其他信息**：描述

功能特点：
- 支持创建新车辆和编辑现有车辆
- 表单验证
- 自动加载承运人列表供选择
- 编辑模式自动填充现有数据

### 路由配置

**文件位置**: [`frontend/src/router/index.js`](frontend/src/router/index.js:147-177)

路由定义：
- `/vehicles` - 车辆列表页面
- `/vehicles/create` - 创建车辆页面
- `/vehicles/:id` - 车辆详情页面
- `/vehicles/:id/edit` - 编辑车辆页面

## 数据结构

### 车辆信息字段

```javascript
{
  id: Number,                    // 车辆ID
  plate_number: String,          // 车牌号（必填）
  vehicle_type: String,          // 车辆类型（必填）
  brand: String,                 // 品牌
  model: String,                 // 型号
  color: String,                 // 颜色
  year: Number,                  // 年份
  load_capacity: Number,         // 载重能力（吨）
  volume_capacity: Number,       // 容积（m³）
  carrier_id: Number,            // 承运人ID
  driver_name: String,           // 司机姓名
  driver_phone: String,          // 司机电话
  driver_license: String,        // 驾驶证号
  registration_date: Date,       // 注册日期
  insurance_expiry: Date,        // 保险到期日
  inspection_expiry: Date,       // 年检到期日
  gps_device_id: String,         // GPS设备ID
  current_location: String,      // 当前位置
  latitude: Number,              // 纬度
  longitude: Number,             // 经度
  description: String,           // 描述
  status: String,                // 状态（available/in_use/maintenance/inactive）
  created_at: DateTime,          // 创建时间
  updated_at: DateTime           // 更新时间
}
```

### 车辆类型

- `truck` - 货车
- `van` - 厢式货车
- `flatbed` - 平板车
- `container` - 集装箱车
- `refrigerated` - 冷藏车

### 车辆状态

- `available` - 可用
- `in_use` - 使用中
- `maintenance` - 维护中
- `inactive` - 停用

## 使用说明

### 查看车辆列表

1. 访问 `/vehicles` 路由
2. 可以使用搜索栏按车牌号、车辆类型、状态筛选
3. 点击"表格视图"或"地图视图"切换显示方式
4. 在表格视图中，点击行可查看详情，或使用操作按钮进行编辑/删除
5. 在地图视图中，可以看到所有有位置信息的车辆分布

### 创建车辆

1. 在车辆列表页面点击"添加车辆"按钮
2. 填写车辆基本信息（车牌号和车辆类型为必填）
3. 可选填写司机信息、承运人、证件信息、位置信息等
4. 点击"创建"按钮提交

### 查看车辆详情

1. 在车辆列表中点击车辆行或"查看详情"按钮
2. 查看车辆的完整信息
3. 可以进行编辑、更新位置、切换状态、删除等操作

### 编辑车辆

1. 在车辆详情页面点击"编辑"按钮
2. 或在列表页面点击"编辑"图标
3. 修改车辆信息后点击"保存"

### 更新车辆位置

1. 在车辆详情页面点击"更新位置"按钮
2. 输入新的位置信息和经纬度坐标
3. 点击"确定"保存

## 注意事项

1. 车牌号和车辆类型为必填字段
2. 删除车辆前会检查是否有关联的运单记录
3. 保险和年检到期日期临近30天内会在详情页面显示警告
4. 地图视图仅显示有经纬度坐标的车辆
5. 车辆位置信息可以通过GPS设备自动更新或手动更新

## 扩展建议

1. 集成真实的地图组件（如高德地图、百度地图）
2. 实现GPS设备实时位置追踪
3. 添加车辆维护记录管理
4. 添加车辆行驶轨迹查询
5. 实现车辆调度功能
6. 添加车辆油耗统计
7. 实现车辆保险和年检到期提醒
