<template>
  <div class="message-detail">
    <div class="page-header">
      <el-button icon="ArrowLeft" @click="goBack">返回</el-button>
      <div class="header-actions">
        <el-button
          v-if="message.read_status === 'unread'"
          type="primary"
          @click="markAsRead"
        >
          标记已读
        </el-button>
      </div>
    </div>

    <el-card v-loading="loading" class="detail-card" shadow="never">
      <template v-if="message.id">
        <div class="message-header">
          <h2 class="message-title">{{ message.title }}</h2>
          <div class="message-meta">
            <el-tag
              :type="getTypeColor(message.type)"
              size="large"
            >
              {{ getTypeName(message.type) }}
            </el-tag>
            <el-tag
              :type="getPriorityColor(message.priority)"
              size="large"
            >
              {{ getPriorityName(message.priority) }}
            </el-tag>
            <el-tag
              :type="message.read_status === 'read' ? 'success' : 'info'"
              size="large"
            >
              {{ message.read_status === 'read' ? '已读' : '未读' }}
            </el-tag>
          </div>
        </div>

        <el-divider />

        <div class="message-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="发送者">
              {{ message.sender }}
            </el-descriptions-item>
            <el-descriptions-item label="接收者">
              {{ message.receiver }}
            </el-descriptions-item>
            <el-descriptions-item label="发送时间">
              {{ formatDate(message.created_at) }}
            </el-descriptions-item>
            <el-descriptions-item label="阅读时间">
              {{ message.read_at ? formatDate(message.read_at) : '未读' }}
            </el-descriptions-item>
            <el-descriptions-item label="消息状态">
              <el-tag :type="message.status === 'active' ? 'success' : 'info'">
                {{ message.status === 'active' ? '有效' : '已失效' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ formatDate(message.updated_at) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <el-divider />

        <div class="message-content">
          <h3>消息内容</h3>
          <div class="content-text" v-html="formatContent(message.content)"></div>
        </div>

        <div v-if="message.attachments && message.attachments.length > 0" class="message-attachments">
          <el-divider />
          <h3>附件</h3>
          <div class="attachments-list">
            <el-card
              v-for="(attachment, index) in message.attachments"
              :key="index"
              class="attachment-item"
              shadow="hover"
            >
              <div class="attachment-info">
                <el-icon :size="24"><Document /></el-icon>
                <div class="attachment-details">
                  <div class="attachment-name">{{ attachment.name }}</div>
                  <div class="attachment-size">{{ formatFileSize(attachment.size) }}</div>
                </div>
              </div>
              <el-button type="primary" size="small" @click="downloadAttachment(attachment)">
                下载
              </el-button>
            </el-card>
          </div>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Document } from '@element-plus/icons-vue';
import { getMessageDetail, markMessageAsRead } from '@/api/operations';

const router = useRouter();
const route = useRoute();

const loading = ref(false);
const message = ref({});

const fetchMessageDetail = async () => {
  loading.value = true;
  try {
    const msgId = route.params.msgId;
    const response = await getMessageDetail(msgId);
    if (response.success) {
      message.value = response.data;
    }
  } catch (error) {
    ElMessage.error('获取消息详情失败');
  } finally {
    loading.value = false;
  }
};

const markAsRead = async () => {
  try {
    const response = await markMessageAsRead(message.value.id);
    if (response.success) {
      ElMessage.success('已标记为已读');
      message.value.read_status = 'read';
      message.value.read_at = new Date().toISOString();
    }
  } catch (error) {
    ElMessage.error('标记失败');
  }
};

const goBack = () => {
  router.back();
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
};

const formatContent = (content) => {
  if (!content) return '';
  // 将换行符转换为 <br>
  return content.replace(/\n/g, '<br>');
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const downloadAttachment = (attachment) => {
  // 实现附件下载逻辑
  window.open(attachment.url, '_blank');
};

const getTypeColor = (type) => {
  const colorMap = {
    system: 'info',
    operation: 'success',
    alert: 'danger',
    notification: 'warning'
  };
  return colorMap[type] || 'info';
};

const getTypeName = (type) => {
  const nameMap = {
    system: '系统消息',
    operation: '运营消息',
    alert: '告警消息',
    notification: '通知消息'
  };
  return nameMap[type] || type;
};

const getPriorityColor = (priority) => {
  const colorMap = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  };
  return colorMap[priority] || 'info';
};

const getPriorityName = (priority) => {
  const nameMap = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  };
  return nameMap[priority] || priority;
};

onMounted(() => {
  fetchMessageDetail();
});
</script>

<style scoped>
.message-detail {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-card {
  min-height: 400px;
}

.message-header {
  margin-bottom: 20px;
}

.message-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #303133;
}

.message-meta {
  display: flex;
  gap: 10px;
}

.message-info {
  margin-bottom: 24px;
}

.message-content {
  margin-bottom: 24px;
}

.message-content h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #303133;
}

.content-text {
  line-height: 1.8;
  color: #606266;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.message-attachments h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #303133;
}

.attachments-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.attachment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
}

.attachment-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.attachment-details {
  flex: 1;
}

.attachment-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.attachment-size {
  font-size: 12px;
  color: #909399;
}
</style>
