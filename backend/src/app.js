import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import companyRoutes from './routes/companies.js';
import companyConfigRoutes from './routes/companyConfigs.js';
import apiRoutes from './routes/api.js';
import waybillRoutes from './routes/waybills.js';
import statisticsRoutes from './routes/statistics.js';
import messageRoutes from './routes/messages.js';
import userRoutes from './routes/users.js';
import carrierRoutes from './routes/carriers.js';
import vehicleRoutes from './routes/vehicles.js';
import driverRoutes from './routes/drivers.js';
import tagRoutes from './routes/tags.js';
import indicatorRoutes from './routes/indicators.js';
import riskRoutes from './routes/risks.js';
import graphRoutes from './routes/graph.js';
import dictionaryRoutes from './routes/dictionaries.js';
import operationsRoutes from './routes/operations.js';
import regulationBusinessRoutes from './routes/regulationBusinesses.js';
import regulationInspectionRoutes from './routes/regulationInspections.js';
import regulationWaybillRoutes from './routes/regulationWaybills.js';
import regulationStatisticsRoutes from './routes/regulationStatistics.js';
import regulationDashboardRoutes from './routes/regulationDashboard.js';
import regulationMessagesRoutes from './routes/regulationMessages.js';
import regulationSystemRoutes from './routes/regulationSystem.js';
import deliveryRoutes from './routes/deliveries.js';
import vehicleSafetyRoutes from './routes/vehicleSafety.js';
import logger from './config/logger.js';
import { fixMojibake, formatDateTime } from './utils/encoding.js';
import mongoose from 'mongoose';
import pool from './config/database.js';
import Waybill from './models/Waybill.js';
import { readFile } from 'fs/promises';
import sequelize from './config/sequelize.js';
import Tag from './models/Tag.js';
import Indicator from './models/Indicator.js';
import Driver from './models/Driver.js';
import Risk from './models/Risk.js';
import GraphNode from './models/GraphNode.js';
import GraphEdge from './models/GraphEdge.js';
import Message from './models/Message.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

initMysqlCompanies();
initMysqlCompanyConfigs();
initMysqlDictionaries();
initMysqlVehicleSafety();
initSequelizeAndTables();
initMongoAndSeed();

async function initMongoAndSeed() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_logistics';
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    let connected = false;
    for (let i = 0; i < 8 && !connected; i++) {
      try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
        connected = true;
      } catch (_) {
        await sleep(1000);
      }
    }
    if (!connected) throw new Error('Mongo连接失败');
    const count = await Waybill.countDocuments({});
    if (count === 0) {
      const [rows] = await pool.query(
        'SELECT id, waybill_number, company_id, status, created_at FROM waybills ORDER BY id DESC LIMIT 200'
      );
      const statusMap = (s) => {
        switch (String(s).toLowerCase()) {
          case 'created': return '待发货';
          case 'in_transit':
          case 'delivering': return '运输中';
          case 'arrived': return '已到达';
          case 'delivered':
          case 'completed': return '已签收';
          case 'abnormal': return '异常';
          case 'cancelled': return '已取消';
          default: return '待发货';
        }
      };
      const docs = rows.map(r => ({
        waybillNo: r.waybill_number || `WB${String(r.id).padStart(6, '0')}`,
        companyId: String(r.company_id || ''),
        status: statusMap(r.status),
        fee: { total: 0, paid: false },
        createdAt: r.created_at ? new Date(r.created_at) : new Date(),
        updatedAt: r.created_at ? new Date(r.created_at) : new Date(),
      }));
      if (docs.length > 0) {
        await Waybill.collection.insertMany(docs, { ordered: false });
      }
    }
    const msgCount = await Message.countDocuments({});
    if (msgCount === 0) {
      const [companies] = await pool.query(
        'SELECT id, CONVERT(CAST(name AS BINARY) USING utf8mb4) AS name, status FROM companies ORDER BY id ASC LIMIT 3'
      );
      const now = Date.now();
      const msgs = [];
      for (const c of companies) {
        const cid = String(c.id);
        msgs.push({
          companyId: cid,
          type: 'system',
          title: `欢迎使用企业消息中心`,
          content: `企业「${c.name || cid}」已接入系统，欢迎使用。`,
          priority: 'normal',
          isRead: false,
          createdAt: new Date(now - 2 * 60 * 60 * 1000),
          updatedAt: new Date(now - 2 * 60 * 60 * 1000)
        });
        msgs.push({
          companyId: cid,
          type: 'audit',
          title: c.status === 'approved' ? '企业审核通过' : '企业审核待处理',
          content: c.status === 'approved' ? '企业资料审核通过，相关功能已开放。' : '企业资料待审核，请耐心等待。',
          priority: c.status === 'approved' ? 'normal' : 'high',
          isRead: false,
          relatedType: 'company',
          createdAt: new Date(now - 60 * 60 * 1000),
          updatedAt: new Date(now - 60 * 60 * 1000)
        });
        msgs.push({
          companyId: cid,
          type: 'waybill',
          title: '运单状态更新',
          content: '有新的运单状态变更，请及时关注。',
          priority: 'normal',
          isRead: false,
          relatedType: 'waybill',
          createdAt: new Date(now - 30 * 60 * 1000),
          updatedAt: new Date(now - 30 * 60 * 1000)
        });
      }
      if (msgs.length > 0) {
        await Message.collection.insertMany(msgs, { ordered: false });
      }
    }
  } catch (err) {
    // 忽略失败，保持接口兜底行为
  }
}

