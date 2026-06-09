import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Indicator = sequelize.define('Indicator', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '指标名称'
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '指标编码'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '指标分类'
  },
  unit: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '计量单位'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '指标描述'
  },
  formula: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '计算公式'
  },
  dataSource: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '数据来源'
  },
  frequency: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
    allowNull: true,
    defaultValue: 'monthly',
    comment: '统计频率'
  },
  targetValue: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    comment: '目标值'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active',
    comment: '状态'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '创建人ID'
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '更新人ID'
  }
}, {
  tableName: 'indicators',
  timestamps: true,
  indexes: [
    {
      fields: ['code']
    },
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['createdBy']
    }
  ]
});

export default Indicator;
