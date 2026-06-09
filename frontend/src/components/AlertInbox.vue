<template>
  <el-card class="alert-inbox-card">
    <template #header>
      <div class="card-header">
        <span class="title">预警收件箱</span>
        <el-badge :value="unhandledCount" :hidden="unhandledCount === 0" class="badge">
          <el-button size="small" type="primary" @click="fetchAlertList">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </el-badge>
      </div>
    </template>
    <div class="alert-list" v-loading="loading">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="alert-item"
      >
        <div class="alert-header">
          <el-tag :type="getAlertLevelType(alert.alert_level)" size="small">
            {{ getAlertLevelText(alert.alert_level) }}
          </el-tag>
          <span class="alert-time">{{ formatTime(alert.alert_time) }}</span>
        </div>
        <div class="alert-content">
          <div class="alert-vehicle">
            <el-icon><Van /></el-icon>
            <span>{{ alert.vehicle_no }}</span>
          </div>
          <div class="alert-type">
            {{ getAlertTypeText(alert.alert_type) }}
          </div>
          <div class="alert-desc">
            {{ alert.alert_content }}
          </div>
        </div>
        <div class="alert-actions">
          <el-button
            size="small"
            type="success"
            @click="handleMarkAsHandled(alert)"
            :loading="handlingId === alert.id"
          >
            标记已处理
          </el-button>
        </div>
      </div>
      <el-empty v-if="alerts.length === 0 && !loading" description="暂无未处理预警" />
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, defineEmits, defineProps } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh, Van } from '@element-plus/icons-vue';
import { getAlertList, markAlertAsHandled, getUnhandledAlertCount } from '@/api/vehicleSafety';

const props = defineProps({
  companyId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['count-change']);

const loading = ref(false);
const alerts = ref([]);
const unhandledCount = ref(0);
const handlingId = ref(null);

const fetchAlertList = async () => {
  loading.value = true;
  try {
    const params = {
      page: 1,
      page_size: 10
    };
    if (props.companyId) {
      params.company_id = props.companyId;
    }
    const response = await getAlertList(params);
    if (response.success) {
      alerts.value = response.data.list;
      unhandledCount.value = response.data.pagination.total;
      emit('count-change', unhandledCount.value);
    }
  } catch (error) {
    ElMessage.error('获取预警列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchUnhandledCount = async () => {
  try {
    const params = {};
    if (props.companyId) {
      params.company_id = props.companyId;
    }
    const response = await getUnhandledAlertCount(params);
    if (response.success) {
      unhandledCount.value = response.data.count;
      emit('count-change', unhandledCount.value);
    }
  } catch (error) {
  }
};

const handleMarkAsHandled = async (alert) => {
  handlingId.value = alert.id;
  try {
    const response = await markAlertAsHandled(alert.id);
    if (response.success) {
      ElMessage.success('已标记为已处理');
      alerts.value = alerts.value.filter(item => item.id !== alert.id);
      unhandledCount.value = Math.max(0, unhandledCount.value - 1);
      emit('count-change', unhandledCount.value);
    }
  } catch (error) {
    ElMessage.error('标记已处理失败');
  } finally {
    handlingId.value = null;
  }
};

const formatTime = (time) => {
  if (!time) return '';
  return time;
};

const getAlertLevelType = (level) => {
  const typeMap = {
    critical: 'danger',
    high: 'warning',
    medium: 'primary',
    low: 'info'
  };
  return typeMap[level] || 'info';
};

const getAlertLevelText = (level) => {
  const textMap = {
    critical: '严重',
    high: '高危',
    medium: '中等',
    low: '低危'
  };
  return textMap[level] || level;
};

const getAlertTypeText = (type) => {
  const typeMap = {
    speeding: '超速预警',
    hard_brake: '急刹车预警',
    hard_acceleration: '急加速预警',
    fatigue_driving: '疲劳驾驶预警',
    route_deviation: '偏离路线预警',
    illegal_parking: '违规停车预警',
    other: '其他预警'
  };
  return typeMap[type] || type;
};

const refresh = () => {
  fetchAlertList();
};

defineExpose({
  refresh,
  fetchUnhandledCount
});

onMounted(() => {
  fetchAlertList();
  fetchUnhandledCount();
});
</script>

<style scoped>
.alert-inbox-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-weight: bold;
  font-size: 16px;
}

.badge {
  margin-right: 8px;
}

.alert-list {
  max-height: 500px;
  overflow-y: auto;
}

.alert-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 12px;
  background: #fff;
  transition: all 0.3s;
}

.alert-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.alert-time {
  font-size: 12px;
  color: #909399;
}

.alert-content {
  margin-bottom: 12px;
}

.alert-vehicle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.alert-type {
  font-size: 14px;
  color: #606266;
  margin-bottom: 6px;
}

.alert-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

.alert-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