async function initMysqlFromSql(tableName, sqlFileName) {
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
      [process.env.DB_NAME || 'smart_logistics', tableName]
    );
    if (rows?.[0]?.cnt > 0) return;
    const sql = await readFile(new URL(`../database/${sqlFileName}`, import.meta.url), { encoding: 'utf-8' });
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    for (const stmt of statements) {
      await pool.query(stmt);
    }
    logger.info('数据库表初始化完成', { table: tableName });
  } catch (err) {
    logger.error('数据库表初始化失败', { table: tableName, error: err.message });
  }
}

async function initMysqlCompanies() {
  await initMysqlFromSql('companies', 'companies.sql');
}

async function initMysqlCompanyConfigs() {
  await initMysqlFromSql('company_configs', 'company_configs.sql');
}

async function initMysqlDictionaries() {
  await initMysqlFromSql('dictionaries', 'dictionaries.sql');
}

async function initMysqlVehicleSafety() {
  await initMysqlFromSql('vehicle_safety', 'vehicle_safety.sql');
}

async function ensureColumns(table, columns) {
  try {
    const db = process.env.DB_NAME || 'smart_logistics';
    const [rows] = await pool.query(
      'SELECT COLUMN_NAME FROM information_schema.columns WHERE table_schema = ? AND table_name = ?',
      [db, table]
    );
    const existing = new Set(rows.map(r => r.COLUMN_NAME));
    const addStmts = [];
    for (const [name, def] of Object.entries(columns)) {
      if (!existing.has(name)) addStmts.push(`ADD COLUMN ${name} ${def}`);
    }
    if (addStmts.length > 0) {
      await pool.query(`ALTER TABLE ${table} ${addStmts.join(', ')}`);
    }
  } catch (_) {
  }
}

