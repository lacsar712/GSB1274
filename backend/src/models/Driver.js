import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Driver = sequelize.define('Driver', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '驾驶员姓名'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: '联系电话'
  },
  idCard: {
    type: DataTypes.STRING(18),
    allowNull: false,
    unique: true,
    comment: '身份证号'
  },
  licenseNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '驾驶证号'
  },
  licenseType: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: '驾驶证类型 (A1, A2, B1, B2, C1等)'
  },
  licenseIssueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '驾驶证发证日期'
  },
  licenseExpiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '驾驶证有效期'
  },
  qualificationNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '从业资格证号'
  },
  qualificationExpiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '从业资格证有效期'
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: true,
    comment: '性别'
  },
  birthDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '出生日期'
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '住址'
  },
  emergencyContact: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '紧急联系人'
  },
  emergencyPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '紧急联系电话'
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '所属公司ID'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
    comment: '状态：active-在职, inactive-离职, suspended-停职'
  },
  hireDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '入职日期'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注'
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '头像URL'
  },
  drivingYears: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '驾龄（年）'
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
  tableName: 'drivers',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['phone']
    },
    {
      fields: ['id_card']
    },
    {
      fields: ['license_number']
    },
    {
      fields: ['company_id']
    },
    {
      fields: ['status']
    }
  ]
});

export default Driver;
