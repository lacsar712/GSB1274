# 运营管理系统文档

## 概述

运营管理系统包含三个主要模块：
1. **运营消息中心** - 管理运营消息和通知
2. **运维监控** - 系统运维监控功能
3. **运营系统管理** - 运营系统管理功能

## 一、运营消息中心

### 功能描述
管理运营消息和通知，支持消息的发送、接收、阅读状态管理和通知偏好设置。

### 前端页面

#### 1. 消息列表页面 (`/operations/messages`)
- **文件路径**: [`frontend/src/views/operations/MessageList.vue`](../frontend/src/views/operations/MessageList.vue)
- **功能特性**:
  - 时间线设计展示运营消息
  - 支持按类型、状态、时间范围筛选
  - 消息分类标签（系统消息、运营消息、告警消息、通知消息）
  - 优先级标识（高、中、低）
  - 未读消息高亮显示
  - 快速标记已读功能
  - 分页展示

#### 2. 消息详情页面 (`/operations/messages/:msgId`)
- **文件路径**: [`frontend/src/views/operations/MessageDetail.vue`](../frontend/src/views/operations/MessageDetail.vue)
- **功能特性**:
  - 展示消息完整内容
  - 显示发送者、接收者、时间等元信息
  - 支持附件查看和下载
  - 标记已读功能
  - 消息状态展示

#### 3. 消息设置页面（对话框形式）
- **集成在**: [`MessageList.vue`](../frontend/src/views/operations/MessageList.vue)
- **功能特性**:
  - 邮件通知开关
  - 短信通知开关
  - 推送通知开关
  - 通知类型选择
  - 免打扰时段设置

### 后端接口

#### API 端点

##### 1. 获取运营消息列表
```
GET /api/operations/messages
```
**查询参数**:
- `page`: 页码（默认: 1）
- `pageSize`: 每页数量（默认: 20）
- `type`: 消息类型（system/operation/alert/notification）
- `status`: 消息状态（unread/read）
- `startDate`: 开始日期
- `endDate`: 结束日期

**响应示例**:
```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "title": "系统维护通知",
        "content": "系统将于今晚进行维护...",
        "type": "system",
        "priority": "high",
        "status": "active",
        "read_status": "unread",
        "sender": "系统管理员",
        "receiver": "所有用户",
        "created_at": "2026-02-05T10:00:00Z",
        "updated_at": "2026-02-05T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100
    }
  }
}
```

##### 2. 获取消息详情
```
GET /api/operations/messages/:msgId
```

##### 3. 标记消息为已读
```
PUT /api/operations/messages/:msgId/read
```

##### 4. 获取消息设置
```
GET /api/operations/messages/settings?userId={userId}
```

##### 5. 更新消息设置
```
PUT /api/operations/messages/settings
```
**请求体**:
```json
{
  "userId": 1,
  "emailNotification": true,
  "smsNotification": false,
  "pushNotification": true,
  "notificationTypes": ["system", "operation", "alert"],
  "quietHoursStart": "22:00",
  "quietHoursEnd": "08:00"
}
```

### 数据库表结构

#### operations_messages 表
```sql
CREATE TABLE operations_messages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  type VARCHAR(50),
  priority VARCHAR(20),
  status VARCHAR(20),
  read_status VARCHAR(20),
  sender VARCHAR(100),
  receiver VARCHAR(100),
  attachments JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);
```

