# 企业系统管理功能文档

## 功能概述

企业系统管理模块提供了完整的企业配置、用户权限管理和操作日志查看功能，帮助企业管理员更好地管理系统和用户。

## 功能模块

### 1. 系统配置管理

#### 功能描述
提供企业级系统参数配置功能，支持自定义各种系统行为和规则。

#### 配置项说明

**基础配置**
- 企业名称：显示企业名称（只读）
- 系统语言：支持简体中文、英文
- 时区设置：支持多个时区选择

**运单配置**
- 运单号前缀：自定义运单编号前缀（最多10个字符）
- 自动审核：开启后运单将自动通过审核
- 运单保留天数：设置运单数据保留时长（30-3650天）

**消息配置**
- 消息推送：是否启用消息推送功能
- 邮件通知：是否启用邮件通知
- 通知邮箱：接收通知的邮箱地址

**API配置**
- API调用限制：每小时API调用次数限制（100-10000次）
- IP白名单：限制API访问的IP地址列表

**安全配置**
- 密码强度要求：低/中/高三个级别
- 会话超时时间：用户会话超时时长（30-1440分钟）
- 登录失败锁定：是否启用登录失败锁定
- 失败次数限制：登录失败多少次后锁定账户（3-10次）

#### 前端页面
- 路径：[`/company/:id/config`](frontend/src/views/company/SystemConfig.vue)
- 组件：[`SystemConfig.vue`](frontend/src/views/company/SystemConfig.vue)

#### 后端接口

**获取系统配置**
```
GET /api/companies/{id}/config
```

响应示例：
```json
{
  "success": true,
  "data": {
    "companyName": "示例企业",
    "language": "zh-CN",
    "timezone": "Asia/Shanghai",
    "waybillPrefix": "WB",
    "autoAudit": false,
    "waybillRetentionDays": 365,
    "messagePushEnabled": true,
    "emailNotificationEnabled": false,
    "notificationEmail": "admin@example.com",
    "apiRateLimit": 1000,
    "ipWhitelist": "",
    "passwordStrength": "medium",
    "sessionTimeout": 120,
    "loginLockEnabled": true,
    "maxLoginAttempts": 5
  }
}
```

**更新系统配置**
```
PUT /api/companies/{id}/config
```

请求体：
```json
{
  "language": "zh-CN",
  "timezone": "Asia/Shanghai",
  "waybillPrefix": "WB",
  "autoAudit": false,
  "waybillRetentionDays": 365,
  "messagePushEnabled": true,
  "emailNotificationEnabled": true,
  "notificationEmail": "admin@example.com",
  "apiRateLimit": 1000,
  "ipWhitelist": "192.168.1.1\n192.168.1.2",
  "passwordStrength": "high",
  "sessionTimeout": 120,
  "loginLockEnabled": true,
  "maxLoginAttempts": 5
}
```

### 2. 用户权限管理

#### 功能描述
管理企业内部用户账户及其权限配置，支持用户的增删改查和权限分配。

#### 用户角色
- **管理员（admin）**：拥有所有权限
- **操作员（operator）**：拥有日常操作权限
- **查看者（viewer）**：仅拥有查看权限

#### 权限列表
- `waybill.view`：查看运单
- `waybill.create`：创建运单
- `waybill.edit`：编辑运单
- `waybill.delete`：删除运单
- `message.view`：查看消息
- `message.send`：发送消息
- `statistics.view`：查看统计
- `api.manage`：管理API
- `user.manage`：管理用户
- `config.manage`：管理配置

#### 功能特性
- 用户搜索和筛选（按用户名、角色、状态）
- 添加新用户
- 编辑用户信息和权限
- 启用/禁用用户
- 重置用户密码
- 删除用户

#### 前端页面
- 路径：[`/company/:id/users`](frontend/src/views/company/UserPermissions.vue)
- 组件：[`UserPermissions.vue`](frontend/src/views/company/UserPermissions.vue)

#### 后端接口

**获取企业用户列表**
```
GET /api/companies/{id}/users?page=1&pageSize=10&username=&role=&status=
```

