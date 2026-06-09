<template>
  <div class="operations-revenue">
    <div class="page-header">
      <h1>运营收入统计</h1>
      <div class="header-actions">
        <CompanySelect
          v-model="filters.companyId"
          :clearable="true"
          :autoSelectFirst="false"
          @change="loadData"
        />
      </div>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="filters.startDate"
            type="date"
            placeholder="选择开始日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker
            v-model="filters.endDate"
            type="date"
            placeholder="选择结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="分组方式">
          <el-select v-model="filters.groupBy" placeholder="选择分组方式">
            <el-option label="按天" value="day" />
            <el-option label="按周" value="week" />
            <el-option label="按月" value="month" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="success" @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="loading" class="chart-card">
      <div class="chart-section">
        <h3>收入趋势</h3>
        <div ref="revenueTrendChart" class="chart-container"></div>
      </div>

      <el-row :gutter="20" class="stats-row">
        <el-col :xs="24" :md="12">
          <div class="chart-section">
            <h3>支付方式分布</h3>
            <div ref="paymentMethodChart" class="chart-container-small"></div>
          </div>
        </el-col>

        <el-col :xs="24" :md="12">
          <div class="chart-section">
            <h3>企业收入Top 10</h3>
            <div ref="topCompaniesChart" class="chart-container-small"></div>
          </div>
        </el-col>
      </el-row>

      <div class="table-section">
        <h3>收入明细</h3>
        <el-table :data="revenueDetailData" border stripe>
          <el-table-column prop="date" label="日期" width="150" />
          <el-table-column prop="waybillCount" label="运单数量" width="120" />
          <el-table-column prop="totalRevenue" label="总收入" width="150">
            <template #default="{ row }">
              ¥{{ formatMoney(row.totalRevenue) }}
            </template>
          </el-table-column>
          <el-table-column prop="paidRevenue" label="已收款" width="150">
            <template #default="{ row }">
              ¥{{ formatMoney(row.paidRevenue) }}
            </template>
          </el-table-column>
          <el-table-column prop="unpaidRevenue" label="未收款" width="150">
            <template #default="{ row }">
              ¥{{ formatMoney(row.unpaidRevenue) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, getCurrentInstance } from 'vue';
import * as echarts from 'echarts';
import { getOperationsRevenue, exportOperationsData } from '@/api/statistics';
import CompanySelect from '@/components/CompanySelect.vue';

const { proxy } = getCurrentInstance();
const loading = ref(false);

const filters = reactive({
  companyId: '',
  startDate: '',
  endDate: '',
  groupBy: 'day'
});

const revenueTrendChart = ref(null);
const paymentMethodChart = ref(null);
const topCompaniesChart = ref(null);

const revenueDetailData = ref([]);
const paymentMethodData = ref([]);
const topCompaniesData = ref([]);

const initFilters = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  filters.endDate = end.toISOString().split('T')[0];
  filters.startDate = start.toISOString().split('T')[0];
};

const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      startDate: filters.startDate,
      endDate: filters.endDate,
      groupBy: filters.groupBy
    };
    if (filters.companyId) {
      params.companyId = filters.companyId;
    }
    const response = await getOperationsRevenue(params);
    if (!response.success) {
      proxy.$notifyError('加载统计数据', new Error(response.message || '请求失败'));
      return;
    }
    const data = response.data || {};
    revenueDetailData.value = (data.trend || []).map(item => ({
      date: item._id,
      waybillCount: item.waybillCount,
      totalRevenue: item.totalRevenue,
      paidRevenue: item.paidRevenue,
      unpaidRevenue: item.unpaidRevenue
    }));
    if (revenueDetailData.value.length === 0 && filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      const result = [];
      const fmt = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };
      if (filters.groupBy === 'day') {
        const cur = new Date(start);
        cur.setHours(0,0,0,0);
        const endDay = new Date(end);
        endDay.setHours(0,0,0,0);
        while (cur <= endDay) {
          result.push({ date: fmt(cur), waybillCount: 0, totalRevenue: 0, paidRevenue: 0, unpaidRevenue: 0 });
          cur.setDate(cur.getDate() + 1);
        }
      } else if (filters.groupBy === 'month') {
        const cur = new Date(start.getFullYear(), start.getMonth(), 1);
        const last = new Date(end.getFullYear(), end.getMonth(), 1);
        while (cur <= last) {
          const y = cur.getFullYear();
          const m = String(cur.getMonth() + 1).padStart(2, '0');
          result.push({ date: `${y}-${m}`, waybillCount: 0, totalRevenue: 0, paidRevenue: 0, unpaidRevenue: 0 });
          cur.setMonth(cur.getMonth() + 1);
        }
      } else {
        const cur = new Date(start);
        cur.setHours(0,0,0,0);
        const endDay = new Date(end);
        endDay.setHours(0,0,0,0);
        const weekKey = (d) => {
          const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
          const dayNum = tmp.getUTCDay() || 7;
          tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
          const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
          const weekNo = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
          const y = tmp.getUTCFullYear();
          return `${y}-W${String(weekNo).padStart(2, '0')}`;
        };
        const seen = new Set();
        while (cur <= endDay) {
          const key = weekKey(cur);
          if (!seen.has(key)) {
            seen.add(key);
            result.push({ date: key, waybillCount: 0, totalRevenue: 0, paidRevenue: 0, unpaidRevenue: 0 });
          }
          cur.setDate(cur.getDate() + 1);
        }
      }
      revenueDetailData.value = result;
    }
    paymentMethodData.value = data.paymentMethod || [];
    topCompaniesData.value = data.topCompanies || [];
    await nextTick();
    renderCharts();
  } catch (error) {
    proxy.$notifyError('加载统计数据', error);
  } finally {
    loading.value = false;
  }
};

