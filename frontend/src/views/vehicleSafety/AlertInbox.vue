<template>
  <el-card class="alert-inbox-card">
    <template #header>
      <div class="card-header">
        <span class="title">预警收件箱</span>
        <el-button size="small" @click="fetchAlerts">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </template>
    <div v-loading="loading" class="alert-list">
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
        <div class="alert-item-content">{{ alert.alert_content }}</div>
        <div class="alert-item-footer">
          <span class="time">{{ alert.alert_time }}</span>
          <el-button
            type="primary"
            size="small"
            :loading="handlingId === alert.id"
            @click="handleMark(alert)"
          >
            标记已处理
          </el-button>
        </div>
      </div>
      <el-empty v-if="!loading && alerts.length === 0" description="暂无未处理预警" />
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import { getSafetyAlerts, handleSafetyAlert } from '@/api/vehicleSafety';

const emit = defineEmits(['update:total']);

const alerts = ref([]);
const loading = ref(false);
const handlingId = ref(null);

const levelTagType = (level) => {
  switch (level) {
    case 'critical': return 'danger';
    case 'high': return 'danger';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return '';
  }
};

const levelLabel = (level) => {
  switch (level) {
    case 'critical': return '严重';
    case 'high': return '高危';
    case 'medium': return '中等';
    case 'low': return '低危';
    default: return level || '-';
  }
};

const fetchAlerts = async () => {
  loading.value = true;
  try {
    const response = await getSafetyAlerts({ limit: 50 });
    if (response.success) {
      alerts.value = response.data.list || [];
      emit('update:total', response.data.total || 0);
    }
  } catch (error) {
    ElMessage.error('获取预警列表失败');
  } finally {
    loading.value = false;
  }
};

const handleMark = async (alert) => {
  try {
    await ElMessageBox.confirm(
      `确认将预警「${alert.alert_content}」标记为已处理？`,
      '操作确认',
      { type: 'warning' }
    );
  } catch (_) {
    return;
  }

  handlingId.value = alert.id;
  try {
    const response = await handleSafetyAlert(alert.id);
    if (response.success) {
      alerts.value = alerts.value.filter(a => a.id !== alert.id);
      const total = response.data?.unhandled_total ?? alerts.value.length;
      emit('update:total', total);
      ElMessage.success('已标记为已处理');
    }
  } catch (error) {
    ElMessage.error('标记失败');
  } finally {
    handlingId.value = null;
  }
};

onMounted(() => {
  fetchAlerts();
});

defineExpose({ fetchAlerts });
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

.title {
  font-weight: bold;
}

.alert-list {
  height: 420px;
  overflow-y: auto;
}

.alert-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 12px;
  background: #fff;
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
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  line-height: 1.5;
}

.alert-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #c0c4cc;
}
</style>
