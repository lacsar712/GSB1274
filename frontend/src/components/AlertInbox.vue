<template>
  <el-card class="alert-inbox-card">
    <template #header>
      <div class="card-header">
        <span>
          预警收件箱
          <el-badge v-if="totalCount > 0" :value="totalCount" class="alert-badge" />
        </span>
        <el-button size="small" @click="fetchAlerts">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </template>
    <div class="alert-list" v-loading="loading">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="alert-item"
      >
        <div class="alert-item-header">
          <span class="vehicle-no">{{ alert.vehicle_no }}</span>
          <el-tag :type="levelTagType(alert.alert_level)" size="small">
            {{ levelLabel(alert.alert_level) }}
          </el-tag>
        </div>
        <div class="alert-item-content">
          <span class="alert-type">{{ typeLabel(alert.alert_type) }}</span>
          <span class="alert-text">{{ alert.alert_content }}</span>
        </div>
        <div class="alert-item-footer">
          <span class="time">{{ alert.alert_time }}</span>
          <el-button
            type="primary"
            size="small"
            :loading="handlingId === alert.id"
            @click="handleMarkHandled(alert)"
          >
            标记已处理
          </el-button>
        </div>
      </div>
      <el-empty v-if="!loading && alerts.length === 0" description="暂无未处理预警" />
      <div v-if="pagination.total_pages > 1" class="pagination-wrap">
        <el-pagination
          small
          layout="prev, pager, next"
          :current-page="pagination.page"
          :page-size="pagination.page_size"
          :total="pagination.total"
          @current-change="onPageChange"
        />
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import { getAlertList, markAlertHandled } from '@/api/vehicleSafety';

const emit = defineEmits(['handled']);

const loading = ref(false);
const handlingId = ref(null);
const alerts = ref([]);
const totalCount = ref(0);
const pagination = reactive({
  page: 1,
  page_size: 10,
  total: 0,
  total_pages: 0
});

const levelTagType = (level) => {
  const map = { critical: 'danger', high: 'danger', medium: 'warning', low: 'info' };
  return map[level] || 'info';
};

const levelLabel = (level) => {
  const map = { critical: '严重', high: '高危', medium: '中等', low: '低危' };
  return map[level] || level;
};

const typeLabel = (type) => {
  const map = {
    speeding: '超速',
    hard_brake: '急刹车',
    hard_acceleration: '急加速',
    fatigue_driving: '疲劳驾驶',
    route_deviation: '偏离路线',
    illegal_parking: '违规停车'
  };
  return map[type] || type;
};

const fetchAlerts = async () => {
  loading.value = true;
  try {
    const response = await getAlertList({
      page: pagination.page,
      page_size: pagination.page_size
    });
    if (response.success) {
      alerts.value = response.data.list;
      totalCount.value = response.data.pagination.total;
      Object.assign(pagination, response.data.pagination);
    }
  } catch {
    ElMessage.error('获取预警列表失败');
  } finally {
    loading.value = false;
  }
};

const handleMarkHandled = async (alert) => {
  handlingId.value = alert.id;
  try {
    const response = await markAlertHandled(alert.id);
    if (response.success) {
      ElMessage.success('已标记为已处理');
      totalCount.value = Math.max(0, totalCount.value - 1);
      emit('handled', totalCount.value);
      fetchAlerts();
    }
  } catch {
    ElMessage.error('标记已处理失败');
  } finally {
    handlingId.value = null;
  }
};

const onPageChange = (page) => {
  pagination.page = page;
  fetchAlerts();
};

const refreshCount = async () => {
  try {
    const { default: api } = await import('@/api/vehicleSafety');
    const response = await api.getAlertCount();
    if (response.success) {
      totalCount.value = response.data.total;
      emit('handled', totalCount.value);
    }
  } catch {}
};

onMounted(() => {
  fetchAlerts();
});

defineExpose({ fetchAlerts, refreshCount, totalCount });
</script>

<style scoped>
.alert-inbox-card {
  height: 500px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-badge {
  margin-left: 8px;
}

.alert-list {
  height: 420px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.alert-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 12px;
  background: #fff;
  transition: box-shadow 0.2s;
}

.alert-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.alert-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.vehicle-no {
  font-weight: bold;
  color: #303133;
}

.alert-item-content {
  margin-bottom: 8px;
}

.alert-type {
  display: inline-block;
  font-size: 12px;
  color: #909399;
  margin-right: 8px;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
}

.alert-text {
  font-size: 13px;
  color: #606266;
}

.alert-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-item-footer .time {
  font-size: 12px;
  color: #c0c4cc;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  padding: 8px 0;
  margin-top: auto;
}
</style>
