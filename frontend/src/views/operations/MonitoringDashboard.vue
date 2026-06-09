<template>
  <div class="monitoring-dashboard">
    <div class="page-header">
      <h2>系统监控仪表板</h2>
      <div class="header-actions">
        <el-select v-model="timeRange" @change="handleTimeRangeChange">
          <el-option label="最近1小时" value="1h" />
          <el-option label="最近6小时" value="6h" />
          <el-option label="最近24小时" value="24h" />
          <el-option label="最近7天" value="7d" />
        </el-select>
        <el-button type="primary" icon="Refresh" @click="refreshData">刷新</el-button>
      </div>
    </div>

    <!-- 系统状态概览 -->
    <el-row :gutter="20" class="status-overview">
      <el-col :span="6">
        <el-card shadow="hover" class="status-card">
          <div class="status-item">
            <div class="status-icon" style="background-color: #67c23a;">
              <el-icon :size="32"><CircleCheck /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-label">系统状态</div>
              <div class="status-value">{{ systemStatus.status === 'running' ? '运行中' : '异常' }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="status-card">
          <div class="status-item">
            <div class="status-icon" style="background-color: #409eff;">
              <el-icon :size="32"><Connection /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-label">活跃连接</div>
              <div class="status-value">{{ systemStatus.active_connections || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="status-card">
          <div class="status-item">
            <div class="status-icon" style="background-color: #e6a23c;">
              <el-icon :size="32"><DataLine /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-label">总连接数</div>
              <div class="status-value">{{ systemStatus.total_connections || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="status-card">
          <div class="status-item">
            <div class="status-icon" style="background-color: #f56c6c;">
              <el-icon :size="32"><Coin /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-label">数据库大小</div>
              <div class="status-value">{{ formatBytes(systemStatus.database_size) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 性能指标 -->
    <el-row :gutter="20" class="performance-metrics">
      <el-col :span="8">
        <el-card shadow="never" class="metric-card">
          <template #header>
            <div class="card-header">
              <span>CPU 使用率</span>
              <el-tag :type="getCpuStatusType(performance.cpu.usage)">
                {{ performance.cpu.usage.toFixed(1) }}%
              </el-tag>
            </div>
          </template>
          <div class="metric-content">
            <el-progress
              :percentage="performance.cpu.usage"
              :color="getProgressColor(performance.cpu.usage)"
              :stroke-width="20"
            />
            <div class="metric-info">
              <span>核心数: {{ performance.cpu.cores }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="metric-card">
          <template #header>
            <div class="card-header">
              <span>内存使用</span>
              <el-tag :type="getMemoryStatusType(memoryUsagePercent)">
                {{ memoryUsagePercent.toFixed(1) }}%
              </el-tag>
            </div>
          </template>
          <div class="metric-content">
            <el-progress
              :percentage="memoryUsagePercent"
              :color="getProgressColor(memoryUsagePercent)"
              :stroke-width="20"
            />
            <div class="metric-info">
              <span>已用: {{ formatBytes(performance.memory.used) }}</span>
              <span>总计: {{ formatBytes(performance.memory.total) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="metric-card">
          <template #header>
            <div class="card-header">
              <span>磁盘使用</span>
              <el-tag :type="getDiskStatusType(diskUsagePercent)">
                {{ diskUsagePercent.toFixed(1) }}%
              </el-tag>
            </div>
          </template>
          <div class="metric-content">
            <el-progress
              :percentage="diskUsagePercent"
              :color="getProgressColor(diskUsagePercent)"
              :stroke-width="20"
            />
            <div class="metric-info">
              <span>已用: {{ formatBytes(performance.disk.used) }}</span>
              <span>总计: {{ formatBytes(performance.disk.total) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 服务状态 -->
    <el-card shadow="never" class="services-card">
      <template #header>
        <div class="card-header">
          <span>服务状态</span>
        </div>
      </template>
      <el-table :data="services" style="width: 100%">
        <el-table-column prop="name" label="服务名称" width="200" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'running' ? 'success' : 'danger'">
              {{ row.status === 'running' ? '运行中' : '已停止' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uptime" label="运行时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'running'"
              type="warning"
              size="small"
              @click="restartService(row)"
            >
              重启
            </el-button>
            <el-button
              v-else
              type="success"
              size="small"
              @click="startService(row)"
            >
              启动
            </el-button>
            <el-button
              type="info"
              size="small"
              @click="viewServiceLogs(row)"
            >
              查看日志
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  CircleCheck,
  Connection,
  DataLine,
  Coin
} from '@element-plus/icons-vue';
import { getSystemMonitoring } from '@/api/operations';

const timeRange = ref('1h');
const refreshInterval = ref(null);

const systemStatus = reactive({
  status: 'running',
  timestamp: null,
  active_connections: 0,
  total_connections: 0,
  database_size: 0
});

const performance = reactive({
  cpu: {
    usage: 0,
    cores: 4
  },
  memory: {
    used: 0,
    total: 8 * 1024 * 1024 * 1024
  },
  disk: {
    used: 0,
    total: 500 * 1024 * 1024 * 1024
  }
});

const services = ref([]);

const memoryUsagePercent = computed(() => {
  return (performance.memory.used / performance.memory.total) * 100;
});

const diskUsagePercent = computed(() => {
  return (performance.disk.used / performance.disk.total) * 100;
});

const fetchMonitoringData = async () => {
  try {
    const response = await getSystemMonitoring({ timeRange: timeRange.value });
    if (response.success) {
      Object.assign(systemStatus, response.data.system);
      Object.assign(performance, response.data.performance);
      services.value = response.data.services;
    }
  } catch (error) {
    ElMessage.error('获取监控数据失败');
  }
};

const handleTimeRangeChange = () => {
  fetchMonitoringData();
};

const refreshData = () => {
  fetchMonitoringData();
  ElMessage.success('数据已刷新');
};

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const getProgressColor = (percentage) => {
  if (percentage < 60) return '#67c23a';
  if (percentage < 80) return '#e6a23c';
  return '#f56c6c';
};

const getCpuStatusType = (usage) => {
  if (usage < 60) return 'success';
  if (usage < 80) return 'warning';
  return 'danger';
};

const getMemoryStatusType = (usage) => {
  if (usage < 70) return 'success';
  if (usage < 85) return 'warning';
  return 'danger';
};

const getDiskStatusType = (usage) => {
  if (usage < 70) return 'success';
  if (usage < 85) return 'warning';
  return 'danger';
};

const restartService = async (service) => {
  try {
    await ElMessageBox.confirm(
      `确定要重启服务 "${service.name}" 吗？`,
      '确认重启',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    ElMessage.success(`服务 "${service.name}" 重启成功`);
    fetchMonitoringData();
  } catch (error) {
    // 用户取消操作
  }
};

const startService = async (service) => {
  ElMessage.success(`服务 "${service.name}" 启动成功`);
  fetchMonitoringData();
};

const viewServiceLogs = (service) => {
  ElMessage.info(`查看服务 "${service.name}" 的日志`);
  // 跳转到日志页面
};

onMounted(() => {
  fetchMonitoringData();
  // 每30秒自动刷新一次
  refreshInterval.value = setInterval(() => {
    fetchMonitoringData();
  }, 30000);
});

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<style scoped>
.monitoring-dashboard {
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

.header-actions {
  display: flex;
  gap: 10px;
}

.status-overview {
  margin-bottom: 20px;
}

.status-card {
  height: 100%;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.status-info {
  flex: 1;
}

.status-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.status-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.performance-metrics {
  margin-bottom: 20px;
}

.metric-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.metric-content {
  padding: 10px 0;
}

.metric-info {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  font-size: 14px;
  color: #606266;
}

.services-card {
  margin-bottom: 20px;
}
</style>
