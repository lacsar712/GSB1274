<template>
  <div class="vehicle-safety-dashboard">
    <div class="page-header">
      <div class="header-title">
        <h2>车辆安全监控中心</h2>
        <el-badge :value="unhandledAlertCount" :hidden="unhandledAlertCount === 0" class="alert-badge" type="danger">
          <el-button type="primary" @click="scrollToAlerts">
            <el-icon><Bell /></el-icon>
            预警中心
          </el-button>
        </el-badge>
      </div>
      <div class="header-actions">
        <CompanySelect v-model="selectedCompanyId" />
      </div>
    </div>
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.total_events || 0 }}</div>
              <div class="stat-label">总事件数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon critical">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.critical_events || 0 }}</div>
              <div class="stat-label">严重事件</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.pending_events || 0 }}</div>
              <div class="stat-label">待处理事件</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon resolved">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.resolved_events || 0 }}</div>
              <div class="stat-label">已处理事件</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="map-row">
      <el-col :span="16">
        <el-card class="map-card">
          <template #header>
            <div class="card-header">
              <span>车辆实时位置监控</span>
              <el-button size="small" @click="refreshLocations">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          <div ref="mapRef" class="map-container">
            <div class="map-toolbar">
              <el-select 
                v-model="selectedVehicleId" 
                placeholder="选择车辆查看位置" 
                style="width: 260px"
              >
                <el-option
                  v-for="v in vehicleLocations"
                  :key="v.vehicle_id"
                  :label="`${v.vehicle_no || v.vehicle_id}（${v.latitude}, ${v.longitude}）`"
                  :value="v.vehicle_id"
                />
              </el-select>
              <el-link 
                v-if="selectedVehicle" 
                :href="mapLink(selectedVehicle.latitude, selectedVehicle.longitude)" 
                target="_blank" 
                type="primary"
              >
                在OpenStreetMap中打开
              </el-link>
            </div>
            <div class="map-content">
              <iframe
                v-if="selectedVehicle"
                :src="embedMapUrl(selectedVehicle.latitude, selectedVehicle.longitude)"
                style="width: 100%; height: 100%; border: 0; border-radius: 6px;"
                referrerpolicy="no-referrer"
              />
              <div v-else class="map-placeholder">
                <el-icon class="map-icon"><Location /></el-icon>
                <p>暂无可用车辆位置</p>
                <p class="map-hint">请选择企业或点击刷新以获取最新位置</p>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="risk-card">
          <template #header>
            <span>高风险车辆</span>
          </template>
          <div class="risk-list">
            <div 
              v-for="vehicle in highRiskVehicles" 
              :key="vehicle.vehicle_id"
              class="risk-item"
            >
              <div class="risk-item-header">
                <span class="vehicle-no">{{ vehicle.vehicle_no }}</span>
                <el-tag type="danger" size="small">高风险</el-tag>
              </div>
              <div class="risk-item-content">
                <div class="risk-stat">
                  <span class="label">事件数:</span>
                  <span class="value">{{ vehicle.event_count }}</span>
                </div>
                <div class="risk-stat">
                  <span class="label">高危事件:</span>
                  <span class="value danger">{{ vehicle.high_risk_count }}</span>
                </div>
              </div>
              <div class="risk-item-footer">
                <span class="time">{{ vehicle.last_event_time }}</span>
              </div>
            </div>
            <el-empty v-if="highRiskVehicles.length === 0" description="暂无高风险车辆" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>事件趋势</span>
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                size="small"
                @change="fetchTrendData"
              />
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span>事件类型分布</span>
          </template>
          <div ref="typeChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="alerts-row" ref="alertsSectionRef">
      <el-col :span="24">
        <AlertInbox 
          ref="alertInboxRef" 
          :company-id="selectedCompanyId"
          @count-change="handleAlertCountChange"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { Warning, CircleClose, Clock, CircleCheck, Refresh, Location, Bell } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { 
  getSafetyStatistics, 
  getSafetyTrend, 
  getEventTypeDistribution,
  getVehicleLocations,
  getHighRiskVehicles 
} from '@/api/vehicleSafety';
import CompanySelect from '@/components/CompanySelect.vue';
import AlertInbox from '@/components/AlertInbox.vue';

const statistics = reactive({
  total_events: 0,
  critical_events: 0,
  high_events: 0,
  medium_events: 0,
  low_events: 0,
  pending_events: 0,
  processing_events: 0,
  resolved_events: 0,
  affected_vehicles: 0,
  affected_drivers: 0
});

const selectedCompanyId = ref('');
const dateRange = ref([]);
const trendChartRef = ref(null);
const typeChartRef = ref(null);
const highRiskVehicles = ref([]);
const vehicleLocations = ref([]);
const selectedVehicleId = ref(null);
const selectedVehicle = computed(() => vehicleLocations.value.find(v => v.vehicle_id === selectedVehicleId.value));

const unhandledAlertCount = ref(0);
const alertInboxRef = ref(null);
const alertsSectionRef = ref(null);

let trendChart = null;
let typeChart = null;

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const params = {};
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0];
      params.end_date = dateRange.value[1];
    }
    if (selectedCompanyId.value) {
      params.company_id = selectedCompanyId.value;
    }

    const response = await getSafetyStatistics(params);
    if (response.success) {
      Object.assign(statistics, response.data);
    }
  } catch (error) {
    ElMessage.error('获取统计数据失败');
  }
};

// 获取趋势数据
const fetchTrendData = async () => {
  try {
    const params = {};
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0];
      params.end_date = dateRange.value[1];
    }
    if (selectedCompanyId.value) {
      params.company_id = selectedCompanyId.value;
    }

    const response = await getSafetyTrend(params);
    if (response.success) {
      initTrendChart(response.data);
    }
  } catch (error) {
    ElMessage.error('获取趋势数据失败');
  }
};

