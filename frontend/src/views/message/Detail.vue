<template>
  <div class="message-detail-container">
    <div v-loading="loading" class="detail-content">
      <template v-if="!loading && message">
        <!-- 头部操作栏 -->
        <div class="header-actions">
          <el-button @click="goBack">
            <el-icon><ArrowLeft /></el-icon>
            返回列表
          </el-button>
          <div class="actions-right">
            <el-button 
              v-if="!message.isRead"
              type="primary"
              @click="handleMarkRead"
            >
              标记为已读
            </el-button>
            <el-button 
              type="danger"
              @click="handleDelete"
            >
              删除消息
            </el-button>
          </div>
        </div>

        <!-- 消息详情卡片 -->
        <el-card class="message-card" shadow="never">
          <!-- 消息头部 -->
          <div class="message-header">
            <div class="title-section">
              <h2 class="message-title">
                <el-badge is-dot :hidden="message.isRead" type="danger">
                  {{ message.title }}
                </el-badge>
              </h2>
              <div class="tags">
                <el-tag 
                  :type="getTypeTagType(message.type)" 
                  size="large"
                >
                  {{ getTypeLabel(message.type) }}
                </el-tag>
                <el-tag 
                  v-if="message.priority !== 'normal'"
                  :type="getPriorityTagType(message.priority)" 
                  size="large"
                >
                  {{ getPriorityLabel(message.priority) }}
                </el-tag>
                <el-tag 
                  v-if="message.isNew"
                  type="danger" 
                  size="large"
                  effect="dark"
                >
                  新消息
                </el-tag>
              </div>
            </div>
          </div>

          <!-- 消息元信息 -->
          <div class="message-meta">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="发送时间">
                {{ formatDateTime(message.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="阅读状态">
                <el-tag :type="message.isRead ? 'success' : 'warning'" size="small">
                  {{ message.isRead ? '已读' : '未读' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item v-if="message.readAt" label="阅读时间">
                {{ formatDateTime(message.readAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="消息类型">
                {{ getTypeLabel(message.type) }}
              </el-descriptions-item>
              <el-descriptions-item label="优先级">
                {{ getPriorityLabel(message.priority) }}
              </el-descriptions-item>
              <el-descriptions-item v-if="message.relatedType" label="相关类型">
                {{ getRelatedTypeLabel(message.relatedType) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 消息内容 -->
          <div class="message-content">
            <h3>消息内容</h3>
            <div class="content-text">
              {{ message.content }}
            </div>
          </div>

          <!-- 相关信息 -->
          <div v-if="message.relatedId" class="related-section">
            <h3>相关信息</h3>
            <el-card shadow="hover" class="related-card">
              <div class="related-info">
                <span class="related-label">
                  相关{{ getRelatedTypeLabel(message.relatedType) }}ID:
                </span>
                <el-link 
                  type="primary" 
                  :underline="false"
                  @click="handleRelatedClick"
                >
                  {{ message.relatedId }}
                </el-link>
              </div>
            </el-card>
          </div>

          <!-- 元数据 -->
          <div v-if="message.metadata && Object.keys(message.metadata).length > 0" class="metadata-section">
            <h3>附加信息</h3>
            <el-card shadow="hover" class="metadata-card">
              <pre class="metadata-content">{{ JSON.stringify(message.metadata, null, 2) }}</pre>
            </el-card>
          </div>
        </el-card>
      </template>

      <el-empty v-else-if="!loading && !message" description="消息不存在" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { getMessageById, markAsRead, deleteMessage } from '@/api/message';

const router = useRouter();
const route = useRoute();

const companyId = ref(route.params.id);
const messageId = ref(route.params.msgId);
const loading = ref(false);
const message = ref(null);

// 加载消息详情
const loadMessage = async () => {
  loading.value = true;
  try {
    const response = await getMessageById(companyId.value, messageId.value);
    if (response.success) {
      message.value = response.data;
      
      // 如果消息未读，自动标记为已读
      if (!message.value.isRead) {
        await markAsRead(companyId.value, messageId.value);
        message.value.isRead = true;
        message.value.readAt = new Date().toISOString();
      }
    }
  } catch (error) {
    ElMessage.error('加载消息失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// 返回列表
const goBack = () => {
  router.push(`/companies/${companyId.value}/messages`);
};

// 标记为已读
const handleMarkRead = async () => {
  try {
    const response = await markAsRead(companyId.value, messageId.value);
    if (response.success) {
      ElMessage.success('已标记为已读');
      message.value.isRead = true;
      message.value.readAt = new Date().toISOString();
    }
  } catch (error) {
    ElMessage.error('操作失败: ' + error.message);
  }
};

// 删除消息
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这条消息吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const response = await deleteMessage(companyId.value, messageId.value);
    if (response.success) {
      ElMessage.success('删除成功');
      goBack();
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + error.message);
    }
  }
};

// 点击相关链接
const handleRelatedClick = () => {
  if (message.value.relatedType === 'waybill' && message.value.relatedId) {
    router.push(`/waybills/${message.value.relatedId}`);
  } else if (message.value.relatedType === 'company' && message.value.relatedId) {
    router.push(`/companies/${message.value.relatedId}`);
  }
};

// 格式化日期时间
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
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
    system: '系统消息',
    audit: '审核消息',
    waybill: '运单消息',
    payment: '支付消息',
    notification: '通知消息'
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
    low: '低优先级',
    normal: '普通',
    high: '高优先级',
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
  loadMessage();
});
</script>

<style scoped>
.message-detail-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.actions-right {
  display: flex;
  gap: 10px;
}

.message-card {
  border-radius: 8px;
}

.message-header {
  padding-bottom: 20px;
  border-bottom: 2px solid #EBEEF5;
  margin-bottom: 20px;
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-title {
  margin: 0;
  font-size: 28px;
  color: #303133;
  font-weight: 600;
}

.tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.message-meta {
  margin-bottom: 30px;
}

.message-content {
  margin-bottom: 30px;
}

.message-content h3,
.related-section h3,
.metadata-section h3 {
  font-size: 18px;
  color: #303133;
  margin-bottom: 15px;
  font-weight: 600;
}

.content-text {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
  line-height: 1.8;
  font-size: 15px;
  color: #606266;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.related-section {
  margin-bottom: 30px;
}

.related-card {
  cursor: pointer;
  transition: all 0.3s;
}

.related-card:hover {
  transform: translateY(-2px);
}

.related-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.related-label {
  font-weight: 500;
  color: #606266;
}

.metadata-section {
  margin-bottom: 20px;
}

.metadata-card {
  background: #f5f7fa;
}

.metadata-content {
  margin: 0;
  padding: 15px;
  background: #ffffff;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #606266;
  overflow-x: auto;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}
</style>
