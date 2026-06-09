<template>
  <div class="safety-detail">
    <div class="page-header">
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2>车辆安全事件详情</h2>
      <div class="header-actions">
        <CompanySelect v-model="selectedCompanyId" />
        <el-button type="primary" @click="showProcessDialog">处理事件</el-button>
      </div>
    </div>

    <div v-if="record" class="detail-content">
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <el-tag :type="getStatusType(record.status)" size="large">
              {{ getStatusText(record.status) }}
            </el-tag>
          </div>
        </template>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">车牌号：</span>
            <span class="value">{{ record.vehicle_no }}</span>
          </div>
          <div class="info-item">
            <span class="label">司机：</span>
            <span class="value">{{ record.driver_name || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">事件类型：</span>
            <span class="value">{{ getEventTypeText(record.event_type) }}</span>
          </div>
          <div class="info-item">
            <span class="label">事件等级：</span>
            <el-tag :type="getLevelType(record.event_level)">
              {{ getLevelText(record.event_level) }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="label">速度：</span>
            <span class="value">{{ record.speed || 0 }} km/h</span>
          </div>
          <div class="info-item">
            <span class="label">事件时间：</span>
            <span class="value">{{ formatDate(record.event_time) }}</span>
          </div>
          <div class="info-item full-width">
            <span class="label">位置：</span>
            <span class="value">{{ record.location || '-' }}</span>
          </div>
          <div v-if="record.handle_result" class="info-item full-width">
            <span class="label">处理结果：</span>
            <span class="value">{{ record.handle_result }}</span>
          </div>
        </div>
      </el-card>

      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>地图</span>
          </div>
        </template>
        <div class="map-container">
          <div class="map-placeholder">
            <el-icon class="map-icon"><Location /></el-icon>
            <p>地图组件占位</p>
          </div>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="processDialogVisible" title="处理安全事件" width="600px">
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理状态">
          <el-select v-model="processForm.status" placeholder="请选择处理状态">
            <el-option label="处理中" value="processing" />
            <el-option label="已处理" value="resolved" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理结果">
          <el-input v-model="processForm.handle_result" type="textarea" :rows="4" placeholder="请输入处理结果" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmProcess">确定</el-button>
      </template>
    </el-dialog>

    <el-loading v-if="loading" fullscreen />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, Location } from '@element-plus/icons-vue';
import { getSafetyRecordById, updateSafetyStatus } from '@/api/vehicleSafety';
import CompanySelect from '@/components/CompanySelect.vue';

const router = useRouter();
const route = useRoute();
const recordId = ref(route.params.id);

const loading = ref(false);
const selectedCompanyId = ref('');
const record = ref(null);

const processDialogVisible = ref(false);
const processForm = reactive({
  status: '',
  handle_result: ''
});

const fetchRecord = async () => {
  try {
    loading.value = true;
    const res = await getSafetyRecordById(recordId.value);
    if (res.success) {
      record.value = res.data;
    }
  } catch {
    ElMessage.error('获取安全事件详情失败');
  } finally {
    loading.value = false;
  }
};

const showProcessDialog = () => {
  processForm.status = record.value?.status === 'pending' ? 'processing' : 'resolved';
  processForm.handle_result = '';
  processDialogVisible.value = true;
};

const handleConfirmProcess = async () => {
  if (!processForm.status) {
    ElMessage.warning('请选择处理状态');
    return;
  }
  try {
    const res = await updateSafetyStatus(recordId.value, {
      status: processForm.status,
      handle_result: processForm.handle_result
    });
    if (res.data.success) {
      ElMessage.success('处理成功');
      processDialogVisible.value = false;
      await fetchRecord();
    }
  } catch {
    ElMessage.error('处理失败');
  }
};

const goBack = () => router.back();

const getEventTypeText = (type) => {
  const typeMap = {
    speeding: '超速',
    hard_brake: '急刹车',
    hard_acceleration: '急加速',
    fatigue_driving: '疲劳驾驶',
    route_deviation: '偏离路线',
    illegal_parking: '违规停车',
    other: '其他'
  };
  return typeMap[type] || type;
};

const getLevelType = (level) => {
  const typeMap = {
    critical: 'danger',
    high: 'warning',
    medium: 'primary',
    low: 'info'
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

const getStatusType = (status) => {
  const typeMap = {
    pending: 'info',
    processing: 'warning',
    resolved: 'success'
  };
  return typeMap[status] || 'info';
};

const getStatusText = (status) => {
  const textMap = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已处理'
  };
  return textMap[status] || status;
};

const formatDate = (s) => {
  if (!s) return '-';
  try {
    const d = new Date(s);
    return d.toLocaleString();
  } catch {
    return s;
  }
};

onMounted(() => {
  fetchRecord();
});

watch(selectedCompanyId, async () => {
  await fetchRecord();
});
</script>

<style scoped>
.safety-detail {
  padding: 20px;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.header-actions {
  margin-left: auto;
  display: flex;
  gap: 10px;
  align-items: center;
}
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.info-card {
  margin-bottom: 16px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.info-item .label {
  color: #909399;
  margin-right: 6px;
}
.info-item.full-width {
  grid-column: 1 / -1;
}
.map-container {
  width: 100%;
  height: 360px;
  background: #f5f7fa;
  border-radius: 4px;
}
.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}
.map-icon {
  font-size: 48px;
  margin-bottom: 8px;
}
</style>
