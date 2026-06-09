<template>
  <div class="regulation-statistics">
    <el-card class="mb16" shadow="hover">
      <div class="header">
        <div class="title-group">
          <h2 class="title">监管统计分析</h2>
          <div class="subtitle">违规趋势、类型分布与企业排名</div>
        </div>
        <div class="actions">
          <el-button type="primary" @click="exportData">
            <el-icon class="mr6"><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card class="mb16" shadow="never">
      <el-row :gutter="12" align="middle">
        <el-col :span="10">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            unlink-panels
            :clearable="true"
          />
        </el-col>
        <el-col :span="6">
          <el-select v-model="filters.group_by" placeholder="分组维度" style="width: 100%">
            <el-option label="按月" value="month" />
            <el-option label="按周" value="week" />
            <el-option label="按天" value="day" />
            <el-option label="按年" value="year" />
          </el-select>
        </el-col>
        <el-col :span="8" class="align-right">
          <el-button type="primary" @click="loadData">刷新</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="16" class="mb16" v-if="overview">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">总业务数</div>
          <div class="stat-value">{{ overview.businesses?.total_businesses || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">总抽检数</div>
          <div class="stat-value">{{ overview.inspections?.total_inspections || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">抽检通过率</div>
          <div class="stat-value success">{{ overview.summary?.pass_rate || 0 }}%</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">高风险项</div>
          <div class="stat-value danger">{{ overview.summary?.high_risk_items || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="chart-card">
          <div class="card-title">违规趋势分析</div>
          <div ref="trendChart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="chart-card">
          <div class="card-title">违规类型分布</div>
          <div ref="typeChart" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :xs="24">
        <el-card shadow="never" class="chart-card">
          <div class="card-title">企业违规排名 TOP10</div>
          <div ref="companyChart" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
  </template>

<script>
import * as echarts from 'echarts';
import { getOverview, getViolations, exportStatistics } from '@/api/regulationStatistics';
import { Download } from '@element-plus/icons-vue';

export default {
  name: 'RegulationStatistics',
  data() {
    return {
      overview: null,
      violations: null,
      filters: {
        dateRange: [],
        group_by: 'month'
      },
      charts: {
        trend: null,
        type: null,
        company: null
      }
    };
  },
  mounted() {
    this.resetFilters();
    this.loadData();
    window.addEventListener('resize', this.resizeCharts);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.resizeCharts);
    Object.values(this.charts).forEach(c => c && c.dispose());
  },
  methods: {
    resetFilters() {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      const f = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const da = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${da}`;
      };
      this.filters.dateRange = [f(start), f(end)];
      this.filters.group_by = 'month';
    },
    normalizedParams() {
      const p = { group_by: this.filters.group_by };
      if (this.filters.dateRange && this.filters.dateRange.length === 2) {
        p.start_date = this.filters.dateRange[0];
        p.end_date = this.filters.dateRange[1];
      }
      return p;
    },
    async loadData() {
      await Promise.all([this.loadOverview(), this.loadViolations()]);
    },
    async loadOverview() {
      try {
        const response = await getOverview(this.normalizedParams());
        if (response.success) {
          this.overview = response.data || this.defaultOverview();
        }
      } catch (error) {
        this.overview = this.defaultOverview();
        this.$notifyError('加载概览数据', error);
      }
    },
    async loadViolations() {
      try {
        const response = await getViolations(this.normalizedParams());
        if (response.success) {
          this.violations = this.normalizeViolations(response.data);
          this.$nextTick(() => this.initCharts());
        }
      } catch (error) {
        this.violations = this.defaultViolations();
        this.$nextTick(() => this.initCharts());
        this.$notifyError('加载违规数据', error);
      }
    },
    defaultOverview() {
      return {
        businesses: { total_businesses: 0, active_businesses: 0 },
        inspections: { total_inspections: 0, ongoing_inspections: 0 },
        summary: { pass_rate: 0, high_risk_items: 0 }
      };
    },
    generatePeriods() {
      const periods = [];
      const [startStr, endStr] = this.filters.dateRange || [];
      if (!startStr || !endStr) return periods;
      const start = new Date(startStr);
      const end = new Date(endStr);
      const group = this.filters.group_by || 'month';
      const pad = (n) => String(n).padStart(2, '0');
      if (group === 'day') {
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          periods.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
        }
      } else if (group === 'week') {
        // 简化：按周序号，使用起始日期每+7天一段
        let d = new Date(start);
        while (d <= end) {
          const y = d.getFullYear();
          const m = pad(d.getMonth() + 1);
          const day = pad(d.getDate());
          periods.push(`${y}-W${m}${day}`);
          d.setDate(d.getDate() + 7);
        }
      } else if (group === 'year') {
        for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
          periods.push(String(y));
        }
      } else {
        // month
        let y = start.getFullYear();
        let m = start.getMonth() + 1;
        const endY = end.getFullYear();
        const endM = end.getMonth() + 1;
        while (y < endY || (y === endY && m <= endM)) {
          periods.push(`${y}-${pad(m)}`);
          m++;
          if (m > 12) { m = 1; y++; }
        }
      }
      return periods;
    },
    defaultViolations() {
      const periods = this.generatePeriods();
      return {
        time_series: periods.map(p => ({ period: p, total: 0, violations: 0 })),
        by_type: [],
        by_company: []
      };
    },
    normalizeViolations(data) {
      if (!data || (!data.time_series && !data.by_type && !data.by_company)) {
        return this.defaultViolations();
      }
      const base = this.defaultViolations();
      const out = {
        time_series: Array.isArray(data.time_series) ? data.time_series : base.time_series,
        by_type: Array.isArray(data.by_type) ? data.by_type : base.by_type,
        by_company: Array.isArray(data.by_company) ? data.by_company : base.by_company
      };
      if (!out.time_series || out.time_series.length === 0) {
        out.time_series = base.time_series;
      }
      if (!out.by_type || out.by_type.length === 0) {
        out.by_type = [
          { inspection_type: 'routine', total: 0, violations: 0, violation_rate: 0 },
          { inspection_type: 'special', total: 0, violations: 0, violation_rate: 0 },
          { inspection_type: 'random', total: 0, violations: 0, violation_rate: 0 }
        ];
      }
      return out;
    },
    initCharts() {
      this.initTrendChart();
      this.initTypeChart();
      this.initCompanyChart();
    },
    resizeCharts() {
      Object.values(this.charts).forEach(c => c && c.resize());
    },
    baseColors() {
      return {
        primary: '#0f3460',
        accent: '#00d4ff',
        danger: '#f56c6c',
        success: '#4caf50'
      };
    },
    initTrendChart() {
      if (!this.violations?.time_series) return;
      if (this.charts.trend) this.charts.trend.dispose();
      this.charts.trend = echarts.init(this.$refs.trendChart);
      const colors = this.baseColors();
      const option = {
        color: [colors.accent, colors.danger],
        tooltip: { trigger: 'axis' },
        legend: { data: ['总数', '违规数'] },
        xAxis: {
          type: 'category',
          data: (this.violations.time_series || []).map(i => i.period),
          axisLine: { lineStyle: { color: '#bcd3ff' } }
        },
        yAxis: { type: 'value', axisLine: { lineStyle: { color: '#bcd3ff' } } },
        series: [
          {
            name: '总数',
            type: 'line',
            data: (this.violations.time_series || []).map(i => i.total),
            smooth: true
          },
          {
            name: '违规数',
            type: 'line',
            data: (this.violations.time_series || []).map(i => i.violations),
            smooth: true
          }
        ]
      };
      this.charts.trend.setOption(option);
    },
    initTypeChart() {
      if (!this.violations?.by_type) return;
      if (this.charts.type) this.charts.type.dispose();
      this.charts.type = echarts.init(this.$refs.typeChart);
      const colors = [ '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4' ];
      const option = {
        color: colors,
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: 'horizontal', bottom: 0 },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            label: { show: true, formatter: '{b}: {d}%' },
            data: (this.violations.by_type || []).map(item => ({
              name: this.getInspectionTypeLabel(item.inspection_type),
              value: item.violations
            }))
          }
        ]
      };
      this.charts.type.setOption(option);
    },
    initCompanyChart() {
      if (!this.violations?.by_company) return;
      if (this.charts.company) this.charts.company.dispose();
      this.charts.company = echarts.init(this.$refs.companyChart);
      const colors = this.baseColors();
      const companies = (this.violations.by_company || []).map(i => i.company_name);
      const values = (this.violations.by_company || []).map(i => i.violations);
      const hasData = companies.length > 0;
      const yCats = hasData ? companies : ['暂无企业数据'];
      const seriesVals = hasData ? values : [0];
      const option = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'value' },
        yAxis: {
          type: 'category',
          data: yCats
        },
        series: [
          {
            name: '违规数',
            type: 'bar',
            data: seriesVals,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: colors.danger },
                { offset: 1, color: '#ff9800' }
              ])
            }
          }
        ]
      };
      this.charts.company.setOption(option);
    },
    async exportData() {
      try {
        const params = { ...this.normalizedParams(), type: 'overview' };
        const response = await exportStatistics(params);
        const blob = response instanceof Blob ? response : new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const namePart = params.start_date && params.end_date ? `${params.start_date}_${params.end_date}` : 'all';
        link.href = url;
        link.setAttribute('download', `regulation_statistics_${namePart}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.$notifySuccess('导出数据');
      } catch (error) {
        this.$notifyError('导出数据', error);
      }
    },
    getInspectionTypeLabel(type) {
      const labels = { routine: '常规抽检', special: '专项抽检', random: '随机抽检' };
      return labels[type] || type;
    }
  }
};
</script>

<style scoped>
.mb16 { margin-bottom: 16px; }
.mr6 { margin-right: 6px; }
.align-right { text-align: right; }
.regulation-statistics { padding: 0; }
.header { display: flex; align-items: center; justify-content: space-between; }
.title-group { display: flex; flex-direction: column; }
.title { margin: 0; font-size: 20px; color: #0f3460; }
.subtitle { color: #606266; font-size: 13px; margin-top: 4px; }
.stat-card { text-align: center; }
.stat-label { font-size: 13px; color: #666; margin-bottom: 8px; }
.stat-value { font-size: 26px; font-weight: 700; color: #333; }
.stat-value.success { color: #4caf50; }
.stat-value.danger { color: #f56c6c; }
.chart-card { min-height: 460px; }
.card-title { font-size: 15px; font-weight: 600; margin-bottom: 8px; color: #0f3460; }
.chart { width: 100%; height: 400px; }
</style>
