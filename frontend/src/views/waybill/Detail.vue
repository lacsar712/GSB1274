<template>
  <div class="waybill-detail">
    <div class="page-header">
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2>运单详情</h2>
      <div class="header-actions">
        <CompanySelect v-model="companyId" />
        <el-button :disabled="!canOperate" @click="showStatusDialog">更新状态</el-button>
        <el-button :disabled="!canOperate" @click="showTrackDialog">添加轨迹</el-button>
      </div>
    </div>

    <div v-if="waybill" class="detail-content">
      <!-- 基本信息 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <el-tag :type="getStatusType(waybill.status)" size="large">
              {{ waybill.status }}
            </el-tag>
          </div>
        </template>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">运单编号：</span>
            <span class="value">{{ waybill.waybillNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间：</span>
            <span class="value">{{ formatDate(waybill.createdAt) }}</span>
          </div>
          <div class="info-item">
            <span class="label">更新时间：</span>
            <span class="value">{{ formatDate(waybill.updatedAt) }}</span>
          </div>
          <div v-if="waybill.remark" class="info-item full-width">
            <span class="label">备注：</span>
            <span class="value">{{ waybill.remark }}</span>
          </div>
        </div>
      </el-card>

      <!-- 发货信息和收货信息 -->
      <div class="address-cards">
        <el-card class="address-card">
          <template #header>
            <div class="card-header">
              <el-icon><LocationFilled /></el-icon>
              <span>发货信息</span>
            </div>
          </template>
          <div class="address-info">
            <div class="info-row">
              <span class="label">发货人：</span>
              <span class="value">{{ waybill.sender.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">联系电话：</span>
              <span class="value">{{ waybill.sender.phone }}</span>
            </div>
            <div class="info-row">
              <span class="label">发货地址：</span>
              <span class="value">
                {{ waybill.sender.address?.province }}
                {{ waybill.sender.address?.city }}
                {{ waybill.sender.address?.district }}
                {{ waybill.sender.address?.detail }}
              </span>
            </div>
          </div>
        </el-card>

        <el-card class="address-card">
          <template #header>
            <div class="card-header">
              <el-icon><LocationFilled /></el-icon>
              <span>收货信息</span>
            </div>
          </template>
          <div class="address-info">
            <div class="info-row">
              <span class="label">收货人：</span>
              <span class="value">{{ waybill.receiver.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">联系电话：</span>
              <span class="value">{{ waybill.receiver.phone }}</span>
            </div>
            <div class="info-row">
              <span class="label">收货地址：</span>
              <span class="value">
                {{ waybill.receiver.address?.province }}
                {{ waybill.receiver.address?.city }}
                {{ waybill.receiver.address?.district }}
                {{ waybill.receiver.address?.detail }}
              </span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 货物信息 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <el-icon><Box /></el-icon>
            <span>货物信息</span>
          </div>
        </template>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">货物名称：</span>
            <span class="value">{{ waybill.cargo.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">货物类型：</span>
            <span class="value">{{ waybill.cargo.type }}</span>
          </div>
          <div class="info-item">
            <span class="label">重量：</span>
            <span class="value">{{ waybill.cargo.weight }} kg</span>
          </div>
          <div class="info-item">
            <span class="label">体积：</span>
            <span class="value">{{ waybill.cargo.volume || '-' }} m³</span>
          </div>
          <div class="info-item">
            <span class="label">数量：</span>
            <span class="value">{{ waybill.cargo.quantity }}</span>
          </div>
          <div class="info-item">
            <span class="label">货值：</span>
            <span class="value">¥{{ waybill.cargo.value || 0 }}</span>
          </div>
          <div v-if="waybill.cargo.description" class="info-item full-width">
            <span class="label">货物描述：</span>
            <span class="value">{{ waybill.cargo.description }}</span>
          </div>
        </div>
      </el-card>

      <!-- 运输信息 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <el-icon><Van /></el-icon>
            <span>运输信息</span>
          </div>
        </template>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">运输方式：</span>
            <span class="value">{{ waybill.transport.type }}</span>
          </div>
          <div class="info-item">
            <span class="label">车牌号：</span>
            <span class="value">{{ waybill.transport.vehicleNo || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">司机姓名：</span>
            <span class="value">{{ waybill.transport.driverName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">司机电话：</span>
            <span class="value">{{ waybill.transport.driverPhone || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">预计发车时间：</span>
            <span class="value">{{ formatDate(waybill.transport.estimatedDepartureTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">预计到达时间：</span>
            <span class="value">{{ formatDate(waybill.transport.estimatedArrivalTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">实际发车时间：</span>
            <span class="value">{{ formatDate(waybill.transport.actualDepartureTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">实际到达时间：</span>
            <span class="value">{{ formatDate(waybill.transport.actualArrivalTime) }}</span>
          </div>
        </div>
      </el-card>

      <!-- 费用信息 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <el-icon><Money /></el-icon>
            <span>费用信息</span>
          </div>
        </template>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">运费：</span>
            <span class="value">¥{{ waybill.fee?.freight || 0 }}</span>
          </div>
          <div class="info-item">
            <span class="label">保险费：</span>
            <span class="value">¥{{ waybill.fee?.insurance || 0 }}</span>
          </div>
          <div class="info-item">
            <span class="label">其他费用：</span>
            <span class="value">¥{{ waybill.fee?.other || 0 }}</span>
          </div>
          <div class="info-item">
            <span class="label">总费用：</span>
            <span class="value highlight">¥{{ waybill.fee?.total || 0 }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付方式：</span>
            <span class="value">{{ waybill.fee?.paymentMethod || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付状态：</span>
            <el-tag :type="waybill.fee?.paid ? 'success' : 'warning'">
              {{ waybill.fee?.paid ? '已支付' : '未支付' }}
            </el-tag>
          </div>
        </div>
      </el-card>

      <!-- 物流轨迹 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <el-icon><Clock /></el-icon>
            <span>物流轨迹</span>
          </div>
        </template>
        <el-timeline>
          <el-timeline-item
            v-for="(track, index) in waybill.tracks"
            :key="index"
            :timestamp="formatDate(track.time)"
            :type="index === 0 ? 'primary' : 'info'"
          >
            <div class="track-content">
              <div class="track-status">{{ track.status }}</div>
              <div class="track-location">{{ track.location }}</div>
              <div class="track-description">{{ track.description }}</div>
              <div class="track-operator">操作人：{{ track.operator }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
    <el-empty v-else description="暂无运单详情数据" />

    <!-- 更新状态对话框 -->
    <el-dialog v-model="statusDialogVisible" title="更新运单状态" width="500px">
      <el-form :model="statusForm" label-width="100px">
        <el-form-item label="状态">
          <el-select v-model="statusForm.status" placeholder="请选择状态">
            <el-option label="待发货" value="待发货" />
            <el-option label="运输中" value="运输中" />
            <el-option label="已到达" value="已到达" />
            <el-option label="已签收" value="已签收" />
            <el-option label="异常" value="异常" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
        <el-form-item label="当前位置">
          <el-input v-model="statusForm.location" placeholder="请输入当前位置" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="statusForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateStatus">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加轨迹对话框 -->
    <el-dialog v-model="trackDialogVisible" title="添加物流轨迹" width="500px">
      <el-form :model="trackForm" label-width="100px">
        <el-form-item label="位置">
          <el-input v-model="trackForm.location" placeholder="请输入位置" />
        </el-form-item>
        <el-form-item label="状态">
          <el-input v-model="trackForm.status" placeholder="请输入状态" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="trackForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="trackDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddTrack">确定</el-button>
      </template>
    </el-dialog>

    <el-loading v-if="loading" fullscreen />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed, getCurrentInstance } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  ArrowLeft,
  LocationFilled,
  Box,
  Van,
  Money,
  Clock
} from '@element-plus/icons-vue';
import {
  getWaybillDetail,
  updateWaybillStatus,
  addWaybillTrack
} from '@/api/waybill';
import CompanySelect from '@/components/CompanySelect.vue';

const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();

// 假设从路由或store获取企业ID
const companyId = ref('');
const waybillId = ref(route.params.id);

// 数据
const waybill = ref(null);
const loading = ref(false);

// 对话框
const statusDialogVisible = ref(false);
const trackDialogVisible = ref(false);

// 表单
const statusForm = reactive({
  status: '',
  location: '',
  description: ''
});

const trackForm = reactive({
  location: '',
  status: '',
  description: ''
});

// 获取运单详情
const fetchWaybillDetail = async () => {
  try {
    loading.value = true;
    const response = await getWaybillDetail(companyId.value, waybillId.value);
    if (response.success) {
      waybill.value = response.data;
    }
  } catch (error) {
    proxy.$notifyError('获取运单详情', error);
  } finally {
    loading.value = false;
  }
};

// 显示状态对话框
const showStatusDialog = () => {
  if (!canOperate.value) {
    proxy?.$notifyWarning?.('当前企业无权操作该运单');
    return;
  }
  statusForm.status = waybill.value.status;
  statusForm.location = '';
  statusForm.description = '';
  statusDialogVisible.value = true;
};

// 显示轨迹对话框
const showTrackDialog = () => {
  if (!canOperate.value) {
    proxy?.$notifyWarning?.('当前企业无权操作该运单');
    return;
  }
  trackForm.location = '';
  trackForm.status = '';
  trackForm.description = '';
  trackDialogVisible.value = true;
};

// 更新状态
const handleUpdateStatus = async () => {
  try {
    const response = await updateWaybillStatus(
      companyId.value,
      waybillId.value,
      statusForm
    );
    if (response.success) {
      proxy.$notifySuccess('更新运单状态');
      statusDialogVisible.value = false;
      fetchWaybillDetail();
    }
  } catch (error) {
    proxy.$notifyError('更新运单状态', error);
  }
};

// 添加轨迹
const handleAddTrack = async () => {
  try {
    const response = await addWaybillTrack(
      companyId.value,
      waybillId.value,
      trackForm
    );
    if (response.success) {
      proxy.$notifySuccess('添加运单轨迹');
      trackDialogVisible.value = false;
      fetchWaybillDetail();
    }
  } catch (error) {
    proxy.$notifyError('添加运单轨迹', error);
  }
};

// 返回
const goBack = () => {
  router.back();
};

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    '待发货': 'info',
    '运输中': 'primary',
    '已到达': 'success',
    '已签收': 'success',
    '异常': 'danger',
    '已取消': 'info'
  };
  return typeMap[status] || 'info';
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
};

// 初始化
onMounted(() => {
  if (companyId.value && waybillId.value) {
    fetchWaybillDetail();
  }
});

watch(companyId, async (val, oldVal) => {
  if (val && val !== oldVal && waybillId.value) {
    await fetchWaybillDetail();
  }
});

const canOperate = computed(() => {
  if (!waybill.value) return false;
  return String(waybill.value.companyId || '') === String(companyId.value || '');
});
</script>

<style scoped>
.waybill-detail {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.page-header h2 {
  flex: 1;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item .label {
  color: #909399;
  white-space: nowrap;
}

.info-item .value {
  color: #606266;
  font-weight: 500;
}

.info-item .value.highlight {
  color: #409eff;
  font-size: 18px;
  font-weight: 600;
}

.address-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.address-card {
  width: 100%;
}

.address-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  gap: 10px;
}

.info-row .label {
  color: #909399;
  white-space: nowrap;
  min-width: 80px;
}

.info-row .value {
  color: #606266;
  font-weight: 500;
}

.track-content {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.track-status {
  font-weight: 600;
  color: #409eff;
  margin-bottom: 5px;
}

.track-location {
  color: #606266;
  margin-bottom: 5px;
}

.track-description {
  color: #909399;
  font-size: 14px;
  margin-bottom: 5px;
}

.track-operator {
  color: #c0c4cc;
  font-size: 12px;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .address-cards {
    grid-template-columns: 1fr;
  }
}
</style>
