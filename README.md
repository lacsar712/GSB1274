# 智运服务系统（Smart Logistics Service）

## 🛠 技术栈
- Frontend: Vue 3 + Vite + Element Plus + Axios + ECharts
- Backend: Node.js (Express) + MySQL2 + Sequelize（部分自愈）+ Mongoose
- DB: MySQL 8 + MongoDB 6

## 🚀 快速启动（Docker）
1. 安装并启动 Docker Desktop。
2. 在项目根目录执行：
   - `docker compose up --build`
3. 访问前端（Docker）：  
   - http://localhost:3274
4. 后端 API 基址：  
   - http://localhost:8274/api  
   - 健康检查：http://localhost:8274/api/health
5. 默认容器与端口：
   - MySQL: 3306（容器 smart-logistics-mysql，库 smart_logistics，用户/密码 logistics_user/logistics_pass）
   - MongoDB: 27017（容器 smart-logistics-mongo）
   - Backend: 8274（转发到容器端口 3000）
   - Frontend: 3274（Nginx 静态服务）

## 💻 快速启动（本地开发）
推荐：数据库用 Docker，前后端本地运行。

- 准备数据库（在根目录）：
  - `docker compose up -d mysql mongo`  
  - 首次启动会自动执行 ./database 与 ./backend/database 下的初始化脚本
- 启动后端（在 backend 目录）：
  - `npm install`
  - 设定环境变量（macOS/Linux 示例）：
    - `export PORT=8274`
    - `export DB_HOST=localhost`
    - `export DB_PORT=3306`
    - `export DB_USER=logistics_user`
    - `export DB_PASSWORD=logistics_pass`
    - `export DB_NAME=smart_logistics`
    - `export MONGO_URI=mongodb://localhost:27017/smart_logistics`
    - 可选：`export JWT_SECRET=dev-secret`、`export JWT_EXPIRES_IN=7d`
  - 启动开发服务：`npm run dev`  
  - 后端地址：http://localhost:8274/api
- 启动前端（在 frontend 目录）：
  - `npm install`
  - 开发服务：`npm run dev`
  - 前端地址：http://localhost:3274  
  - 开发模式下，Vite 已代理 `/api` 到 `http://localhost:8274`（无需额外配置）

## 🧪 测试账号
- 管理员：  
  - 用户名：admin  
  - 密码：任意（开发态为本地登录模拟）  
  - 说明：输入 admin 登录将授予管理员角色，系统菜单与路由放行

## 🔑 登录与权限
- 登录采用本地令牌模拟（localStorage 写入 token），前端路由守卫：
  - 公共路由：`/`、`/login`、`/401`、`/403` 放行
  - 非公共路由需本地 token；基于路径前缀匹配角色（company/operator/regulator），不匹配跳转 `/403`
  - 登录用户名为 admin 时，授予管理员角色，系统全量放行
  - 企业用户登录后，若能获取到企业用户信息，会加载其细分角色与权限

## 📚 核心功能
- 企业接入与审核
  - 企业注册、待审核列表、详情、更新、资质上传/删除、审核通过/驳回
  - 后端路由：`/api/companies` 系列
- 企业系统管理
  - 系统配置页：基础/运单/消息/API/安全配置
  - 接口：`GET/PUT /api/companies/:id/config`
  - 兜底：当 MySQL 的 `company_configs` 缺表时，返回 `success: true` 与空数据；更新时返回“已跳过持久化”
- 管理员账号分配（企业用户中心）
  - 列表、搜索、添加、编辑、启用/禁用、删除、本地缓存兜底
  - 接口：`/api/companies/:id/users`（GET/POST/PUT/DELETE）
  - 新增后即时合并到本地缓存并回显，即使服务端暂不可用也能看到新增项
- 运单管理与迁移
  - 企业运单列表、详情、创建/更新、轨迹记录
  - 迁移入口：`POST /api/waybills/migrate`（将 MySQL 运单导入 MongoDB），统计与分析基于 Mongo
