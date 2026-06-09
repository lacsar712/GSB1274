import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const GraphNode = sequelize.define('GraphNode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nodeId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '节点唯一标识'
  },
  label: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '节点标签'
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '节点类型'
  },
  properties: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '节点属性'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '元数据'
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
  tableName: 'graph_nodes',
  timestamps: true,
  indexes: [
    {
      fields: ['nodeId'],
      unique: true
    },
    {
      fields: ['type']
    },
    {
      fields: ['label']
    }
  ]
});

export default GraphNode;
