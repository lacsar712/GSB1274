<template>
  <div class="statistics-overview">
    <div class="page-header">
      <h1>企业运营概览</h1>
      <div class="header-actions">
        <CompanySelect v-model="selectedCompanyId" @change="loadData" />
        <el-button type="primary" @click="handleExport">导出数据</el-button>
      </div>
    </div>

    <el-card v-loading="loading" class="overview-card">
      <!-- 企业信息 -->
      <div v-if="overview.company" class="company-info">
        <h2>{{ overview.company.name }}</h2>
      </div>

      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-cards">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon total">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.waybills?.total || 0 }}</div>
              <div class="stat-label">总运单数</div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon revenue">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">¥{{ formatMoney(overview.revenue?.total) }}</div>
              <div class="stat-label">总收入</div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon monthly">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.monthly?.waybills || 0 }}</div>
              <div class="stat-label">本月运单</div>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon monthly-revenue">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">¥{{ formatMoney(overview.monthly?.revenue) }}</div>
              <div class="stat-label">本月收入</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 运单状态分布 -->
      <el-row :gutter="20" class="charts-row">
        <el-col :xs="24" :md="12">
          <div class="chart-card">
            <h3>运单状态分布</h3>
            <div v-if="hasWaybillStatusData" ref="waybillStatusChart" class="chart-container"></div>
            <el-empty v-else description="暂无运单状态数据" />
          </div>
        </el-col>

        <el-col :xs="24" :md="12">
          <div class="chart-card">
            <h3>收入统计</h3>
            <div v-if="hasRevenueData" ref="revenueChart" class="chart-container"></div>
            <el-empty v-else description="暂无收入数据" />
          </div>
        </el-col>
      </el-row>

      <!-- 详细数据表格 -->
      <div class="detail-section">
        <h3>运单状态详情</h3>
        <el-table v-if="hasWaybillStatusData" :data="waybillStatusData" border>
          <el-table-column prop="status" label="状态" width="120" />
          <el-table-column prop="count" label="数量" width="120" />
          <el-table-column prop="percentage" label="占比" width="120">
            <template #default="{ row }">
              {{ row.percentage }}%
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无运单状态详情数据" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, getCurrentInstance, computed } from 'vue';
import { Document, Money, Calendar, TrendCharts } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { getStatisticsOverview, exportStatistics } from '@/api/statistics';
import CompanySelect from '@/components/CompanySelect.vue';

const { proxy } = getCurrentInstance();
const loading = ref(false);
const selectedCompanyId = ref('');
const overview = reactive({
  company: null,
  waybills: {},
  revenue: {},
  monthly: {}
});

const waybillStatusChart = ref(null);
const revenueChart = ref(null);

// 运单状态数据
const waybillStatusData = ref([]);

// 加载统计数据
const loadData = async () => {
  if (!selectedCompanyId.value) return;

  loading.value = true;
  try {
    const response = await getStatisticsOverview(selectedCompanyId.value);
    if (response.success) {
      const data = response.data;
      overview.company = data.company;
      overview.waybills = data.waybills;
      overview.revenue = data.revenue;
      overview.monthly = data.monthly;
      prepareChartData();
      await nextTick();
      renderCharts();
    } else {
      proxy.$notifyError('加载统计数据', new Error(response.message || '请求失败'));
    }
  } catch (error) {
    proxy.$notifyError('加载统计数据', error);
  } finally {
    loading.value = false;
  }
};

// 准备图表数据
const prepareChartData = () => {
  const statusMap = {
    pending: '待发货',
    inTransit: '运输中',
    arrived: '已到达',
    signed: '已签收',
    abnormal: '异常',
    cancelled: '已取消'
  };

  waybillStatusData.value = Object.entries(statusMap).map(([key, label]) => {
    const count = overview.waybills[key] || 0;
    const total = overview.waybills.total || 1;
    return {
      status: label,
      count,
      percentage: ((count / total) * 100).toFixed(2)
    };
  });
};

// 渲染图表
const renderCharts = () => {
  renderWaybillStatusChart();
  renderRevenueChart();
};

const hasWaybillStatusData = computed(() => {
  if (!waybillStatusData.value || waybillStatusData.value.length === 0) return false;
  return waybillStatusData.value.some(item => (item.count || 0) > 0);
});

const hasRevenueData = computed(() => {
  const paid = overview.revenue?.paid || 0;
  const unpaid = overview.revenue?.unpaid || 0;
  return (paid + unpaid) > 0;
});

// 渲染运单状态饼图
const renderWaybillStatusChart = () => {
  if (!waybillStatusChart.value) return;

  try {
    const chart = echarts.init(waybillStatusChart.value);
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center'
      },
      series: [
        {
          name: '运单状态',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: (waybillStatusData.value || []).map(item => ({
            name: item.status,
            value: item.count
          }))
        }
      ]
    };
    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());
  } catch (e) {
    proxy?.$notifyError?.('渲染运单状态图', e);
  }
};

// 渲染收入柱状图
const renderRevenueChart = () => {
  if (!revenueChart.value) return;

  try {
    const chart = echarts.init(revenueChart.value);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['已收款', '未收款']
      },
      xAxis: {
        type: 'category',
        data: ['收入统计']
      },
      yAxis: {
        type: 'value',
        name: '金额（元）'
      },
      series: [
        {
          name: '已收款',
          type: 'bar',
          data: [overview.revenue?.paid || 0],
          itemStyle: {
            color: '#67C23A'
          }
        },
        {
          name: '未收款',
          type: 'bar',
          data: [overview.revenue?.unpaid || 0],
          itemStyle: {
            color: '#E6A23C'
          }
        }
      ]
    };
    chart.setOption(option);
    window.addEventListener('resize', () => chart.resize());
  } catch (e) {
    proxy?.$notifyError?.('渲染收入统计图', e);
  }
};

// 格式化金额
const formatMoney = (value) => {
  if (!value) return '0.00';
  return Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 导出数据
const handleExport = async () => {
  if (!selectedCompanyId.value) {
    proxy.$notifyWarning('请先选择企业');
    return;
  }

  try {
    const response = await exportStatistics(selectedCompanyId.value, {
      type: 'all'
    });

    const blob =
      response instanceof Blob
        ? response
        : new Blob([JSON.stringify(response, null, 2)], {
            type: 'application/json'
          });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${overview.company?.name || '企业'}_统计数据_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    proxy.$notifySuccess('数据导出');
  } catch (error) {
    proxy.$notifyError('导出数据', error);
  }
};

onMounted(() => {
  if (selectedCompanyId.value) {
    loadData();
  }
});
</script>

<style scoped>
.statistics-overview {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.overview-card {
  margin-bottom: 20px;
}

.company-info {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #EBEEF5;
}

.company-info h2 {
  margin: 0;
  font-size: 20px;
  color: #409EFF;
}

.stats-cards {
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 28px;
  margin-right: 15px;
}

.stat-icon.total {
  background: #E1F3FB;
  color: #409EFF;
}

.stat-icon.revenue {
  background: #E8F8F5;
  color: #67C23A;
}

.stat-icon.monthly {
  background: #FEF0F0;
  color: #F56C6C;
}

.stat-icon.monthly-revenue {
  background: #FDF6EC;
  color: #E6A23C;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.charts-row {
  margin-bottom: 30px;
}

.chart-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #303133;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.detail-section {
  margin-top: 30px;
}

.detail-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #303133;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .stat-card {
    margin-bottom: 15px;
  }
}
</style>