async function initSequelizeAndTables() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    await ensureColumns('carriers', {
      contact_person: 'VARCHAR(100) NULL',
      contact_phone: 'VARCHAR(20) NULL',
      contact_email: 'VARCHAR(100) NULL',
      address: 'VARCHAR(255) NULL',
      business_license: 'VARCHAR(100) NULL',
      transport_license: 'VARCHAR(100) NULL',
      vehicle_count: 'INT NOT NULL DEFAULT 0',
      driver_count: 'INT NOT NULL DEFAULT 0',
      service_area: 'VARCHAR(255) NULL',
      description: 'TEXT NULL',
      status: "ENUM('active','inactive') NOT NULL DEFAULT 'active'",
      created_at: 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    });
    await ensureColumns('vehicles', {
      carrier_id: 'INT NULL',
      brand: 'VARCHAR(100) NULL',
      model: 'VARCHAR(100) NULL',
      color: 'VARCHAR(50) NULL',
      year: 'INT NULL',
      load_capacity: 'DECIMAL(10,2) NULL',
      volume_capacity: 'DECIMAL(10,2) NULL',
      driver_name: 'VARCHAR(100) NULL',
      driver_phone: 'VARCHAR(20) NULL',
      driver_license: 'VARCHAR(50) NULL',
      registration_date: 'DATE NULL',
      insurance_expiry: 'DATE NULL',
      inspection_expiry: 'DATE NULL',
      gps_device_id: 'VARCHAR(100) NULL',
      current_location: 'VARCHAR(255) NULL',
      latitude: 'DECIMAL(10,6) NULL',
      longitude: 'DECIMAL(10,6) NULL',
      description: 'TEXT NULL',
      status: "ENUM('available','in_service','maintenance','inactive') NOT NULL DEFAULT 'available'",
      created_at: 'DATETIME NULL DEFAULT CURRENT_TIMESTAMP',
      updated_at: 'DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
    });
    // Graph 数据种子
    const nodeCount = await GraphNode.count();
    if (nodeCount === 0) {
      const nodes = [
        { nodeId: 'N-COMP-1', label: '企业A', type: 'company', properties: { region: '华东' } },
        { nodeId: 'N-WB-1001', label: '运单1001', type: 'waybill', properties: { status: '运输中' } },
        { nodeId: 'N-CARRIER-9', label: '承运人九号', type: 'carrier', properties: { level: 'A级' } },
      ];
      for (const n of nodes) {
        await GraphNode.create(n);
      }
    }
    const edgeCount = await GraphEdge.count();
    if (edgeCount === 0) {
      const edges = [
        { edgeId: 'E-1', sourceNodeId: 'N-COMP-1', targetNodeId: 'N-WB-1001', label: '拥有运单', weight: 1.0, properties: { createdBy: 'system' } },
        { edgeId: 'E-2', sourceNodeId: 'N-WB-1001', targetNodeId: 'N-CARRIER-9', label: '由承运', weight: 1.5, properties: { priority: 'high' } },
      ];
      for (const e of edges) {
        await GraphEdge.create(e);
      }
    }
  } catch (_) {
  }
}

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});
app.use((req, res, next) => {
  const origJson = res.json.bind(res);
  const deepNormalize = (val) => {
    if (typeof val === 'string') return fixMojibake(val);
    if (Array.isArray(val)) return val.map(deepNormalize);
    if (val && typeof val === 'object') {
      if (val instanceof Date) return formatDateTime(val);
      const out = {};
      for (const [k, v] of Object.entries(val)) {
        out[k] = deepNormalize(v);
      }
      return out;
    }
    return val;
  };
  res.json = (body) => {
    try {
      return origJson(deepNormalize(body));
    } catch (_) {
      return origJson(body);
    }
  };
  next();
});

// 静态文件服务（用于访问上传的文件）
app.use('/uploads', express.static('uploads'));

// 路由
app.use('/api/companies', companyRoutes);
app.use('/api/company-configs', companyConfigRoutes);
app.use('/api/companies', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/carriers', carrierRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/indicators', indicatorRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/dictionaries', dictionaryRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/regulation/businesses', regulationBusinessRoutes);
app.use('/api/regulation/inspections', regulationInspectionRoutes);
app.use('/api/regulation/waybills', regulationWaybillRoutes);
app.use('/api/regulation/statistics', regulationStatisticsRoutes);
app.use('/api/regulation/dashboard', regulationDashboardRoutes);
app.use('/api/regulation/messages', regulationMessagesRoutes);
app.use('/api/regulation', regulationSystemRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/vehicle-safety', vehicleSafetyRoutes);
app.use('/api', apiRoutes);
app.use('/api', waybillRoutes);
app.use('/api', statisticsRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务运行正常' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  logger.error('服务器错误', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
app.listen(PORT, () => {
  logger.info('服务器启动', { port: PORT, env: process.env.NODE_ENV || 'development' });
});

export default app;
