import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '标签名称'
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#1890ff',
    comment: '标签颜色'
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '标签描述'
  },
  usageCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '使用次数'
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
  tableName: 'tags',
  timestamps: true,
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['createdBy']
    }
  ]
});

export default Tag;