// 获取事件类型分布
const fetchEventTypeDistribution = async () => {
  try {
    const params = {};
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0];
      params.end_date = dateRange.value[1];
    }
    if (selectedCompanyId.value) {
      params.company_id = selectedCompanyId.value;
    }

    const response = await getEventTypeDistribution(params);
    if (response.success) {
      initTypeChart(response.data);
    }
  } catch (error) {
    ElMessage.error('获取事件类型分布失败');
  }
};

// 获取车辆位置
const fetchVehicleLocations = async () => {
  try {
    const params = {};
    if (selectedCompanyId.value) {
      params.company_id = selectedCompanyId.value;
    }
    const response = await getVehicleLocations(params);
    if (response.success) {
      vehicleLocations.value = Array.isArray(response.data) ? response.data.filter(v => Number.isFinite(parseFloat(v.latitude)) && Number.isFinite(parseFloat(v.longitude))) : [];
      if (vehicleLocations.value.length && !selectedVehicleId.value) {
        selectedVehicleId.value = vehicleLocations.value[0].vehicle_id;
      }
    }
  } catch (error) {
  }
};

// 获取高风险车辆
const fetchHighRiskVehicles = async () => {
  try {
    const params = { limit: 10 };
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0];
      params.end_date = dateRange.value[1];
    }
    if (selectedCompanyId.value) {
      params.company_id = selectedCompanyId.value;
    }

    const response = await getHighRiskVehicles(params);
    if (response.success) {
      highRiskVehicles.value = response.data;
    }
  } catch (error) {
    ElMessage.error('获取高风险车辆失败');
  }
};

// 刷新位置
const refreshLocations = () => {
  fetchVehicleLocations();
  ElMessage.success('位置已刷新');
};

const mapLink = (lat, lng) => {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
};

const embedMapUrl = (lat, lng) => {
  const delta = 0.01;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
};

// 初始化趋势图表
const initTrendChart = (data) => {
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value);
  }

  const dates = data.map(item => item.date).reverse();
  const eventCounts = data.map(item => item.event_count).reverse();
  const criticalCounts = data.map(item => item.critical_count).reverse();
  const highCounts = data.map(item => item.high_count).reverse();

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['总事件', '严重事件', '高危事件']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '总事件',
        type: 'line',
        data: eventCounts,
        smooth: true,
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '严重事件',
        type: 'line',
        data: criticalCounts,
        smooth: true,
        itemStyle: { color: '#F56C6C' }
      },
      {
        name: '高危事件',
        type: 'line',
        data: highCounts,
        smooth: true,
        itemStyle: { color: '#E6A23C' }
      }
    ]
  };

  trendChart.setOption(option);
};

// 初始化事件类型图表
const initTypeChart = (data) => {
  if (!typeChart) {
    typeChart = echarts.init(typeChartRef.value);
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '事件类型',
        type: 'pie',
        radius: '50%',
        data: data.map(item => ({
          value: item.count,
          name: item.event_type
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  typeChart.setOption(option);
};

// 窗口大小改变时重新渲染图表
const handleResize = () => {
  trendChart?.resize();
  typeChart?.resize();
};

// 处理预警数量变化
const handleAlertCountChange = (count) => {
  unhandledAlertCount.value = count;
};

// 滚动到预警区域
const scrollToAlerts = () => {
  if (alertsSectionRef.value) {
    alertsSectionRef.value.scrollIntoView({ behavior: 'smooth' });
  }
};

onMounted(() => {
  // 设置默认日期范围为最近7天
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  dateRange.value = [
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  ];

  fetchStatistics();
  fetchTrendData();
  fetchEventTypeDistribution();
  fetchVehicleLocations();
  fetchHighRiskVehicles();

  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  trendChart?.dispose();
  typeChart?.dispose();
});

watch(selectedCompanyId, async () => {
  await fetchStatistics();
  await fetchTrendData();
  await fetchEventTypeDistribution();
  await fetchVehicleLocations();
  await fetchHighRiskVehicles();
  alertInboxRef.value?.refresh();
});
</script>

<style scoped>
.vehicle-safety-dashboard {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.alert-badge {
  margin-left: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  height: 120px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  margin-right: 20px;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.critical {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #ffa751 0%, #ffe259 100%);
}

.stat-icon.resolved {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.map-row {
  margin-bottom: 20px;
}

.map-card {
  height: 500px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-container {
  width: 100%;
  height: 420px;
  background: #f5f7fa;
  border-radius: 4px;
}

.map-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
}

.map-content {
  width: 100%;
  height: calc(100% - 44px);
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
  font-size: 64px;
  margin-bottom: 16px;
}

.map-hint {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 8px;
}

.risk-card {
  height: 500px;
}

.risk-list {
  height: 420px;
  overflow-y: auto;
}

.risk-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 12px;
  background: #fff;
}

.risk-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.risk-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.vehicle-no {
  font-weight: bold;
  color: #303133;
}

.risk-item-content {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.risk-stat {
  font-size: 12px;
}

.risk-stat .label {
  color: #909399;
  margin-right: 4px;
}

.risk-stat .value {
  color: #303133;
  font-weight: bold;
}

.risk-stat .value.danger {
  color: #f56c6c;
}

.risk-item-footer {
  font-size: 12px;
  color: #c0c4cc;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.chart-container {
  width: 100%;
  height: 320px;
}

.alerts-row {
  margin-bottom: 20px;
}
</style>
