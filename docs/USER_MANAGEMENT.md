# 企业用户个人管理功能文档

## 功能概述

企业用户个人管理模块提供了完整的用户个人信息管理、密码修改和偏好设置功能，让用户能够自主管理自己的账户和使用习惯。

## 功能模块

### 1. 个人信息管理

#### 功能描述
用户可以查看和编辑自己的个人信息，包括基本信息、账户信息和权限信息。

#### 功能特性
- 查看用户名（不可修改）
- 编辑真实姓名、邮箱、手机号
- 查看角色和账户状态
- 查看最后登录时间和注册时间
- 查看个人权限列表
- 快捷跳转到密码修改和偏好设置

#### 前端页面
- 路径：[`/user/:id/profile`](frontend/src/views/user/Profile.vue:1)
- 组件：[`Profile.vue`](frontend/src/views/user/Profile.vue:1)

#### 后端接口

**获取用户信息**
```
GET /api/users/{id}
```

响应示例：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "companyId": 1,
    "username": "admin_1",
    "realName": "张三",
    "email": "zhangsan@example.com",
    "phone": "13800138000",
    "role": "admin",
    "permissions": ["waybill.view", "waybill.create", "user.manage"],
    "status": "active",
    "lastLoginAt": "2026-02-05T10:30:00.000Z",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-02-05T10:30:00.000Z"
  }
}
```

**更新用户信息**
```
PUT /api/users/{id}
```

请求体：
```json
{
  "realName": "张三",
  "email": "zhangsan@example.com",
  "phone": "13800138000"
}
```

### 2. 密码修改

#### 功能描述
用户可以修改自己的登录密码，系统会验证当前密码并检查新密码强度。

#### 功能特性
- 验证当前密码
- 实时显示密码强度（弱/中/强）
- 密码强度指示器
- 确认新密码输入
- 密码要求提示
- 安全提示信息

#### 密码要求
- 长度至少8个字符
- 包含大写字母、小写字母
- 包含数字
- 建议包含特殊字符

#### 密码强度评估
- **弱**：长度不足或字符类型单一
- **中**：满足基本要求
- **强**：长度充足且包含多种字符类型

#### 前端页面
- 路径：[`/user/:id/password`](frontend/src/views/user/ChangePassword.vue:1)
- 组件：[`ChangePassword.vue`](frontend/src/views/user/ChangePassword.vue:1)

#### 后端接口

**修改密码**
```
PUT /api/users/{id}/password
```

请求体：
```json
{
  "oldPassword": "current_password",
  "newPassword": "new_password"
}
```

响应示例：
```json
{
  "success": true,
  "message": "密码修改成功"
}
```

### 3. 偏好设置

#### 功能描述
用户可以自定义界面和使用习惯，包括主题、语言、通知、显示等多个方面的设置。

#### 设置项说明

**界面设置**
- 主题模式：浅色/深色/跟随系统
- 语言：简体中文/English
- 时区：多个时区选择
- 日期格式：YYYY-MM-DD / DD/MM/YYYY / MM/DD/YYYY
- 时间格式：24小时制/12小时制

**通知设置**
- 桌面通知：开启/关闭
- 声音提示：开启/关闭
- 邮件通知：开启/关闭
- 通知类型：运单更新/新消息/系统通知/审核通知

**显示设置**
- 每页显示条数：10/20/50/100
- 表格密度：默认/中等/紧凑
- 侧边栏折叠：折叠/展开

**快捷键设置**
- 启用快捷键：开启/关闭
- 预设快捷键列表：
  - 搜索：Ctrl + K
  - 新建运单：Ctrl + N
  - 保存：Ctrl + S
  - 刷新：Ctrl + R

#### 前端页面
- 路径：[`/user/:id/preferences`](frontend/src/views/user/Preferences.vue:1)
- 组件：[`Preferences.vue`](frontend/src/views/user/Preferences.vue:1)

#### 后端接口

**获取用户偏好设置**
```
GET /api/users/{id}/preferences
```

响应示例：
```json
{
  "success": true,
  "data": {
    "theme": "light",
    "language": "zh-CN",
    "timezone": "Asia/Shanghai",
    "dateFormat": "YYYY-MM-DD",
    "timeFormat": "24",
    "desktopNotification": true,
    "soundNotification": true,
    "emailNotification": false,
    "notificationTypes": ["waybill", "message", "system"],
    "pageSize": 20,
    "tableDensity": "default",
    "sidebarCollapsed": false,
    "enableShortcuts": true
  }
}
```

**更新用户偏好设置**
```
PUT /api/users/{id}/preferences
```

请求体：
```json
{
  "theme": "dark",
  "language": "zh-CN",
  "timezone": "Asia/Shanghai",
  "dateFormat": "YYYY-MM-DD",
  "timeFormat": "24",
  "desktopNotification": true,
  "soundNotification": true,
  "emailNotification": true,
  "notificationTypes": ["waybill", "message", "system", "audit"],
  "pageSize": 50,
  "tableDensity": "small",
  "sidebarCollapsed": true,
  "enableShortcuts": true
}
```

## 数据库表结构

### user_preferences - 用户偏好设置表
```sql
CREATE TABLE user_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  preferences JSON NOT NULL COMMENT '用户偏好设置JSON数据',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES company_users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_id (user_id)
);
```

## 文件结构

### 前端文件
```
frontend/src/
├── views/user/
│   ├── Profile.vue           # 个人信息页面
│   ├── ChangePassword.vue    # 密码修改页面
│   └── Preferences.vue       # 偏好设置页面
├── api/
│   └── user.js               # 用户相关API
└── router/
    └── index.js              # 路由配置（已添加用户路由）
