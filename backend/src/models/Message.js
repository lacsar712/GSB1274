import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['system', 'audit', 'waybill', 'payment', 'notification'],
    required: true,
    default: 'notification'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  relatedId: {
    type: String,
    trim: true
  },
  relatedType: {
    type: String,
    enum: ['company', 'waybill', 'payment', 'other'],
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// 索引优化
messageSchema.index({ companyId: 1, createdAt: -1 });
messageSchema.index({ companyId: 1, isRead: 1 });
messageSchema.index({ companyId: 1, type: 1 });

// 虚拟字段：是否为新消息（24小时内）
messageSchema.virtual('isNew').get(function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.createdAt > oneDayAgo && !this.isRead;
});

// 实例方法：标记为已读
messageSchema.methods.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
  return this;
};

// 静态方法：获取企业未读消息数量
messageSchema.statics.getUnreadCount = async function(companyId) {
  return await this.countDocuments({ companyId, isRead: false });
};

// 静态方法：批量标记为已读
messageSchema.statics.markMultipleAsRead = async function(companyId, messageIds) {
  return await this.updateMany(
    { 
      _id: { $in: messageIds },
      companyId,
      isRead: false
    },
    { 
      isRead: true,
      readAt: new Date()
    }
  );
};

// 静态方法：创建系统消息
messageSchema.statics.createSystemMessage = async function(companyId, title, content, options = {}) {
  return await this.create({
    companyId,
    type: 'system',
    title,
    content,
    priority: options.priority || 'normal',
    relatedId: options.relatedId,
    relatedType: options.relatedType,
    metadata: options.metadata || {}
  });
};

// 静态方法：创建审核消息
messageSchema.statics.createAuditMessage = async function(companyId, status, reason = '') {
  const titles = {
    approved: '企业审核通过',
    rejected: '企业审核未通过',
    pending: '企业资料待审核'
  };
  
  const contents = {
    approved: '恭喜！您的企业资料已通过审核，现在可以正常使用系统功能。',
    rejected: `很抱歉，您的企业资料审核未通过。原因：${reason}。请修改后重新提交。`,
    pending: '您的企业资料已提交，我们将在1-3个工作日内完成审核。'
  };

  return await this.create({
    companyId,
    type: 'audit',
    title: titles[status] || '审核通知',
    content: contents[status] || reason,
    priority: status === 'rejected' ? 'high' : 'normal',
    relatedType: 'company',
    metadata: { auditStatus: status, reason }
  });
};

// 静态方法：创建运单消息
messageSchema.statics.createWaybillMessage = async function(companyId, waybillId, action, details = {}) {
  const titles = {
    created: '运单创建成功',
    updated: '运单状态更新',
    completed: '运单已完成',
    cancelled: '运单已取消'
  };

  return await this.create({
    companyId,
    type: 'waybill',
    title: titles[action] || '运单通知',
    content: details.content || `运单 ${waybillId} ${titles[action]}`,
    priority: details.priority || 'normal',
    relatedId: waybillId,
    relatedType: 'waybill',
    metadata: details.metadata || {}
  });
};

// JSON序列化时包含虚拟字段
messageSchema.set('toJSON', { virtuals: true });
messageSchema.set('toObject', { virtuals: true });

const Message = mongoose.model('Message', messageSchema);

export default Message;
