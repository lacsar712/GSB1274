import mongoose from 'mongoose';

const waybillSchema = new mongoose.Schema({
  // 运单编号（自动生成）
  waybillNo: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  companyId: {
    type: String,
    required: true,
    index: true
  },
  
  // 发货信息
  sender: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      province: String,
      city: String,
      district: String,
      detail: String
    }
  },
  
  // 收货信息
  receiver: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      province: String,
      city: String,
      district: String,
      detail: String
    }
  },
  
  // 货物信息
  cargo: {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['普货', '危险品', '冷链', '贵重物品', '其他'],
      default: '普货'
    },
    weight: {
      type: Number,
      required: true
    },
    volume: Number,
    quantity: {
      type: Number,
      default: 1
    },
    value: Number,
    description: String
  },
  
  // 运输信息
  transport: {
    type: {
      type: String,
      enum: ['公路', '铁路', '航空', '水运', '多式联运'],
      default: '公路'
    },
    vehicleNo: String,
    driverName: String,
    driverPhone: String,
    estimatedDepartureTime: Date,
    estimatedArrivalTime: Date,
    actualDepartureTime: Date,
    actualArrivalTime: Date
  },
  
  // 运单状态
  status: {
    type: String,
    enum: ['待发货', '运输中', '已到达', '已签收', '异常', '已取消'],
    default: '待发货',
    index: true
  },
  
  // 费用信息
  fee: {
    freight: Number,
    insurance: Number,
    other: Number,
    total: Number,
    paid: {
      type: Boolean,
      default: false
    },
    paymentMethod: {
      type: String,
      enum: ['现金', '转账', '月结', '到付'],
      default: '到付'
    }
  },
  
  // 备注
  remark: String,
  
  // 轨迹记录
  tracks: [{
    time: {
      type: Date,
      default: Date.now
    },
    location: String,
    status: String,
    description: String,
    operator: String
  }],
  
  // 创建时间和更新时间
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 生成运单编号
waybillSchema.statics.generateWaybillNo = async function() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = 'WB' + dateStr;
  
  // 查找当天最后一个运单号
  const lastWaybill = await this.findOne({
    waybillNo: new RegExp('^' + prefix)
  }).sort({ waybillNo: -1 });
  
  let sequence = 1;
  if (lastWaybill) {
    const lastSequence = parseInt(lastWaybill.waybillNo.slice(-4));
    sequence = lastSequence + 1;
  }
  
  return prefix + sequence.toString().padStart(4, '0');
};

// 添加轨迹记录
waybillSchema.methods.addTrack = function(trackData) {
  this.tracks.push(trackData);
  return this.save();
};

// 更新状态
waybillSchema.methods.updateStatus = function(status, trackData) {
  this.status = status;
  if (trackData) {
    this.tracks.push({
      ...trackData,
      status: status
    });
  }
  return this.save();
};

// 索引
waybillSchema.index({ companyId: 1, createdAt: -1 });
waybillSchema.index({ waybillNo: 1 });
waybillSchema.index({ status: 1 });
waybillSchema.index({ 'sender.phone': 1 });
waybillSchema.index({ 'receiver.phone': 1 });

const Waybill = mongoose.model('Waybill', waybillSchema);

export default Waybill;
