<template>
  <div class="performance-monitoring">
    <div class="page-header">
      <h2>性能监控</h2>
      <div class="header-actions">
        <el-select v-model="timeRange" @change="handleTimeRangeChange">
          <el-option label="最近1小时" value="1h" />
          <el-option label="最近6小时" value="6h" />
          <el-option label="最近24小时" value="24h" />
        </el-select>
        <el-button type="primary" icon="Refresh" @click="refreshData">刷新</el-button>
      </div>
    </div>

    <!-- 性能摘要 -->
    <el-row :gutter="20" class="summary-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="平均响应时间" :value="summary.avg_response_time" suffix="ms">
            <template #prefix>
              <el-icon><Timer /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="平均吞吐量" :value="summary.avg_throughput" suffix="req/s">
            <template #prefix>
              <el-icon><TrendCharts /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="平均错误率" :value="summary.avg_error_rate" suffix="%">
            <template #prefix>
              <el-icon><Warning /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="系统可用性" :value="summary.uptime">
            <template #prefix>
              <el-icon><CircleCheck /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 性能图表 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="24">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>响应时间趋势</span>
              <el-tag type="info">单位: ms</el-tag>
            </div>
          </template>
          <div ref="responseTimeChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>吞吐量趋势</span>
              <el-tag type="info">单位: req/s</el-tag>
            </div>
          </template>
          <div ref="throughputChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>错误率趋势</span>
              <el-tag type="info">单位: %</el-tag>
            </div>
          </template>
          <div ref="errorRateChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据库性能 -->
    <el-card shadow="never" class="database-card">
      <template #header>
        <div class="card-header">
          <span>数据库性能指标</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="db-metric">
            <div class="metric-label">活跃查询</div>
            <div class="metric-value">{{ database.active_queries || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="db-metric">
            <div class="metric-label">总连接数</div>
            <div class="metric-value">{{ database.total_connections || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="db-metric">
            <div class="metric-label">提交事务</div>
            <div class="metric-value">{{ database.transactions_committed || 0 }}</div>
          </div>
        </el-col>
      </el-row>
      <el-divider />
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="db-metric">
            <div class="metric-label">回滚事务</div>
            <div class="metric-value">{{ database.transactions_rolled_back || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="db-metric">
            <div class="metric-label">磁盘读取</div>
            <div class="metric-value">{{ database.blocks_read || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="db-metric">
            <div class="metric-label">缓存命中</div>
            <div class="metric-value">{{ database.blocks_hit || 0 }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Timer,
  TrendCharts,
  Warning,
  CircleCheck
} from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { getPerformanceMonitoring } from '@/api/operations';

const timeRange = ref('1h');
const responseTimeChart = ref(null);
const throughputChart = ref(null);
const errorRateChart = ref(null);

let responseTimeChartInstance = null;
let throughputChartInstance = null;
let errorRateChartInstance = null;

const summary = reactive({
  avg_response_time: 0,
  avg_throughput: 0,
  avg_error_rate: 0,
  uptime: '0%'
});

const database = reactive({
  active_queries: 0,
  total_connections: 0,
  transactions_committed: 0,
  transactions_rolled_back: 0,
  blocks_read: 0,
  blocks_hit: 0
});

const timeSeriesData = reactive({
  response_time: [],
  throughput: [],
  error_rate: []
});

const fetchPerformanceData = async () => {
  try {
    const response = await getPerformanceMonitoring({
      timeRange: timeRange.value,
      metric: 'all'
    });
    if (response.success) {
      Object.assign(summary, response.data.summary);
      Object.assign(database, response.data.database);
      Object.assign(timeSeriesData, response.data.timeSeries);
      
      await nextTick();
      updateCharts();
    }
  } catch (error) {
    ElMessage.error('获取性能数据失败');
  }
};

const initCharts = () => {
  if (responseTimeChart.value) {
    responseTimeChartInstance = echarts.init(responseTimeChart.value);
  }
  if (throughputChart.value) {
    throughputChartInstance = echarts.init(throughputChart.value);
  }
  if (errorRateChart.value) {
    errorRateChartInstance = echarts.init(errorRateChart.value);
  }
};

const updateCharts = () => {
  // 响应时间图表
  if (responseTimeChartInstance && timeSeriesData.response_time.length > 0) {
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}<br/>{a}: {c} ms'
      },
      xAxis: {
        type: 'category',
        data: timeSeriesData.response_time.map(item => 
          new Date(item.timestamp).toLocaleTimeString('zh-CN')
        )
      },
      yAxis: {
        type: 'value',
        name: '响应时间 (ms)'
      },
      series: [{
        name: '响应时间',
        type: 'line',
        smooth: true,
        data: timeSeriesData.response_time.map(item => item.value.toFixed(2)),
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        },
        lineStyle: {
          color: '#409eff'
        }
      }],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    };
    responseTimeChartInstance.setOption(option);
  }

  // 吞吐量图表
  if (throughputChartInstance && timeSeriesData.throughput.length > 0) {
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}<br/>{a}: {c} req/s'
      },
      xAxis: {
        type: 'category',
        data: timeSeriesData.throughput.map(item => 
          new Date(item.timestamp).toLocaleTimeString('zh-CN')
        )
      },
      yAxis: {
        type: 'value',
        name: '吞吐量 (req/s)'
      },
      series: [{
        name: '吞吐量',
        type: 'line',
        smooth: true,
        data: timeSeriesData.throughput.map(item => item.value.toFixed(2)),
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.5)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
          ])
        },
        lineStyle: {
          color: '#67c23a'
        }
      }],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    };
    throughputChartInstance.setOption(option);
  }

  // 错误率图表
  if (errorRateChartInstance && timeSeriesData.error_rate.length > 0) {
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}<br/>{a}: {c}%'
      },
      xAxis: {
        type: 'category',
        data: timeSeriesData.error_rate.map(item => 
          new Date(item.timestamp).toLocaleTimeString('zh-CN')
        )
      },
      yAxis: {
        type: 'value',
        name: '错误率 (%)'
      },
      series: [{
        name: '错误率',
        type: 'line',
        smooth: true,
        data: timeSeriesData.error_rate.map(item => item.value.toFixed(2)),
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.5)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.1)' }
          ])
        },
        lineStyle: {
          color: '#f56c6c'
        }
      }],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    };
    errorRateChartInstance.setOption(option);
  }
};

const handleTimeRangeChange = () => {
  fetchPerformanceData();
};

const refreshData = () => {
  fetchPerformanceData();
  ElMessage.success('数据已刷新');
};

onMounted(async () => {
  await fetchPerformanceData();
  await nextTick();
  initCharts();
  updateCharts();

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    responseTimeChartInstance?.resize();
    throughputChartInstance?.resize();
    errorRateChartInstance?.resize();
  });
});

onUnmounted(() => {
  responseTimeChartInstance?.dispose();
  throughputChartInstance?.dispose();
  errorRateChartInstance?.dispose();
});
</script>

<style scoped>
.performance-monitoring {
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

.summary-cards {
  margin-bottom: 20px;
}

.charts-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.database-card {
  margin-bottom: 20px;
}

.db-metric {
  text-align: center;
  padding: 20px;
}

.metric-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}
</style>
