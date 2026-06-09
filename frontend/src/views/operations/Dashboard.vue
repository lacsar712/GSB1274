<template>
  <div class="operations-dashboard">
    <div class="page-header">
      <h2>运营统计分析</h2>
      <div class="header-actions">
        <button @click="showFilterDialog" class="btn-filter">
          <i class="icon-filter"></i> 筛选
        </button>
        <button @click="handleExport" class="btn-export">
          <i class="icon-download"></i> 导出数据
        </button>
      </div>
    </div>

    <!-- 筛选条件显示 -->
    <div v-if="hasFilters" class="filter-tags">
      <span v-if="filters.companyId" class="filter-tag">
        企业ID: {{ filters.companyId }}
        <i @click="clearFilter('companyId')" class="icon-close"></i>
      </span>
      <span v-if="filters.startDate" class="filter-tag">
        开始日期: {{ filters.startDate }}
        <i @click="clearFilter('startDate')" class="icon-close"></i>
      </span>
      <span v-if="filters.endDate" class="filter-tag">
        结束日期: {{ filters.endDate }}
        <i @click="clearFilter('endDate')" class="icon-close"></i>
      </span>
      <button @click="clearAllFilters" class="btn-clear-all">清空全部</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="dashboard-content">
      <!-- 核心指标卡片 -->
      <div class="metrics-grid">
        <div class="metric-card companies">
          <div class="metric-icon">
            <i class="icon-building"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ overview.companies?.total || 0 }}</div>
            <div class="metric-label">总企业数</div>
            <div class="metric-sub">活跃: {{ overview.companies?.active || 0 }}</div>
          </div>
        </div>

        <div class="metric-card waybills">
          <div class="metric-icon">
            <i class="icon-document"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ overview.waybills?.total || 0 }}</div>
            <div class="metric-label">总运单数</div>
            <div class="metric-sub">已签收: {{ overview.waybills?.signed || 0 }}</div>
          </div>
        </div>

        <div class="metric-card revenue">
          <div class="metric-icon">
            <i class="icon-money"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">¥{{ formatMoney(overview.revenue?.total) }}</div>
            <div class="metric-label">总收入</div>
            <div class="metric-sub">已收: ¥{{ formatMoney(overview.revenue?.paid) }}</div>
          </div>
        </div>

        <div class="metric-card unpaid">
          <div class="metric-icon">
            <i class="icon-warning"></i>
          </div>
          <div class="metric-content">
            <div class="metric-value">¥{{ formatMoney(overview.revenue?.unpaid) }}</div>
            <div class="metric-label">未收款</div>
            <div class="metric-sub">待收款金额</div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <!-- 运单状态分布 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>运单状态分布</h3>
          </div>
          <div ref="waybillStatusChart" class="chart-container"></div>
        </div>

        <!-- 收入统计 -->
        <div class="chart-card">
          <div class="chart-header">
            <h3>收入统计</h3>
          </div>
          <div ref="revenueChart" class="chart-container"></div>
        </div>
      </div>

      <!-- 详细数据表格 -->
      <div class="data-table-section">
        <h3>运单状态详情</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>状态</th>
              <th>数量</th>
              <th>占比</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in waybillStatusData" :key="item.status">
              <td>{{ item.status }}</td>
              <td>{{ item.count }}</td>
              <td>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: item.percentage + '%' }"></div>
                  <span class="progress-text">{{ item.percentage }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 筛选对话框 -->
    <div v-if="filterDialogVisible" class="dialog-overlay" @click.self="closeFilterDialog">
      <div class="dialog">
        <div class="dialog-header">
          <h3>筛选条件</h3>
          <button @click="closeFilterDialog" class="btn-close">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="applyFilters">
            <div class="form-group">
              <label>企业ID</label>
              <input v-model="tempFilters.companyId" type="text" placeholder="输入企业ID" />
            </div>
            <div class="form-group">
              <label>开始日期</label>
              <input v-model="tempFilters.startDate" type="date" />
            </div>
            <div class="form-group">
              <label>结束日期</label>
              <input v-model="tempFilters.endDate" type="date" />
            </div>
            <div class="form-actions">
              <button type="button" @click="closeFilterDialog" class="btn-cancel">取消</button>
              <button type="submit" class="btn-submit">应用</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { getOperationsOverview, exportOperationsData } from '../../api/statistics';

export default {
  name: 'OperationsDashboard',
  data() {
    return {
      loading: false,
      overview: {
        companies: {},
        waybills: {},
        revenue: {}
      },
      filters: {
        companyId: '',
        startDate: '',
        endDate: ''
      },
      tempFilters: {
        companyId: '',
        startDate: '',
        endDate: ''
      },
      filterDialogVisible: false,
      waybillStatusData: [],
      waybillStatusChart: null,
      revenueChart: null
    };
  },
  computed: {
    hasFilters() {
      return this.filters.companyId || this.filters.startDate || this.filters.endDate;
    }
  },
  mounted() {
    this.loadData();
  },
  beforeUnmount() {
    if (this.waybillStatusChart) {
      this.waybillStatusChart.dispose();
    }
    if (this.revenueChart) {
      this.revenueChart.dispose();
    }
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const params = {};
        if (this.filters.companyId) params.companyId = this.filters.companyId;
        if (this.filters.startDate) params.startDate = this.filters.startDate;
        if (this.filters.endDate) params.endDate = this.filters.endDate;

        const response = await getOperationsOverview(params);
        if (response.data.success) {
          this.overview = response.data.data;
          this.prepareChartData();
          this.$nextTick(() => {
            this.renderCharts();
          });
        }
      } catch (error) {
        console.error('加载数据失败:', error);
        this.$notifyError('加载运营数据', error);
      } finally {
        this.loading = false;
      }
    },
    prepareChartData() {
      const statusMap = {
        pending: '待发货',
        inTransit: '运输中',
        arrived: '已到达',
        signed: '已签收',
        abnormal: '异常',
        cancelled: '已取消'
      };

      this.waybillStatusData = Object.entries(statusMap).map(([key, label]) => {
        const count = this.overview.waybills[key] || 0;
        const total = this.overview.waybills.total || 1;
        return {
          status: label,
          count,
          percentage: ((count / total) * 100).toFixed(2)
        };
      });
    },
    renderCharts() {
      this.renderWaybillStatusChart();
      this.renderRevenueChart();
    },
    renderWaybillStatusChart() {
      const chartDom = this.$refs.waybillStatusChart;
      if (!chartDom) return;

      if (this.waybillStatusChart) {
        this.waybillStatusChart.dispose();
      }

      this.waybillStatusChart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
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
              show: false
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 18,
                fontWeight: 'bold'
              }
            },
            data: this.waybillStatusData.map(item => ({
              name: item.status,
              value: item.count
            }))
          }
        ],
        color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272']
      };

      this.waybillStatusChart.setOption(option);
      window.addEventListener('resize', () => this.waybillStatusChart.resize());
    },
    renderRevenueChart() {
      const chartDom = this.$refs.revenueChart;
      if (!chartDom) return;

      if (this.revenueChart) {
        this.revenueChart.dispose();
      }

      this.revenueChart = echarts.init(chartDom);
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
          name: '金额（元）',
          axisLabel: {
            formatter: (value) => {
              return value >= 10000 ? (value / 10000).toFixed(1) + '万' : value;
            }
          }
        },
        series: [
          {
            name: '已收款',
            type: 'bar',
            data: [this.overview.revenue.paid || 0],
            itemStyle: {
              color: '#67c23a'
            }
          },
          {
            name: '未收款',
            type: 'bar',
            data: [this.overview.revenue.unpaid || 0],
            itemStyle: {
              color: '#e6a23c'
            }
          }
        ]
      };

      this.revenueChart.setOption(option);
      window.addEventListener('resize', () => this.revenueChart.resize());
    },
    showFilterDialog() {
      this.tempFilters = { ...this.filters };
      this.filterDialogVisible = true;
    },
    closeFilterDialog() {
      this.filterDialogVisible = false;
    },
    applyFilters() {
      this.filters = { ...this.tempFilters };
      this.closeFilterDialog();
      this.loadData();
    },
    clearFilter(key) {
      this.filters[key] = '';
      this.loadData();
    },
    clearAllFilters() {
      this.filters = {
        companyId: '',
        startDate: '',
        endDate: ''
      };
      this.loadData();
    },
    async handleExport() {
      try {
        const params = { ...this.filters, type: 'all' };
        const response = await exportOperationsData(params);
        
        const blob = new Blob([JSON.stringify(response.data, null, 2)], {
          type: 'application/json'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `运营统计数据_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.$notifySuccess('数据导出');
      } catch (error) {
        console.error('导出失败:', error);
        this.$notifyError('导出数据', error);
      }
    },
    formatMoney(value) {
      if (!value) return '0.00';
      return Number(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }
};
</script>

<style scoped>
.operations-dashboard {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 28px;
  color: #333;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-filter,
.btn-export {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}

.btn-filter {
  background: white;
  color: #409eff;
  border: 1px solid #409eff;
}

.btn-filter:hover {
  background: #409eff;
  color: white;
}

.btn-export {
  background: #67c23a;
  color: white;
}

.btn-export:hover {
  background: #85ce61;
}

.filter-tags {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #ecf5ff;
  color: #409eff;
  border-radius: 4px;
  font-size: 13px;
}

.filter-tag .icon-close {
  cursor: pointer;
  font-size: 12px;
}

.filter-tag .icon-close:hover {
  color: #f56c6c;
}

.btn-clear-all {
  padding: 6px 12px;
  background: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #999;
  font-size: 16px;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.metric-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.metric-card.companies .metric-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.metric-card.waybills .metric-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.metric-card.revenue .metric-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.metric-card.unpaid .metric-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.metric-sub {
  font-size: 12px;
  color: #999;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.chart-header {
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.chart-container {
  width: 100%;
  height: 350px;
}

.data-table-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.data-table-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
}

.data-table th {
  background: #f5f7fa;
  color: #666;
  font-weight: 600;
  font-size: 14px;
}

.data-table td {
  color: #333;
  font-size: 14px;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 24px;
  background: #f5f7fa;
  border-radius: 12px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
  transition: width 0.3s;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
}

.dialog-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
}

.dialog-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.btn-cancel,
.btn-submit {
  padding: 10px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  border: none;
}

.btn-cancel {
  background: #f5f7fa;
  color: #666;
}

.btn-submit {
  background: #409eff;
  color: white;
}

.btn-submit:hover {
  background: #66b1ff;
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }
}
</style>
