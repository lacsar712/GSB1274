<template>
  <div class="operations-messages">
    <div class="page-header">
      <h2>运营消息中心</h2>
      <div class="header-actions">
        <el-button type="primary" icon="Setting" @click="showSettings">消息设置</el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="消息类型">
          <el-select v-model="filters.type" placeholder="全部类型" clearable>
            <el-option label="系统消息" value="system" />
            <el-option label="运营消息" value="operation" />
            <el-option label="告警消息" value="alert" />
            <el-option label="通知消息" value="notification" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable>
            <el-option label="未读" value="unread" />
            <el-option label="已读" value="read" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 消息时间线 -->
    <el-card class="messages-card" shadow="never">
      <el-timeline>
        <el-timeline-item
          v-for="message in messages"
          :key="message.id"
          :timestamp="formatDate(message.created_at)"
          :type="getMessageType(message.priority)"
          placement="top"
        >
          <el-card
            :class="['message-item', { 'unread': message.read_status === 'unread' }]"
            @click="handleMessageClick(message)"
          >
            <div class="message-header">
              <div class="message-title">
                <el-tag
                  :type="getTypeColor(message.type)"
                  size="small"
                  class="message-type-tag"
                >
                  {{ getTypeName(message.type) }}
                </el-tag>
                <span class="title-text">{{ message.title }}</span>
                <el-badge
                  v-if="message.read_status === 'unread'"
                  value="未读"
                  class="unread-badge"
                />
              </div>
              <div class="message-meta">
                <span class="sender">发送者: {{ message.sender }}</span>
                <el-tag
                  :type="getPriorityColor(message.priority)"
                  size="small"
                >
                  {{ getPriorityName(message.priority) }}
                </el-tag>
              </div>
            </div>
            <div class="message-content">
              {{ message.content }}
            </div>
            <div class="message-actions">
              <el-button
                v-if="message.read_status === 'unread'"
                type="primary"
                size="small"
                @click.stop="markAsRead(message.id)"
              >
                标记已读
              </el-button>
              <el-button
                type="text"
                size="small"
                @click.stop="viewDetail(message.id)"
              >
                查看详情
              </el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <!-- 空状态 -->
      <el-empty v-if="messages.length === 0" description="暂无消息" />

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 消息设置对话框 -->
    <el-dialog
      v-model="settingsDialogVisible"
      title="消息设置"
      width="600px"
    >
      <el-form :model="settings" label-width="120px">
        <el-form-item label="邮件通知">
          <el-switch v-model="settings.emailNotification" />
        </el-form-item>
        <el-form-item label="短信通知">
          <el-switch v-model="settings.smsNotification" />
        </el-form-item>
        <el-form-item label="推送通知">
          <el-switch v-model="settings.pushNotification" />
        </el-form-item>
        <el-form-item label="通知类型">
          <el-checkbox-group v-model="settings.notificationTypes">
            <el-checkbox label="system">系统消息</el-checkbox>
            <el-checkbox label="operation">运营消息</el-checkbox>
            <el-checkbox label="alert">告警消息</el-checkbox>
            <el-checkbox label="notification">通知消息</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="免打扰时段">
          <el-time-picker
            v-model="quietHours"
            is-range
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="HH:mm"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="settingsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSettings">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  getOperationMessages,
  markMessageAsRead,
  getMessageSettings,
  updateMessageSettings
} from '@/api/operations';

const router = useRouter();

// 数据
const messages = ref([]);
const dateRange = ref([]);
const filters = reactive({
  type: '',
  status: '',
  startDate: '',
  endDate: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});

const settingsDialogVisible = ref(false);
const settings = reactive({
  userId: 1, // 应该从用户信息中获取
  emailNotification: true,
  smsNotification: false,
  pushNotification: true,
  notificationTypes: ['system', 'operation', 'alert'],
  quietHoursStart: null,
  quietHoursEnd: null
});
const quietHours = ref([]);

// 方法
const fetchMessages = async () => {
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters
    };
    const response = await getOperationMessages(params);
    if (response.success) {
      messages.value = response.data.list;
      pagination.total = response.data.pagination.total;
    }
  } catch (error) {
    ElMessage.error('获取消息列表失败');
  }
};

const handleDateChange = (value) => {
  if (value) {
    filters.startDate = value[0];
    filters.endDate = value[1];
  } else {
    filters.startDate = '';
    filters.endDate = '';
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchMessages();
};

const handleReset = () => {
  Object.assign(filters, {
    type: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  dateRange.value = [];
  handleSearch();
};

const handlePageChange = (page) => {
  pagination.page = page;
  fetchMessages();
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchMessages();
};

const handleMessageClick = (message) => {
  viewDetail(message.id);
};

const markAsRead = async (msgId) => {
  try {
    const response = await markMessageAsRead(msgId);
    if (response.success) {
      ElMessage.success('已标记为已读');
      fetchMessages();
    }
  } catch (error) {
    ElMessage.error('标记失败');
  }
};

const viewDetail = (msgId) => {
  router.push(`/operations/messages/${msgId}`);
};

const showSettings = async () => {
  try {
    const response = await getMessageSettings(settings.userId);
    if (response.success) {
      Object.assign(settings, response.data);
      if (settings.quietHoursStart && settings.quietHoursEnd) {
        quietHours.value = [
          new Date(`2000-01-01 ${settings.quietHoursStart}`),
          new Date(`2000-01-01 ${settings.quietHoursEnd}`)
        ];
      }
    }
    settingsDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取消息设置失败');
  }
};

const saveSettings = async () => {
  try {
    if (quietHours.value && quietHours.value.length === 2) {
      settings.quietHoursStart = quietHours.value[0].toTimeString().slice(0, 5);
      settings.quietHoursEnd = quietHours.value[1].toTimeString().slice(0, 5);
    }
    const response = await updateMessageSettings(settings);
    if (response.success) {
      ElMessage.success('设置保存成功');
      settingsDialogVisible.value = false;
    }
  } catch (error) {
    ElMessage.error('保存设置失败');
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN');
};

const getMessageType = (priority) => {
  const typeMap = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  };
  return typeMap[priority] || 'info';
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
  fetchMessages();
});
</script>

<style scoped>
.operations-messages {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 0;
}

.messages-card {
  min-height: 400px;
}

.message-item {
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 10px;
}

.message-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.message-item.unread {
  border-left: 3px solid #409eff;
  background-color: #f0f9ff;
}

.message-header {
  margin-bottom: 12px;
}

.message-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.message-type-tag {
  flex-shrink: 0;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  flex: 1;
}

.unread-badge {
  flex-shrink: 0;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #909399;
}

.message-content {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.message-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
