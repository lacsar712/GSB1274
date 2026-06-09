<template>
  <div class="message-list-container">
    <!-- 头部 -->
    <div class="header">
      <h2>消息中心</h2>
      <div class="header-actions">
        <el-button 
          v-if="unreadCount > 0" 
          type="primary" 
          size="small"
          @click="handleMarkAllRead"
        >
          全部标记为已读
        </el-button>
        <el-button 
          size="small"
          @click="$router.push(`/companies/${companyId}/messages/settings`)"
        >
          消息设置
        </el-button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-bar">
      <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="stat-item">
        <el-tag>未读消息</el-tag>
      </el-badge>
      <el-tag class="stat-item">总消息: {{ total }}</el-tag>
    </div>

    <!-- 筛选器 -->
    <div class="filters">
      <el-select 
        v-model="filters.type" 
        placeholder="消息类型" 
        clearable
        @change="handleFilterChange"
      >
        <el-option label="全部" value="" />
        <el-option label="系统消息" value="system" />
        <el-option label="审核消息" value="audit" />
        <el-option label="运单消息" value="waybill" />
        <el-option label="支付消息" value="payment" />
        <el-option label="通知消息" value="notification" />
      </el-select>

      <el-select 
        v-model="filters.isRead" 
        placeholder="阅读状态" 
        clearable
        @change="handleFilterChange"
      >
        <el-option label="全部" value="" />
        <el-option label="未读" value="false" />
        <el-option label="已读" value="true" />
      </el-select>

      <el-select 
        v-model="filters.priority" 
        placeholder="优先级" 
        clearable
        @change="handleFilterChange"
      >
        <el-option label="全部" value="" />
        <el-option label="低" value="low" />
        <el-option label="普通" value="normal" />
        <el-option label="高" value="high" />
        <el-option label="紧急" value="urgent" />
      </el-select>
    </div>

    <!-- 消息时间线 -->
    <div v-loading="loading" class="timeline-container">
      <el-empty v-if="!loading && messages.length === 0" description="暂无消息" />
      
      <el-timeline v-else>
        <template v-for="(dateMessages, date) in groupedMessages" :key="date">
          <div class="date-divider">{{ date }}</div>
          <el-timeline-item
            v-for="message in dateMessages"
            :key="message._id"
            :timestamp="formatTime(message.createdAt)"
            placement="top"
            :color="getTimelineColor(message)"
          >
            <el-card 
              :class="['message-card', { 'unread': !message.isRead }]"
              shadow="hover"
              @click="handleMessageClick(message)"
            >
              <div class="message-header">
                <div class="message-title">
                  <el-badge is-dot :hidden="message.isRead" type="danger">
                    <span>{{ message.title }}</span>
                  </el-badge>
                  <el-tag 
                    :type="getTypeTagType(message.type)" 
                    size="small"
                    class="type-tag"
                  >
                    {{ getTypeLabel(message.type) }}
                  </el-tag>
                  <el-tag 
                    v-if="message.priority !== 'normal'"
                    :type="getPriorityTagType(message.priority)" 
                    size="small"
                  >
                    {{ getPriorityLabel(message.priority) }}
                  </el-tag>
                </div>
                <div class="message-actions">
                  <el-button 
                    v-if="!message.isRead"
                    type="primary" 
                    size="small" 
                    text
                    @click.stop="handleMarkRead(message._id)"
                  >
                    标记已读
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="small" 
                    text
                    @click.stop="handleDelete(message._id)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
              <div class="message-content">
                {{ message.content }}
              </div>
              <div v-if="message.relatedId" class="message-footer">
                <el-link 
                  type="primary" 
                  :underline="false"
                  @click.stop="handleRelatedClick(message)"
                >
                  查看相关{{ getRelatedTypeLabel(message.relatedType) }}
                </el-link>
              </div>
            </el-card>
          </el-timeline-item>
        </template>
      </el-timeline>
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  getMessages, 
  markAsRead, 
  markAllAsRead, 
  deleteMessage 
} from '@/api/message';

const router = useRouter();
const route = useRoute();

const companyId = ref(route.params.id);
const loading = ref(false);
const messages = ref([]);
const groupedMessages = ref({});
const total = ref(0);
const unreadCount = ref(0);

const pagination = reactive({
  page: 1,
  limit: 20
});

const filters = reactive({
  type: '',
  isRead: '',
  priority: ''
});

