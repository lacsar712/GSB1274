<template>
  <div class="delivery-dashboard">
    <div class="page-header">
      <div class="header-actions">
        <CompanySelect v-model="selectedCompanyId" />
      </div>
    </div>
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.total_orders || 0 }}</div>
              <div class="stat-label">总订单数</div>
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
              <div class="stat-value">{{ statistics.pending_orders || 0 }}</div>
              <div class="stat-label">待分配订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon delivering">
              <el-icon><Van /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.delivering_orders || 0 }}</div>
              <div class="stat-label">配送中订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon completed">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.completed_orders || 0 }}</div>
              <div class="stat-label">已完成订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>订单趋势</span>
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
            <span>订单状态分布</span>
          </template>
          <div ref="statusChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <span>配送员绩效排行</span>
          </template>
          <div ref="performanceChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, Clock, Van, CircleCheck } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { getDeliveryStatistics, getDeliveryTrend, getDriverPerformance } from '@/api/delivery';
import CompanySelect from '@/components/CompanySelect.vue';

const statistics = reactive({
  total_orders: 0,
  pending_orders: 0,
  assigned_orders: 0,
  picking_orders: 0,
  delivering_orders: 0,
  completed_orders: 0,
  cancelled_orders: 0,
  total_weight: 0,
  total_volume: 0
});

const selectedCompanyId = ref('');
const dateRange = ref([]);
const trendChartRef = ref(null);
const statusChartRef = ref(null);
const performanceChartRef = ref(null);

let trendChart = null;
let statusChart = null;
let performanceChart = null;

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

    const response = await getDeliveryStatistics(params);
    if (response.success) {
      Object.assign(statistics, response.data);
      initStatusChart();
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

    const response = await getDeliveryTrend(params);
    if (response.success) {
      initTrendChart(response.data);
    }
  } catch (error) {
    ElMessage.error('获取趋势数据失败');
  }
};

// 获取配送员绩效数据
const fetchPerformanceData = async () => {
  try {
    const params = {};
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0];
      params.end_date = dateRange.value[1];
    }
    if (selectedCompanyId.value) {
      params.company_id = selectedCompanyId.value;
    }

    const response = await getDriverPerformance(params);
    if (response.success) {
      initPerformanceChart(response.data);
    }
  } catch (error) {
    ElMessage.error('获取配送员绩效数据失败');
  }
};

// 初始化趋势图表
const initTrendChart = (data) => {
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value);
  }

  const dates = data.map(item => item.date).reverse();
  const orderCounts = data.map(item => item.order_count).reverse();
  const completedCounts = data.map(item => item.completed_count).reverse();

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['订单总数', '完成订单']
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
        name: '订单总数',
        type: 'line',
        data: orderCounts,
        smooth: true,
        itemStyle: { color: '#409EFF' }
      },
      {
        name: '完成订单',
        type: 'line',
        data: completedCounts,
        smooth: true,
        itemStyle: { color: '#67C23A' }
      }
    ]
  };

  trendChart.setOption(option);
};

// 初始化状态分布图表
const initStatusChart = () => {
  if (!statusChart) {
    statusChart = echarts.init(statusChartRef.value);
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
        name: '订单状态',
        type: 'pie',
        radius: '50%',
        data: [
          { value: statistics.pending_orders, name: '待分配', itemStyle: { color: '#909399' } },
          { value: statistics.assigned_orders, name: '已分配', itemStyle: { color: '#E6A23C' } },
          { value: statistics.picking_orders, name: '取货中', itemStyle: { color: '#409EFF' } },
          { value: statistics.delivering_orders, name: '配送中', itemStyle: { color: '#409EFF' } },
          { value: statistics.completed_orders, name: '已完成', itemStyle: { color: '#67C23A' } },
          { value: statistics.cancelled_orders, name: '已取消', itemStyle: { color: '#F56C6C' } }
        ],
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

  statusChart.setOption(option);
};

// 初始化配送员绩效图表
const initPerformanceChart = (data) => {
  if (!performanceChart) {
    performanceChart = echarts.init(performanceChartRef.value);
  }

  const drivers = data.slice(0, 10).map(item => item.driver_name);
  const completedOrders = data.slice(0, 10).map(item => item.completed_orders);

  const sanitize = (s) => {
    const t = String(s ?? '');
    return t.replace(/\uFFFD+/g, '·').replace(/[\u0000-\u001F\u007F]/g, '');
  };

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: drivers.map(sanitize)
    },
    series: [
      {
        name: '完成订单数',
        type: 'bar',
        data: completedOrders,
        itemStyle: { color: '#409EFF' }
      }
    ]
  };

  performanceChart.setOption(option);
};

// 窗口大小改变时重新渲染图表
const handleResize = () => {
  trendChart?.resize();
  statusChart?.resize();
  performanceChart?.resize();
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
  fetchPerformanceData();

  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  trendChart?.dispose();
  statusChart?.dispose();
  performanceChart?.dispose();
});

watch(selectedCompanyId, async () => {
  await fetchStatistics();
  await fetchTrendData();
  await fetchPerformanceData();
});
</script>

<style scoped>
.delivery-dashboard {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
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

.stat-icon.pending {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.delivering {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.completed {
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

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  width: 100%;
  height: 320px;
}
</style>
