import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const GraphEdge = sequelize.define('GraphEdge', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  edgeId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '边唯一标识'
  },
  sourceNodeId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '源节点ID（GraphNode.nodeId）'
  },
  targetNodeId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '目标节点ID（GraphNode.nodeId）'
  },
  label: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '边标签'
  },
  weight: {
    type: DataTypes.FLOAT,
    defaultValue: 1.0,
    comment: '边权重'
  },
  properties: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '边属性'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'graph_edges',
  timestamps: true
});

export default GraphEdge;