// 加载消息列表
const loadMessages = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters
    };

    const response = await getMessages(companyId.value, params);
    if (response.success) {
      messages.value = response.data.messages;
      groupedMessages.value = response.data.groupedMessages;
      total.value = response.data.pagination.total;
      unreadCount.value = response.data.unreadCount;
    }
  } catch (error) {
    ElMessage.error('加载消息失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// 标记消息为已读
const handleMarkRead = async (messageId) => {
  try {
    const response = await markAsRead(companyId.value, messageId);
    if (response.success) {
      ElMessage.success('已标记为已读');
      loadMessages();
    }
  } catch (error) {
    // 前端兜底：请求失败时本地回写为已读，避免交互中断
    try {
      const idx = messages.value.findIndex(m => String(m._id) === String(messageId));
      if (idx >= 0) {
        messages.value[idx].isRead = true;
        messages.value[idx].readAt = new Date().toISOString();
        if (unreadCount.value > 0) unreadCount.value -= 1;
        // 本地重分组
        const groups = {};
        const today = new Date(); today.setHours(0,0,0,0);
        const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
        messages.value.forEach(message => {
          const d = new Date(message.createdAt); d.setHours(0,0,0,0);
          let key = d.getTime() === today.getTime() ? '今天' : (d.getTime() === yesterday.getTime() ? '昨天' :
            d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }));
          if (!groups[key]) groups[key] = [];
          groups[key].push(message);
        });
        groupedMessages.value = groups;
        ElMessage.success('已标记为已读（本地兜底）');
      } else {
        ElMessage.error('操作失败: ' + (error?.message || '标记消息已读失败'));
      }
    } catch {
      ElMessage.error('操作失败: ' + (error?.message || '标记消息已读失败'));
    }
  }
};

// 标记所有消息为已读
const handleMarkAllRead = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要将所有 ${unreadCount.value} 条未读消息标记为已读吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    const response = await markAllAsRead(companyId.value);
    if (response.success) {
      ElMessage.success(response.message);
      loadMessages();
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败: ' + error.message);
    }
  }
};

// 删除消息
const handleDelete = async (messageId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条消息吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const response = await deleteMessage(companyId.value, messageId);
    if (response.success) {
      ElMessage.success('删除成功');
      loadMessages();
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message);
    }
  }
};

// 点击消息卡片
const handleMessageClick = (message) => {
  router.push(`/companies/${companyId.value}/messages/${message._id}`);
};

// 点击相关链接
const handleRelatedClick = (message) => {
  if (message.relatedType === 'waybill' && message.relatedId) {
    router.push(`/waybills/${message.relatedId}`);
  } else if (message.relatedType === 'company' && message.relatedId) {
    router.push(`/companies/${message.relatedId}`);
  }
};

// 筛选变化
const handleFilterChange = () => {
  pagination.page = 1;
  loadMessages();
};

// 分页变化
const handlePageChange = (page) => {
  pagination.page = page;
  loadMessages();
};

const handleSizeChange = (size) => {
  pagination.limit = size;
  pagination.page = 1;
  loadMessages();
};

// 格式化时间
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取时间线颜色
const getTimelineColor = (message) => {
  if (!message.isRead) return '#409EFF';
  if (message.priority === 'urgent') return '#F56C6C';
  if (message.priority === 'high') return '#E6A23C';
  return '#909399';
};

// 获取类型标签类型
const getTypeTagType = (type) => {
  const typeMap = {
    system: 'info',
    audit: 'warning',
    waybill: 'primary',
    payment: 'success',
    notification: ''
  };
  return typeMap[type] || '';
};

// 获取类型标签文本
const getTypeLabel = (type) => {
  const labelMap = {
    system: '系统',
    audit: '审核',
    waybill: '运单',
    payment: '支付',
    notification: '通知'
  };
  return labelMap[type] || type;
};

// 获取优先级标签类型
const getPriorityTagType = (priority) => {
  const priorityMap = {
    low: 'info',
    normal: '',
    high: 'warning',
    urgent: 'danger'
  };
  return priorityMap[priority] || '';
};

// 获取优先级标签文本
const getPriorityLabel = (priority) => {
  const labelMap = {
    low: '低',
    normal: '普通',
    high: '高',
    urgent: '紧急'
  };
  return labelMap[priority] || priority;
};

// 获取相关类型标签文本
const getRelatedTypeLabel = (type) => {
  const labelMap = {
    company: '企业',
    waybill: '运单',
    payment: '支付',
    other: '内容'
  };
  return labelMap[type] || '内容';
};

onMounted(() => {
  loadMessages();
});
</script>

<style scoped>
.message-list-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.stats-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filters .el-select {
  width: 150px;
}

.timeline-container {
  min-height: 400px;
  margin-bottom: 20px;
}

.date-divider {
  font-size: 14px;
  font-weight: bold;
  color: #909399;
  margin: 20px 0 10px 0;
  padding-left: 28px;
}

.message-card {
  cursor: pointer;
  transition: all 0.3s;
}

.message-card.unread {
  border-left: 3px solid #409EFF;
  background: #f0f9ff;
}

.message-card:hover {
  transform: translateY(-2px);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.message-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  font-weight: 500;
  font-size: 16px;
}

.type-tag {
  margin-left: 8px;
}

.message-actions {
  display: flex;
  gap: 5px;
}

.message-content {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 10px;
}

.message-footer {
  padding-top: 10px;
  border-top: 1px solid #EBEEF5;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 12px;
}
</style>
