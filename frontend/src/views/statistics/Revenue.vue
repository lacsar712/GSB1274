<template>
  <div class="revenue-statistics">
    <div class="page-header">
      <h1>收入统计分析</h1>
      <div class="header-actions">
        <el-select v-model="selectedCompanyId" placeholder="选择企业" @change="loadData">
          <el-option
            v-for="company in companies"
            :key="company.id"
            :label="company.name"
            :value="company.id"
          />
        </el-select>
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
      <!-- 收入趋势图 -->
      <div class="chart-section">
            <h3>收入趋势</h3>
            <div v-if="hasRevenueTrend" ref="revenueTrendChart" class="chart-container"></div>
            <el-empty v-else description="暂无收入趋势数据" />
      </div>

      <!-- 支付方式统计 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="24" :md="12">
          <div class="chart-section">
            <h3>支付方式分布</h3>
            <div v-if="hasPaymentMethod" ref="paymentMethodChart" class="chart-container-small"></div>
            <el-empty v-else description="暂无支付方式数据" />
          </div>
        </el-col>

        <el-col :xs="24" :md="12">
          <div class="chart-section">
            <h3>货物类型收入</h3>
            <div v-if="hasCargoType" ref="cargoTypeChart" class="chart-container-small"></div>
            <el-empty v-else description="暂无货物类型数据" />
          </div>
        </el-col>
      </el-row>

      <!-- 详细数据表格 -->

      <!-- 详细数据表格 -->
      <div class="table-section">
        <h3>收入明细</h3>
        <el-table v-if="revenueDetailData.length" :data="revenueDetailData" border stripe>
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
        <el-empty v-else description="暂无收入明细数据" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, getCurrentInstance, computed } from 'vue';
import * as echarts from 'echarts';
import { getRevenueStatistics, exportStatistics } from '@/api/statistics';
import { getCompanyList } from '@/api/company';


const { proxy } = getCurrentInstance();
const loading = ref(false);
const selectedCompanyId = ref('');
const companies = ref([]);

// 筛选条件
const filters = reactive({
  startDate: '',
  endDate: '',
  groupBy: 'day'
});

// 图表引用
const revenueTrendChart = ref(null);
const paymentMethodChart = ref(null);
const cargoTypeChart = ref(null);

// 收入明细数据
const revenueDetailData = ref([]);
const paymentMethodData = ref([]);
const cargoTypeData = ref([]);

// 加载企业列表
const loadCompanies = async () => {
  try {
    const response = await getCompanyList({ status: 'approved' });
    companies.value = response.data || [];
    if (companies.value.length > 0) {
      selectedCompanyId.value = companies.value[0].id;
      initFilters();
      await loadData();
    }
  } catch (error) {
    proxy.$notifyError('加载企业列表', error);
  }
};

// 初始化筛选条件
const initFilters = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  
  filters.endDate = end.toISOString().split('T')[0];
  filters.startDate = start.toISOString().split('T')[0];
};

// 加载统计数据
const loadData = async () => {
  if (!selectedCompanyId.value) return;

  loading.value = true;
  try {
    const response = await getRevenueStatistics(selectedCompanyId.value, {
      startDate: filters.startDate,
      endDate: filters.endDate,
      groupBy: filters.groupBy
    });

    if (!response.success) {
      proxy.$notifyError('加载统计数据', new Error(response.message || '请求失败'));
      return;
    }
    const data = response.data;

    // 处理收入趋势数据
    revenueDetailData.value = data.trend.map(item => ({
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

    // 处理支付方式数据
    paymentMethodData.value = data.paymentMethod;

    // 处理货物类型数据
    cargoTypeData.value = data.cargoType;

    // 渲染图表
    await nextTick();
    renderCharts();
  } catch (error) {
    proxy.$notifyError('加载统计数据', error);
  } finally {
    loading.value = false;
  }
};

// 渲染所有图表
const renderCharts = () => {
  renderRevenueTrendChart();
  renderPaymentMethodChart();
  renderCargoTypeChart();
};

const hasRevenueTrend = computed(() => revenueDetailData.value && revenueDetailData.value.length > 0);
const hasPaymentMethod = computed(() => paymentMethodData.value && paymentMethodData.value.length > 0);
const hasCargoType = computed(() => cargoTypeData.value && cargoTypeData.value.length > 0);

// 渲染收入趋势图
const renderRevenueTrendChart = () => {
  if (!revenueTrendChart.value) return;

  const chart = echarts.init(revenueTrendChart.value);
  const dates = revenueDetailData.value.map(item => item.date);
  const totalRevenue = revenueDetailData.value.map(item => item.totalRevenue);
  const paidRevenue = revenueDetailData.value.map(item => item.paidRevenue);
  const unpaidRevenue = revenueDetailData.value.map(item => item.unpaidRevenue);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['总收入', '已收款', '未收款']
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
      type: 'value',
      name: '金额（元）'
    },
    series: [
      {
        name: '总收入',
        type: 'line',
        data: totalRevenue,
        smooth: true,
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        }
      },
      {
        name: '已收款',
        type: 'line',
        data: paidRevenue,
        smooth: true,
        itemStyle: {
          color: '#67C23A'
        }
      },
      {
        name: '未收款',
        type: 'line',
        data: unpaidRevenue,
        smooth: true,
        itemStyle: {
          color: '#E6A23C'
        }
      }
    ]
  };

  chart.setOption(option);
  window.addEventListener('resize', () => chart.resize());
};

// 渲染支付方式饼图
const renderPaymentMethodChart = () => {
  if (!paymentMethodChart.value) return;

  const chart = echarts.init(paymentMethodChart.value);
  const data = paymentMethodData.value.map(item => ({
    name: item._id || '未知',
    value: item.revenue
  }));

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        name: '支付方式',
        type: 'pie',
        radius: '60%',
        data: data,
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

  chart.setOption(option);
  window.addEventListener('resize', () => chart.resize());
};

// 渲染货物类型柱状图
const renderCargoTypeChart = () => {
  if (!cargoTypeChart.value) return;

  const chart = echarts.init(cargoTypeChart.value);
  const categories = cargoTypeData.value.map(item => item._id || '未知');
  const revenues = cargoTypeData.value.map(item => item.revenue);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: ¥{c}'
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      name: '收入（元）'
    },
    series: [
      {
        name: '收入',
        type: 'bar',
        data: revenues,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2378f7' },
              { offset: 0.7, color: '#2378f7' },
              { offset: 1, color: '#83bff6' }
            ])
          }
        }
      }
    ]
  };

  chart.setOption(option);
  window.addEventListener('resize', () => chart.resize());
};

// 格式化金额
const formatMoney = (value) => {
  if (!value) return '0.00';
  return Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// 重置筛选条件
const resetFilters = () => {
  initFilters();
  filters.groupBy = 'day';
  loadData();
};

// 导出数据
const handleExport = async () => {
  if (!selectedCompanyId.value) {
    proxy.$notifyWarning('请先选择企业');
    return;
  }

  try {
    const response = await exportStatistics(selectedCompanyId.value, {
      startDate: filters.startDate,
      endDate: filters.endDate,
      type: 'revenue'
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
    link.download = `收入统计_${filters.startDate}_${filters.endDate}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    proxy.$notifySuccess('数据导出');
  } catch (error) {
    proxy.$notifyError('导出数据', error);
  }
};

onMounted(() => {
  loadCompanies();
});
</script>

<style scoped>
.revenue-statistics {
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