```

### 后端文件
```
backend/src/
├── controllers/
│   └── userController.js     # 用户控制器
├── models/
│   └── User.js               # 用户模型
├── routes/
│   └── users.js              # 用户路由
├── app.js                    # 应用入口（已注册用户路由）
└── database/
    └── user_preferences.sql  # 用户偏好设置表结构
```

## 使用说明

### 1. 数据库初始化
执行SQL文件创建用户偏好设置表：
```bash
mysql -u username -p database_name < backend/database/user_preferences.sql
```

### 2. 访问页面
- 个人信息：`/user/{用户ID}/profile`
- 修改密码：`/user/{用户ID}/password`
- 偏好设置：`/user/{用户ID}/preferences`

### 3. 权限控制
建议添加中间件验证用户只能访问和修改自己的信息。

## 安全建议

1. **密码加密**：使用bcrypt等加密算法对密码进行加密存储
2. **身份验证**：确保用户只能访问和修改自己的信息
3. **密码强度**：强制要求用户使用强密码
4. **会话管理**：密码修改后强制重新登录
5. **操作日志**：记录所有敏感操作到日志表
6. **输入验证**：对所有用户输入进行严格验证

## 前端特性

### 个人信息页面
- 编辑模式切换
- 表单验证
- 数据回显
- 快捷操作按钮

### 密码修改页面
- 实时密码强度检测
- 密码强度可视化指示器
- 密码要求提示
- 安全建议展示

### 偏好设置页面
- 分类设置展示
- 实时预览效果
- 恢复默认设置
- 设置持久化存储

## 后续优化建议

1. 添加头像上传功能
2. 实现双因素认证（2FA）
3. 添加登录设备管理
4. 实现账户活动历史记录
5. 支持第三方账号绑定
6. 添加数据导出功能
7. 实现账户注销功能
8. 支持多语言切换
9. 添加主题自定义功能
10. 实现偏好设置云同步

## API接口汇总

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取用户信息 | GET | /api/users/{id} | 获取用户详细信息 |
| 更新用户信息 | PUT | /api/users/{id} | 更新用户基本信息 |
| 修改密码 | PUT | /api/users/{id}/password | 修改用户密码 |
| 获取偏好设置 | GET | /api/users/{id}/preferences | 获取用户偏好设置 |
| 更新偏好设置 | PUT | /api/users/{id}/preferences | 更新用户偏好设置 |

## 注意事项

1. 用户名不可修改，这是系统的唯一标识
2. 密码修改后建议强制用户重新登录
3. 偏好设置会影响用户的使用体验，应提供合理的默认值
4. 所有敏感操作都应记录到操作日志
5. 实际应用中必须实现密码加密和身份验证
