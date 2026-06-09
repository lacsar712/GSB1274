import mongoose from 'mongoose';
import crypto from 'crypto';

const apiKeySchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  secret: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'revoked'],
    default: 'active'
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'delete']
  }],
  lastUsedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 生成API密钥
apiKeySchema.statics.generateKey = function() {
  return 'ak_' + crypto.randomBytes(16).toString('hex');
};

// 生成API密钥
apiKeySchema.statics.generateSecret = function() {
  return 'sk_' + crypto.randomBytes(32).toString('hex');
};

// 更新时间戳
apiKeySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 验证密钥是否有效
apiKeySchema.methods.isValid = function() {
  if (this.status !== 'active') {
    return false;
  }
  if (this.expiresAt && this.expiresAt < new Date()) {
    return false;
  }
  return true;
};

// 更新最后使用时间
apiKeySchema.methods.updateLastUsed = async function() {
  this.lastUsedAt = new Date();
  await this.save();
};

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

export default ApiKey;
