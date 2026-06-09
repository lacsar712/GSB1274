<template>
  <div class="alert-inbox">
    <el-card class="alert-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-badge :value="unhandledCount" :hidden="unhandledCount === 0" class="alert-badge">
              <span>预警收件箱</span>
            </el-badge>
          </div>
          <el-button size="small" @click="fetchAlerts" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>
      <div class="alert-list" v-loading="loading">
        <div 
          v-for="alert in alertList" 
          :key="alert.id"
          class="alert-item"
        >
          <div class="alert-item-header">
            <div class="alert-title-row">
              <el-tag 
                :type="getLevelTagType(alert.alert_level)" 
                size="small"
                class="level-tag"
              >
                {{ getLevelText(alert.alert_level) }}
              </el-tag>
              <span class="vehicle-no">{{ alert.vehicle_no }}</span>
            </div>
            <el-button 
              type="primary" 
              link 
              size="small" 
              @click="handleMarkHandled(alert)"
              :loading="alert.processing"
            >
              标记已处理
            </el-button>
          </div>
          <div class="alert-content">
            {{ alert.alert_content }}
          </div>
          <div class="alert-meta">
            <span class="alert-type">
              <el-icon><Warning /></el-icon>
              {{ getTypeText(alert.alert_type) }}
            </span>
            <span class="alert-time">
              <el-icon><Clock /></el-icon>
              {{ formatTime(alert.alert_time) }}
            </span>
          </div>
        </div>
        <el-empty v-if="alertList.length === 0 && !loading" description="暂无未处理预警" />
      </div>
      <div class="pagination-wrapper" v-if="pagination.total_pages > 1">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchAlerts"
          @current-change="fetchAlerts"
          small
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh, Warning, Clock } from '@element-plus/icons-vue';
import { getUnhandledAlerts, markAlertAsHandled } from '@/api/vehicleSafety';

const emit = defineEmits(['count-updated']);

const loading = ref(false);
const alertList = ref([]);
const unhandledCount = ref(0);
const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0,
  total_pages: 0
});

const getLevelTagType = (level) => {
  const typeMap = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'success'
  };
  return typeMap[level] || 'info';
};

const getLevelText = (level) => {
  const textMap = {
    critical: '严重',
    high: '高危',
    medium: '中等',
    low: '低危'
  };
  return textMap[level] || level;
};

const getTypeText = (type) => {
  const textMap = {
    speeding: '超速预警',
    hard_brake: '急刹车预警',
    hard_acceleration: '急加速预警',
    fatigue_driving: '疲劳驾驶预警',
    route_deviation: '偏离路线预警',
    illegal_parking: '违规停车预警',
    other: '其他预警'
  };
  return textMap[type] || type;
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const fetchAlerts = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.page_size
    };
    const response = await getUnhandledAlerts(params);
    if (response.success) {
      alertList.value = (response.data.list || []).map(item => ({
        ...item,
        processing: false
      }));
      pagination.total = response.data.pagination.total;
      pagination.total_pages = response.data.pagination.total_pages;
      unhandledCount.value = response.data.pagination.total;
      emit('count-updated', unhandledCount.value);
    }
  } catch (error) {
    ElMessage.error('获取预警列表失败');
  } finally {
    loading.value = false;
  }
};

const handleMarkHandled = async (alert) => {
  try {
    await ElMessageBox.confirm(
      `确定将车牌 ${alert.vehicle_no} 的预警标记为已处理吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
  } catch {
    return;
  }

  alert.processing = true;
  try {
    const response = await markAlertAsHandled(alert.id);
    if (response.success) {
      ElMessage.success('已标记为已处理');
      alertList.value = alertList.value.filter(item => item.id !== alert.id);
      unhandledCount.value = Math.max(0, unhandledCount.value - 1);
      pagination.total = Math.max(0, pagination.total - 1);
      emit('count-updated', unhandledCount.value);
      if (alertList.value.length === 0 && pagination.page > 1) {
        pagination.page -= 1;
        await fetchAlerts();
      }
    }
  } catch (error) {
    ElMessage.error('标记失败，请重试');
  } finally {
    alert.processing = false;
  }
};

const refreshCount = async () => {
  await fetchAlerts();
};

defineExpose({
  refreshCount
});

onMounted(() => {
  fetchAlerts();
});
</script>

<style scoped>
.alert-inbox {
  width: 100%;
}

.alert-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.alert-badge {
  margin-right: 8px;
}

.alert-list {
  max-height: 450px;
  overflow-y: auto;
  padding-right: 4px;
}

.alert-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  margin-bottom: 12px;
  background: #fff;
  transition: all 0.3s;
}

.alert-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-color: #409EFF;
}

.alert-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.alert-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-tag {
  flex-shrink: 0;
}

.vehicle-no {
  font-weight: bold;
  color: #303133;
  font-size: 14px;
}

.alert-content {
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 8px;
  padding-left: 4px;
}

.alert-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.alert-type,
.alert-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>
