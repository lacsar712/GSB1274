# Docker 启动指南

## 项目概述

本项目已配置Docker容器化部署，包含以下服务：
- **MySQL 8.0** - 数据库服务（端口3306）
- **Backend** - Node.js后端服务（端口3000）
- **Frontend** - Vue.js前端服务（端口5173）

## 快速启动

### 1. 启动所有服务

```bash
docker-compose up -d
```

### 2. 查看服务状态

```bash
docker-compose ps
```

### 3. 查看服务日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### 4. 停止服务

```bash
docker-compose down
```

### 5. 停止服务并删除数据卷

```bash
docker-compose down -v
```

## 服务访问

- **前端应用**: http://localhost:5173
- **后端API**: http://localhost:3000/api
- **MySQL数据库**: localhost:3306

## 数据库配置

### 默认配置
- **数据库名**: smart_logistics
- **Root密码**: root123456
- **用户名**: logistics_user
- **用户密码**: logistics_pass

### 数据库初始化

数据库会在首次启动时自动初始化，执行以下SQL文件：
- `database/init.sql` - 创建数据库
- `database/*.sql` - 业务表结构
- `backend/database/*.sql` - 后端相关表结构

## 重新构建镜像

如果修改了代码，需要重新构建镜像：

```bash
# 重新构建所有服务
docker-compose up -d --build

# 重新构建特定服务
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

## 故障排查

### 后端服务无法启动

1. 检查日志：
```bash
docker logs smart-logistics-backend --tail 50
```

2. 确保所有依赖已安装：
```bash
docker-compose exec backend npm install
```

3. 检查数据库连接：
```bash
docker-compose exec backend ping mysql
```

### 前端服务无法访问

1. 检查日志：
```bash
docker logs smart-logistics-frontend --tail 50
```

2. 确保端口5173未被占用

### MySQL服务无法启动

1. 检查日志：
```bash
docker logs smart-logistics-mysql --tail 50
```

2. 删除数据卷重新初始化：
```bash
docker-compose down -v
docker-compose up -d
```

## 环境变量

### 后端环境变量（在docker-compose.yml中配置）

- `PORT`: 服务端口（默认3000）
- `NODE_ENV`: 运行环境（production/development）
- `DB_HOST`: 数据库主机（mysql）
- `DB_PORT`: 数据库端口（3306）
- `DB_USER`: 数据库用户
- `DB_PASSWORD`: 数据库密码
- `DB_NAME`: 数据库名称
- `JWT_SECRET`: JWT密钥
- `JWT_EXPIRES_IN`: JWT过期时间

### 前端环境变量

- `VITE_API_BASE_URL`: 后端API地址

## 开发模式

如果需要在开发模式下运行（支持热重载）：

### 后端开发模式
```bash
cd backend
npm install
npm run dev
```

### 前端开发模式
```bash
cd frontend
npm install
npm run dev
```

## 生产部署建议

1. 修改默认密码（在docker-compose.yml中）
2. 使用环境变量文件管理敏感信息
3. 配置反向代理（如Nginx）
4. 启用HTTPS
5. 配置日志收集
6. 设置自动备份

## 注意事项

1. 首次启动可能需要较长时间，因为需要下载镜像和初始化数据库
2. 确保Docker和Docker Compose已正确安装
3. 确保端口3000、3306、5173未被占用
4. 建议至少分配2GB内存给Docker

## 技术栈

- **前端**: Vue 3 + Element Plus + Vite
- **后端**: Node.js + Express + Sequelize + Mongoose
- **数据库**: MySQL 8.0
- **容器**: Docker + Docker Compose
