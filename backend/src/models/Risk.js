import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Risk = sequelize.define('Risk', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '风险标题'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '风险分类'
  },
  level: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium',
    comment: '风险等级'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '风险描述'
  },
  impact: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '影响范围'
  },
  probability: {
    type: DataTypes.ENUM('very_low', 'low', 'medium', 'high', 'very_high'),
    allowNull: true,
    comment: '发生概率'
  },
  mitigation: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '应对措施'
  },
  status: {
    type: DataTypes.ENUM('identified', 'assessing', 'mitigating', 'monitoring', 'closed'),
    allowNull: false,
    defaultValue: 'identified',
    comment: '风险状态'
  },
  owner: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '责任人'
  },
  identifiedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '识别日期'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '截止日期'
  },
  closedDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '关闭日期'
  },
  relatedProject: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '关联项目'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '标签'
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '附件'
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
  tableName: 'risks',
  timestamps: true,
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['level']
    },
    {
      fields: ['status']
    },
    {
      fields: ['identifiedDate']
    },
    {
      fields: ['createdBy']
    }
  ]
});

export default Risk;