#### message_settings 表
```sql
CREATE TABLE message_settings (
  user_id INTEGER PRIMARY KEY,
  email_notification BOOLEAN DEFAULT true,
  sms_notification BOOLEAN DEFAULT false,
  push_notification BOOLEAN DEFAULT true,
  notification_types TEXT[],
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 二、运维监控

### 功能描述
提供系统运维监控功能，包括系统状态监控、性能监控和日志查看。

### 前端页面

#### 1. 系统监控仪表板 (`/operations/monitoring/dashboard`)
- **文件路径**: [`frontend/src/views/operations/MonitoringDashboard.vue`](../frontend/src/views/operations/MonitoringDashboard.vue)
- **功能特性**:
  - 实时系统状态展示
  - CPU、内存、磁盘使用率监控
  - 数据库连接数监控
  - 服务状态监控
  - 自动刷新（30秒间隔）
  - 时间范围选择（1小时/6小时/24小时/7天）

#### 2. 性能监控页面 (`/operations/monitoring/performance`)
- **文件路径**: [`frontend/src/views/operations/PerformanceMonitoring.vue`](../frontend/src/views/operations/PerformanceMonitoring.vue)
- **功能特性**:
  - 响应时间趋势图表
  - 吞吐量趋势图表
  - 错误率趋势图表
  - 数据库性能指标
  - 性能摘要统计
  - 使用 ECharts 进行数据可视化

#### 3. 系统日志页面 (`/operations/logs`)
- **文件路径**: [`frontend/src/views/operations/SystemLogs.vue`](../frontend/src/views/operations/SystemLogs.vue)
- **功能特性**:
  - 日志级别筛选（DEBUG/INFO/WARNING/ERROR/CRITICAL）
  - 模块筛选
  - 时间范围筛选
  - 关键词搜索
  - 日志详情展开查看
  - 日志导出功能
  - 分页展示

### 后端接口

#### API 端点

##### 1. 获取系统监控数据
```
GET /api/operations/monitoring/system
```
**查询参数**:
- `timeRange`: 时间范围（1h/6h/24h/7d）

**响应示例**:
```json
{
  "success": true,
  "data": {
    "system": {
      "status": "running",
      "timestamp": "2026-02-05T15:00:00Z",
      "active_connections": 25,
      "total_connections": 50,
      "database_size": 1073741824
    },
    "performance": {
      "cpu": {
        "usage": 45.5,
        "cores": 4
      },
      "memory": {
        "used": 4294967296,
        "total": 8589934592
      },
      "disk": {
        "used": 107374182400,
        "total": 536870912000
      }
    },
    "services": [
      {
        "name": "API Server",
        "status": "running",
        "uptime": "15d 6h 23m"
      }
    ]
  }
}
```

##### 2. 获取性能监控数据
```
GET /api/operations/monitoring/performance
```
**查询参数**:
- `timeRange`: 时间范围（1h/6h/24h）
- `metric`: 指标类型（all/response_time/throughput/error_rate）

##### 3. 获取系统日志
```
GET /api/operations/logs
```
**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `level`: 日志级别
- `module`: 模块名称
- `startDate`: 开始时间
- `endDate`: 结束时间
- `keyword`: 关键词

### 数据库表结构

#### system_logs 表
```sql
CREATE TABLE system_logs (
  id SERIAL PRIMARY KEY,
  level VARCHAR(20),
  module VARCHAR(50),
  message TEXT,
  details JSONB,
  user_id INTEGER,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_module ON system_logs(module);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
```

---

## 三、运营系统管理

### 功能描述
提供运营系统管理功能，包括系统配置、用户权限管理和操作日志查看。

### 前端页面

#### 1. 系统配置页面 (`/operations/config`)
- **文件路径**: [`frontend/src/views/operations/SystemConfig.vue`](../frontend/src/views/operations/SystemConfig.vue)
- **功能特性**:
  - 分类标签页展示配置项
  - 支持多种配置类型（布尔值、数字、文本、下拉选择）
  - 批量保存配置
  - 配置项元信息展示
  - 私有配置标识

#### 2. 用户权限管理页面 (`/operations/permissions`)
- **文件路径**: [`frontend/src/views/operations/UserPermissions.vue`](../frontend/src/views/operations/UserPermissions.vue)
- **功能特性**:
  - 用户列表展示
  - 角色筛选
  - 状态筛选
  - 权限编辑对话框
  - 角色分配
  - 细粒度权限控制
  - 权限标签展示

#### 3. 操作日志页面 (`/operations/operation-logs`)
- **文件路径**: [`frontend/src/views/operations/OperationLogs.vue`](../frontend/src/views/operations/OperationLogs.vue)
- **功能特性**:
  - 操作类型筛选
  - 模块筛选
  - 用户筛选
  - 时间范围筛选
  - 日志详情展开
  - 请求/响应数据查看
  - 日志导出功能

### 后端接口

#### API 端点

##### 1. 获取系统配置
```
GET /api/operations/config
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "configs": [
      {
        "id": 1,
        "config_key": "system.name",
        "config_value": "运营管理系统",
        "config_type": "string",
        "description": "系统名称",
        "category": "system",
        "is_public": true,
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-02-05T10:00:00Z"
      }
    ],
    "byCategory": {
      "system": [...],
      "database": [...],
      "security": [...]
    }
  }
}
```

##### 2. 更新系统配置
```
PUT /api/operations/config
```
**请求体**:
```json
{
  "configs": [
    {
      "key": "system.name",
      "value": "新系统名称"
    }
  ]
}
```

##### 3. 获取用户列表
```
GET /api/operations/users
```
**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `role`: 角色（admin/operator/user/guest）
- `status`: 状态（active/disabled/locked）
- `keyword`: 关键词

##### 4. 更新用户权限
```
PUT /api/operations/users/permissions
```
**请求体**:
```json
{
  "userId": 1,
  "role": "operator",
  "permissions": [
    "user:manage",
    "data:view",
    "data:edit"
  ]
}
```

##### 5. 获取操作日志
```
GET /api/operations/operation-logs
```
**查询参数**:
- `page`: 页码
- `pageSize`: 每页数量
- `userId`: 用户ID
- `action`: 操作类型（create/update/delete/query/login/logout）
- `module`: 模块名称
- `startDate`: 开始时间
- `endDate`: 结束时间

### 数据库表结构

#### system_config 表
```sql
CREATE TABLE system_config (
  id SERIAL PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT,
  config_type VARCHAR(20),
  description TEXT,
  category VARCHAR(50),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_system_config_category ON system_config(category);
```

#### operation_logs 表
```sql
CREATE TABLE operation_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  username VARCHAR(100),
  action VARCHAR(50),
  module VARCHAR(50),
  description TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  request_data JSONB,
  response_data JSONB,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_operation_logs_user_id ON operation_logs(user_id);
CREATE INDEX idx_operation_logs_action ON operation_logs(action);
CREATE INDEX idx_operation_logs_module ON operation_logs(module);
CREATE INDEX idx_operation_logs_created_at ON operation_logs(created_at);
```

---

## 前端 API 调用

所有前端 API 调用都通过 [`frontend/src/api/operations.js`](../frontend/src/api/operations.js) 文件进行封装。

### 使用示例

```javascript
import {
  getOperationMessages,
  markMessageAsRead,
  getSystemMonitoring,
  getSystemConfig,
  updateUserPermissions
} from '@/api/operations';

// 获取消息列表
const messages = await getOperationMessages({ page: 1, pageSize: 20 });

// 标记消息已读
await markMessageAsRead(messageId);

// 获取系统监控数据
const monitoring = await getSystemMonitoring({ timeRange: '1h' });

// 获取系统配置
const config = await getSystemConfig();

// 更新用户权限
await updateUserPermissions({
  userId: 1,
  role: 'operator',
  permissions: ['user:manage', 'data:view']
});
```

---

## 路由配置

### 后端路由
- **文件路径**: [`backend/src/routes/operations.js`](../backend/src/routes/operations.js)
- **基础路径**: `/api/operations`

### 前端路由
需要在 [`frontend/src/router/index.js`](../frontend/src/router/index.js) 中添加以下路由配置:

```javascript
{
  path: '/operations',
  name: 'Operations',
  children: [
    {
      path: 'messages',
      name: 'MessageList',
      component: () => import('@/views/operations/MessageList.vue')
    },
    {
      path: 'messages/:msgId',
      name: 'MessageDetail',
      component: () => import('@/views/operations/MessageDetail.vue')
    },
    {
      path: 'monitoring/dashboard',
      name: 'MonitoringDashboard',
      component: () => import('@/views/operations/MonitoringDashboard.vue')
    },
    {
      path: 'monitoring/performance',
      name: 'PerformanceMonitoring',
      component: () => import('@/views/operations/PerformanceMonitoring.vue')
    },
    {
      path: 'logs',
      name: 'SystemLogs',
      component: () => import('@/views/operations/SystemLogs.vue')
    },
    {
      path: 'config',
      name: 'SystemConfig',
      component: () => import('@/views/operations/SystemConfig.vue')
    },
    {
      path: 'permissions',
      name: 'UserPermissions',
      component: () => import('@/views/operations/UserPermissions.vue')
    },
    {
      path: 'operation-logs',
      name: 'OperationLogs',
      component: () => import('@/views/operations/OperationLogs.vue')
    }
  ]
}
```

---

## 权限控制

### 权限列表

| 权限代码 | 权限名称 | 说明 |
|---------|---------|------|
| `user:manage` | 用户管理 | 管理用户账号 |
| `role:manage` | 角色管理 | 管理用户角色 |
| `permission:manage` | 权限管理 | 管理用户权限 |
| `system:config` | 系统配置 | 修改系统配置 |
| `data:view` | 数据查看 | 查看数据 |
| `data:edit` | 数据编辑 | 编辑数据 |
| `data:delete` | 数据删除 | 删除数据 |
| `log:view` | 日志查看 | 查看系统日志 |
| `monitor:view` | 监控查看 | 查看监控数据 |
| `report:view` | 报表查看 | 查看报表 |
| `report:export` | 报表导出 | 导出报表 |
| `audit:manage` | 审核管理 | 管理审核流程 |

### 角色权限映射

| 角色 | 默认权限 |
|-----|---------|
| 管理员 (admin) | 所有权限 |
| 运营人员 (operator) | `data:*`, `log:view`, `monitor:view`, `report:*` |
| 普通用户 (user) | `data:view`, `report:view` |
| 访客 (guest) | `data:view` |

---

## 依赖项

### 后端依赖
- Express.js
- PostgreSQL
- pg (PostgreSQL 客户端)

### 前端依赖
- Vue 3
- Element Plus
- ECharts (用于图表展示)
- Vue Router
- Axios

---

## 部署说明

### 1. 数据库初始化

执行以下 SQL 脚本创建所需的数据库表:

```bash
psql -U postgres -d your_database -f database/operations.sql
```

### 2. 后端部署

```bash
cd backend
npm install
npm start
```

### 3. 前端部署

```bash
cd frontend
npm install
npm run dev  # 开发环境
npm run build  # 生产环境
```

---

## 注意事项

1. **性能监控数据**: 当前实现中部分性能数据为模拟数据，生产环境需要集成真实的系统监控工具
2. **日志导出**: 日志导出功能需要根据实际需求实现
3. **权限验证**: 所有接口都应该添加权限验证中间件
4. **数据安全**: 敏感配置项应该加密存储
5. **实时更新**: 监控仪表板可以考虑使用 WebSocket 实现实时数据推送

---

## 后续优化建议

1. 添加消息推送功能（WebSocket/SSE）
2. 集成真实的系统监控工具（如 Prometheus）
3. 实现日志聚合和分析功能
4. 添加告警规则配置
5. 实现配置项的版本控制
6. 添加操作审计功能
7. 实现更细粒度的权限控制
8. 添加数据备份和恢复功能

---

## 联系方式

如有问题或建议，请联系开发团队。