const renderCharts = () => {
  renderRevenueTrendChart();
  renderPaymentMethodChart();
  renderTopCompaniesChart();
};

const renderRevenueTrendChart = () => {
  if (!revenueTrendChart.value) return;
  const chart = echarts.init(revenueTrendChart.value);
  const dates = revenueDetailData.value.map(item => item.date);
  const totalRevenue = revenueDetailData.value.map(item => item.totalRevenue);
  const paidRevenue = revenueDetailData.value.map(item => item.paidRevenue);
  const unpaidRevenue = revenueDetailData.value.map(item => item.unpaidRevenue);
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['总收入', '已收款', '未收款'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: dates },
    yAxis: { type: 'value', name: '金额（元）' },
    series: [
      { name: '总收入', type: 'line', data: totalRevenue, smooth: true, itemStyle: { color: '#409EFF' } },
      { name: '已收款', type: 'line', data: paidRevenue, smooth: true, itemStyle: { color: '#67C23A' } },
      { name: '未收款', type: 'line', data: unpaidRevenue, smooth: true, itemStyle: { color: '#E6A23C' } }
    ]
  };
  chart.setOption(option);
  window.addEventListener('resize', () => chart.resize());
};

const renderPaymentMethodChart = () => {
  if (!paymentMethodChart.value) return;
  const chart = echarts.init(paymentMethodChart.value);
  const data = paymentMethodData.value.map(item => ({
    name: item._id || '未知',
    value: item.revenue
  }));
  const option = {
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: ¥{c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{ name: '支付方式', type: 'pie', radius: '60%', data }]
  };
  chart.setOption(option);
  window.addEventListener('resize', () => chart.resize());
};

const renderTopCompaniesChart = () => {
  if (!topCompaniesChart.value) return;
  const chart = echarts.init(topCompaniesChart.value);
  const names = topCompaniesData.value.map(item => item.companyName || item._id || '未知企业');
  const revenues = topCompaniesData.value.map(item => item.revenue || 0);
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: names, axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: '收入（元）' },
    series: [{ name: '收入', type: 'bar', data: revenues, itemStyle: { color: '#409EFF' } }]
  };
  chart.setOption(option);
  window.addEventListener('resize', () => chart.resize());
};

const formatMoney = (value) => {
  if (!value) return '0.00';
  return Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const resetFilters = () => {
  initFilters();
  filters.groupBy = 'day';
  loadData();
};

const handleExport = async () => {
  try {
    const params = {
      startDate: filters.startDate,
      endDate: filters.endDate,
      type: 'revenue'
    };
    if (filters.companyId) {
      params.companyId = filters.companyId;
    }
    const response = await exportOperationsData(params);
    const blob = response instanceof Blob ? response : new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `运营收入统计_${filters.startDate}_${filters.endDate}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    proxy.$notifySuccess('数据导出');
  } catch (error) {
    proxy.$notifyError('导出数据', error);
  }
};

onMounted(() => {
  initFilters();
  loadData();
});
</script>

<style scoped>
.operations-revenue {
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
.filter-card {
  margin-bottom: 20px;
}
.chart-card {
  padding: 20px;
}
.chart-section {
  margin-bottom: 40px;
}
.chart-section h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #303133;
  font-weight: 600;
}
.chart-container {
  width: 100%;
  height: 400px;
}
.chart-container-small {
  width: 100%;
  height: 300px;
}
.stats-row {
  margin-bottom: 40px;
}
.table-section {
  margin-top: 30px;
}
.table-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #303133;
  font-weight: 600;
}
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .header-actions {
    width: 100%;
  }
  .chart-container {
    height: 300px;
  }
  .chart-container-small {
    height: 250px;
  }
}
</style>
