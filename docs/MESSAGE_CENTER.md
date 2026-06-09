# 企业消息中心

## 功能概述

企业消息中心为企业管理系统提供完整的消息通知功能，支持多种消息类型、时间线展示、消息设置等功能。

## 功能特性

### 1. 消息列表（时间线设计）
- **路由**: `/companies/:id/messages`
- **功能**:
  - 时间线方式展示所有消息
  - 按日期分组（今天、昨天、具体日期）
  - 消息类型筛选（系统、审核、运单、支付、通知）
  - 阅读状态筛选（未读、已读）
  - 优先级筛选（低、普通、高、紧急）
  - 未读消息徽章显示
  - 单条消息标记已读
  - 批量标记所有消息为已读
  - 消息删除
  - 分页加载

### 2. 消息详情
- **路由**: `/companies/:id/messages/:msgId`
- **功能**:
  - 完整消息内容展示
  - 消息元信息（发送时间、阅读状态、类型、优先级）
  - 相关信息链接（关联运单、企业等）
  - 附加元数据展示
  - 自动标记为已读
  - 消息操作（标记已读、删除）

### 3. 消息设置
- **路由**: `/companies/:id/messages/settings`
- **功能**:
  - 通知方式设置（邮件、短信）
  - 消息类型订阅管理
  - 免打扰时段设置
  - 设置保存和重置

## 后端API接口

### 获取企业消息列表
```
GET /api/companies/:id/messages
```

**查询参数**:
- `page`: 页码（默认1）
- `limit`: 每页数量（默认20）
- `type`: 消息类型（system/audit/waybill/payment/notification）
- `isRead`: 阅读状态（true/false）
- `priority`: 优先级（low/normal/high/urgent）
- `startDate`: 开始日期
- `endDate`: 结束日期

**响应**:
```json
{
  "success": true,
  "data": {
    "messages": [...],
    "groupedMessages": {
      "今天": [...],
      "昨天": [...],
      "2026年2月3日": [...]
    },
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    },
    "unreadCount": 15
  }
}
```

### 获取消息详情
```
GET /api/companies/:id/messages/:msgId
```

### 标记消息为已读
```
PUT /api/companies/:id/messages/:msgId/read
```

### 批量标记消息为已读
```
PUT /api/companies/:id/messages/batch/read
Body: { "messageIds": ["id1", "id2", ...] }
```

### 标记所有消息为已读
```
PUT /api/companies/:id/messages/all/read
```

### 删除消息
```
DELETE /api/companies/:id/messages/:msgId
```

### 获取消息统计
```
GET /api/companies/:id/messages-stats
```

### 获取消息设置
```
GET /api/companies/:id/messages/settings
```

### 更新消息设置
```
PUT /api/companies/:id/messages/settings
Body: {
  "emailNotification": true,
  "smsNotification": false,
  "notificationTypes": {
    "system": true,
    "audit": true,
    "waybill": true,
    "payment": true,
    "notification": true
  },
  "quietHours": {
    "enabled": false,
    "start": "22:00",
    "end": "08:00"
  }
}
```

## 数据模型

### Message Schema

```javascript
{
  companyId: ObjectId,           // 企业ID
  type: String,                  // 消息类型
  title: String,                 // 消息标题
  content: String,               // 消息内容
  priority: String,              // 优先级
  isRead: Boolean,               // 是否已读
  readAt: Date,                  // 阅读时间
  relatedId: String,             // 关联ID
  relatedType: String,           // 关联类型
  metadata: Object,              // 元数据
  createdAt: Date,               // 创建时间
  updatedAt: Date                // 更新时间
}
```

## 消息类型

- **system**: 系统消息（系统维护、更新通知）
- **audit**: 审核消息（企业审核结果）
- **waybill**: 运单消息（运单状态变更）
- **payment**: 支付消息（支付成功、退款）
- **notification**: 通知消息（一般性通知）

## 优先级

- **low**: 低优先级
- **normal**: 普通（默认）
- **high**: 高优先级
- **urgent**: 紧急

## 使用示例

### 在其他模块中创建消息

```javascript
import Message from '../models/Message.js';

// 创建系统消息
await Message.createSystemMessage(
  companyId,
  '系统维护通知',
  '系统将于今晚22:00-24:00进行维护',
  { priority: 'high' }
);

// 创建审核消息
await Message.createAuditMessage(
  companyId,
  'approved'  // 或 'rejected', 'pending'
);

// 创建运单消息
await Message.createWaybillMessage(
  companyId,
  waybillId,
  'completed',
  { content: '运单已完成，请及时确认' }
);
```

### 前端访问消息中心

```javascript
// 跳转到消息列表
router.push(`/companies/${companyId}/messages`);

// 跳转到消息详情
router.push(`/companies/${companyId}/messages/${messageId}`);

// 跳转到消息设置
router.push(`/companies/${companyId}/messages/settings`);
```

## 界面特性

### 时间线设计
- 采用Element Plus的Timeline组件
- 按日期分组展示
- 未读消息高亮显示
- 不同优先级使用不同颜色标识

### 响应式设计
- 适配桌面和移动端
- 卡片式布局
- 悬停效果

### 交互优化
- 点击卡片查看详情
- 快速标记已读
- 批量操作支持
- 加载状态提示

## 注意事项

1. 消息设置需要企业模型支持`messageSettings`字段
2. 邮件和短信通知需要配置相应的服务
3. 免打扰时段不影响紧急消息
4. 消息自动按创建时间倒序排列
5. 建议定期清理过期消息

## 扩展建议

1. 添加消息推送功能（WebSocket）
2. 支持消息搜索
3. 添加消息模板管理
4. 支持消息导出
5. 添加消息统计图表
6. 支持消息分类标签
7. 添加消息提醒音效