- 统计与大屏
  - 企业统计：`/api/companies/:id/statistics/overview`、`/api/companies/:id/statistics/revenue`  
    - 企业需 `status=approved` 才返回非零统计；Mongo 不可用时统一返回零值结构
  - 监管大屏：`/api/regulation/dashboard`  
    - 返回字段包含 `realtime`、`trend`、`risk_distribution`、`inspection_result`、`top_companies`、`recent_inspections`、`alerts`
- 指标库与风险库
  - 指标库：`/api/indicators` 系列（分类、批量删除等）
  - 风险库：`/api/risks` 系列（统计、分类、分页与关键字）
- 消息中心
  - 企业消息：`/api/companies/:id/messages`（列表、详情、标记已读、删除、统计与设置）
  - 启动时若无消息，为前 3 个企业注入示例系统/审核/运单消息
- API 管理
  - API Keys：`/api/companies/:id/api-keys`（创建、列表、状态更新、删除）
  - 前端提供 API 文档与对接测试页面

## 🔗 重要约定与兜底
- 前端响应归一化：所有接口返回对象包含 `code` 与 `success` 字段，保留原始 `data`
  - `success=true` 则 `code=200`，否则默认 `500`（兼容后端 `success/code` 混用）
- 缺表兜底：
  - `company_configs` 缺表时：系统配置读取返回空数据；更新返回“已跳过持久化”；前端读取失败时走本地缓存
- MySQL 兼容：
  - 某些版本不支持 `LIMIT ?` 参数占位；已改为字面量拼接 `LIMIT/OFFSET`
  - PostgreSQL 的 `DISTINCT ON` 不可用于 MySQL，取最新记录采用子查询 JOIN + `MAX(event_time)`
- 路由匹配：
  - Express 路由需将静态路径放在参数路径前，避免误匹配

## 🧭 常用入口（前端）
- 登录页：`/login`
- 企业中心：
  - 企业接入：`/company/register`
  - 企业信息维护：`/company/1/edit`
  - 企业统计：`/statistics/overview`
  - 企业运单：`/waybill/list`
  - 企业配置（列表/详情）：`/company-configs`
  - 企业消息中心：`/companies/1/messages`
  - 企业系统管理（系统配置页）：`/company/1/config`
  - 企业用户中心（管理员账号分配）：`/company/1/users`
- 运维中心与监管大屏等页面均在 `views/operations` 与 `views/regulation` 目录下

## ⚙️ 构建与部署
- 开发模式：
  - Frontend：`npm run dev`（端口 3274，代理 `/api`）
  - Backend：`npm run dev`（建议 `PORT=8274` 保持与前端代理一致）
- 生产（Docker）：
  - `docker compose up --build` 即可同时启动数据库、后端与前端
  - 如需自定义前端 API 基址，可在构建阶段设置 `VITE_API_BASE`，否则默认 `http://localhost:8274/api`

## ❓常见问题
- 已添加用户但列表不显示？
  - 前端已实现“新增后本地合并并回显”，即使服务端暂不可用也能看到新增项；刷新列表会优先使用本地缓存兜底
- 系统配置页提示“获取系统配置失败”？
  - 已增加后端与前端兜底：缺表时后端返回空数据，前端自动读取本地缓存并继续展示
- 登录后仍显示未登录？
  - 确认浏览器 localStorage 中存在 `token` 与 `role`；管理员请使用用户名 `admin` 登录

## 📦 目录结构（简要）
- frontend：Vue 3 + Vite 前端工程（端口 3274，代理 `/api`）
- backend：Express 后端工程（默认容器端口 3000，宿主 8274）
- database：通用初始化脚本；`backend/database` 为后端附加初始化
- docker-compose.yml：一键启动 MySQL、MongoDB、后端与前端

## 📄 许可证
本项目用于学习与演示，企业级生产环境请根据实际需求调整配置与安全策略。