响应示例：
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "admin_1",
        "realName": "张三",
        "email": "zhangsan@example.com",
        "phone": "13800138000",
        "role": "admin",
        "permissions": ["waybill.view", "waybill.create", "user.manage"],
        "status": "active",
        "lastLoginAt": "2026-02-05T10:30:00.000Z",
        "createdAt": "2026-01-01T00:00:00.000Z"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 10
  }
}
```

**创建企业用户**
```
POST /api/companies/{id}/users
```

请求体：
```json
{
  "username": "user001",
  "realName": "李四",
  "email": "lisi@example.com",
  "phone": "13900139000",
  "password": "password123",
  "role": "operator",
  "permissions": ["waybill.view", "waybill.create"],
  "status": "active"
}
```

**更新企业用户**
```
PUT /api/companies/{id}/users/{userId}
```

**删除企业用户**
```
DELETE /api/companies/{id}/users/{userId}
```

### 3. 系统日志查看

#### 功能描述
查看和导出企业系统操作日志，支持多维度筛选和查询。

#### 日志类型
- **登录（login）**：用户登录系统
- **登出（logout）**：用户登出系统
- **创建（create）**：创建数据
- **更新（update）**：更新数据
- **删除（delete）**：删除数据
- **查看（view）**：查看数据
- **导出（export）**：导出数据

#### 日志模块
- **运单管理（waybill）**
- **消息中心（message）**
- **统计分析（statistics）**
- **API管理（api）**
- **用户管理（user）**
- **系统配置（config）**

#### 功能特性
- 多条件筛选（操作类型、模块、操作人、IP地址、时间范围）
- 日志详情查看
- 日志导出（CSV格式）
- 分页显示

#### 前端页面
- 路径：[`/company/:id/logs`](frontend/src/views/company/SystemLogs.vue)
- 组件：[`SystemLogs.vue`](frontend/src/views/company/SystemLogs.vue)

#### 后端接口

**获取企业日志**
```
GET /api/companies/{id}/logs?page=1&pageSize=20&action=&module=&username=&ip=&startTime=&endTime=
```

响应示例：
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": 1,
        "action": "login",
        "module": "user",
        "description": "用户登录系统",
        "userId": 1,
        "username": "admin_1",
        "ip": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "status": "success",
        "requestData": null,
        "responseData": null,
        "error": null,
        "createdAt": "2026-02-05T10:30:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

**导出企业日志**
```
GET /api/companies/{id}/logs/export?action=&module=&username=&ip=&startTime=&endTime=
```

返回CSV文件下载。

## 数据库表结构

### company_configs - 企业系统配置表
```sql
CREATE TABLE company_configs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  config JSON NOT NULL COMMENT '系统配置JSON数据',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE KEY uk_company_id (company_id)
);
```

### company_users - 企业用户表
```sql
CREATE TABLE company_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  username VARCHAR(50) NOT NULL,
  real_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'operator',
  permissions JSON,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  last_login_at DATETIME,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  UNIQUE KEY uk_company_username (company_id, username)
);
```

### company_logs - 企业操作日志表
```sql
CREATE TABLE company_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_id INT NOT NULL,
  user_id INT,
  username VARCHAR(50),
  action VARCHAR(50) NOT NULL,
  module VARCHAR(50) NOT NULL,
  description VARCHAR(500) NOT NULL,
  ip VARCHAR(50),
  user_agent VARCHAR(500),
  request_data JSON,
  response_data JSON,
  status VARCHAR(20) NOT NULL DEFAULT 'success',
  error TEXT,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
```

## 文件结构

### 前端文件
```
frontend/src/
├── views/company/
│   ├── SystemConfig.vue        # 系统配置页面
│   ├── UserPermissions.vue     # 用户权限管理页面
│   └── SystemLogs.vue          # 系统日志页面
├── api/
│   └── company.js              # 企业相关API（已添加新接口）
└── router/
    └── index.js                # 路由配置（已添加新路由）
```

### 后端文件
```
backend/src/
├── controllers/
│   └── companyController.js    # 企业控制器（已添加新方法）
├── models/
│   └── Company.js              # 企业模型（已添加新方法）
├── routes/
│   └── companies.js            # 企业路由（已添加新路由）
└── database/
    └── company_management.sql  # 数据库表结构
```

## 使用说明

### 1. 数据库初始化
执行SQL文件创建必要的数据库表：
```bash
mysql -u username -p database_name < backend/database/company_management.sql
```

### 2. 访问页面
- 系统配置：`/company/{企业ID}/config`
- 用户权限管理：`/company/{企业ID}/users`
- 系统日志：`/company/{企业ID}/logs`

### 3. 权限控制
建议在实际应用中添加权限验证中间件，确保只有具有相应权限的用户才能访问这些功能。

## 安全建议

1. **密码加密**：在实际应用中，应使用bcrypt等加密算法对用户密码进行加密存储
2. **权限验证**：添加中间件验证用户权限，防止越权访问
3. **日志记录**：所有敏感操作都应记录到日志表中
4. **输入验证**：对所有用户输入进行严格验证，防止SQL注入等攻击
5. **会话管理**：实现会话超时和自动登出功能
6. **IP白名单**：对敏感操作启用IP白名单限制

## 后续优化建议

1. 添加用户登录认证和会话管理
2. 实现密码加密和安全存储
3. 添加操作日志自动记录中间件
4. 实现更细粒度的权限控制
5. 添加用户操作审计功能
6. 支持批量用户导入导出
7. 添加用户活动统计和分析
8. 实现配置变更历史记录
