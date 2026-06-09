import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'smart_logistics',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// 测试连接
sequelize.authenticate()
  .then(() => {
    logger.info('数据库连接成功');
  })
  .catch(err => {
    logger.error('数据库连接失败', { error: err.message });
  });

export default sequelize;
