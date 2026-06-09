<template>
  <div class="regulation-dashboard" :class="{ 'dark-theme': isDarkTheme }">
    <div class="dashboard-header">
      <h1>监管服务大屏</h1>
      <div class="header-info">
        <span class="time">{{ currentTime }}</span>
        <button @click="toggleFullscreen" class="btn-icon">
          全屏
        </button>
      </div>
    </div>

    <el-row :gutter="12" class="toolbar">
      <el-col :xs="24" :md="12">
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          unlink-panels
          :clearable="true"
          style="width: 100%"
        />
      </el-col>
      <el-col :xs="24" :md="12" class="align-right mt8-md">
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="handleRefresh">刷新</el-button>
        <el-button type="success" @click="exportCurrentData">导出数据</el-button>
      </el-col>
    </el-row>

    <div class="dashboard-content">
      <!-- 顶部实时统计 -->
      <div class="top-stats">
        <div class="stat-box" v-if="dashboardData.realtime">
          <div class="stat-title">总业务数</div>
          <div class="stat-number">{{ dashboardData.realtime.total_businesses || 0 }}</div>
          <div class="stat-sub">活跃: {{ dashboardData.realtime.active_businesses || 0 }}</div>
        </div>
        <div class="stat-box" v-if="dashboardData.realtime">
          <div class="stat-title">总抽检数</div>
          <div class="stat-number">{{ dashboardData.realtime.total_inspections || 0 }}</div>
          <div class="stat-sub">进行中: {{ dashboardData.realtime.ongoing_inspections || 0 }}</div>
        </div>
        <div class="stat-box" v-if="dashboardData.realtime">
          <div class="stat-title">总运单数</div>
          <div class="stat-number">{{ dashboardData.realtime.total_waybills || 0 }}</div>
          <div class="stat-sub">待审核: {{ dashboardData.realtime.pending_waybills || 0 }}</div>
        </div>
        <div class="stat-box danger" v-if="dashboardData.realtime">
          <div class="stat-title">高风险项</div>
          <div class="stat-number">
            {{ (dashboardData.realtime.high_risk_businesses || 0) + (dashboardData.realtime.high_risk_waybills || 0) }}
          </div>
          <div class="stat-sub">需关注</div>
        </div>
      </div>

      <!-- 中间图表区域 -->
      <div class="charts-row">
        <!-- 趋势图 -->
        <div class="chart-panel">
          <div class="panel-title">近7天趋势</div>
          <div ref="trendChart" class="chart"></div>
        </div>

        <!-- 风险分布 -->
        <div class="chart-panel">
          <div class="panel-title">风险分布</div>
          <div ref="riskChart" class="chart"></div>
        </div>

        <!-- 抽检结果 -->
        <div class="chart-panel">
          <div class="panel-title">抽检结果</div>
          <div ref="inspectionChart" class="chart"></div>
        </div>
      </div>

      <!-- 底部信息区域 -->
      <div class="bottom-row">
        <!-- TOP企业 -->
        <div class="info-panel">
          <div class="panel-title">TOP企业（按业务数）</div>
          <div class="company-list">
            <div v-for="(company, index) in dashboardData.top_companies" :key="index" class="company-item">
              <span class="rank">{{ index + 1 }}</span>
              <span class="name">{{ company.company_name }}</span>
              <span class="count">{{ company.business_count }}</span>
              <span class="risk" v-if="company.high_risk_count > 0">
                高风险: {{ company.high_risk_count }}
              </span>
            </div>
          </div>
        </div>

        <!-- 最近抽检 -->
        <div class="info-panel">
          <div class="panel-title">最近抽检记录</div>
          <div class="inspection-list">
            <div v-for="(inspection, index) in dashboardData.recent_inspections" :key="index" class="inspection-item">
              <div class="inspection-info">
                <span class="code">{{ inspection.inspection_code }}</span>
                <span class="company">{{ inspection.company_name }}</span>
              </div>
              <span :class="['status', `status-${inspection.result}`]">
                {{ getResultLabel(inspection.result) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 预警信息 -->
        <div class="info-panel">
          <div class="panel-title">预警信息</div>
          <div class="alert-list">
            <div v-for="(alert, index) in dashboardData.alerts" :key="index" class="alert-item">
              <span :class="['alert-icon', `icon-${alert.type}`]">!</span>
              <div class="alert-content">
                <div class="alert-title">{{ norm(alert.title) }}</div>
                <div class="alert-message">{{ norm(alert.message) }}</div>
              </div>
              <span class="alert-time">{{ formatTime(alert.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { getDashboardData } from '@/api/regulationDashboard';

export default {
  name: 'RegulationDashboard',
  data() {
    return {
      dashboardData: {
        realtime: null,
        trend: [],
        risk_distribution: [],
        inspection_result: [],
        top_companies: [],
        recent_inspections: [],
        alerts: []
      },
      currentTime: '',
      isDarkTheme: true,
      refreshTimer: null,
      charts: {
        trend: null,
        risk: null,
        inspection: null
      },
      filters: {
        dateRange: []
      }
    };
  },
  mounted() {
    this.updateTime();
    this.loadData();
    this.startAutoRefresh();
    
    // 更新时间
    setInterval(() => {
      this.updateTime();
    }, 1000);
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    this.stopAutoRefresh();
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.dispose();
    });
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    normalizedParams() {
      const p = {};
      if (this.filters.dateRange && this.filters.dateRange.length === 2) {
        p.start_date = this.filters.dateRange[0];
        p.end_date = this.filters.dateRange[1];
      }
      return p;
    },
    async loadData() {
      try {
        const response = await getDashboardData(this.normalizedParams());
        if (response.success) {
          this.dashboardData = response.data;
          this.$nextTick(() => {
            this.initCharts();
          });
        }
      } catch (error) {
        this.$notifyError('加载大屏数据', error);
      }
    },
    handleQuery() {
      this.loadData();
      this.$notifySuccess('已应用筛选');
    },
    handleRefresh() {
      this.loadData();
      this.$notifySuccess('已刷新大屏数据');
    },
    exportCurrentData() {
      try {
        const data = this.dashboardData || {};
        const name = (() => {
          const dr = this.filters.dateRange || [];
          if (dr.length === 2) return `reg-dashboard-${dr[0]}_${dr[1]}.json`;
          return 'reg-dashboard.json';
        })();
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.$notifySuccess('已导出当前数据');
      } catch (e) {
        this.$notifyError('导出大屏数据', e);
      }
    },
    norm(text) {
      if (typeof text !== 'string') return text;
      try {
        const chars = [...text];
        const bad = chars.filter(c => c === '\uFFFD').length;
        const ratio = bad / Math.max(1, chars.length);
        if (bad > 0 && ratio > 0.2) return '内容不可读（待清洗）';
        const suspicious = /[ÃÂÅÆÇãâåæçéèêëíïñóöúüœ�]/.test(text);
        if (!suspicious) return text;
        const bytes = new Uint8Array(chars.map(c => c.charCodeAt(0)));
        const decoder = new TextDecoder('utf-8');
        const decoded = decoder.decode(bytes);
        const dBad = [...decoded].filter(c => c === '\uFFFD').length;
        const dRatio = dBad / Math.max(1, decoded.length);
        return dBad > 0 && dRatio > 0.2 ? '内容不可读（待清洗）' : decoded;
      } catch (e) {
        try {
          return decodeURIComponent(escape(text));
        } catch (_) {
          return text;
        }
      }
    },
    initCharts() {
      this.initTrendChart();
      this.initRiskChart();
      this.initInspectionChart();
    },
    handleResize() {
      try {
        if (this.charts.trend) this.charts.trend.resize();
        if (this.charts.risk) this.charts.risk.resize();
        if (this.charts.inspection) this.charts.inspection.resize();
      } catch (_) {}
    },
    initTrendChart() {
      if (!this.dashboardData.trend) return;

      if (this.charts.trend) {
        this.charts.trend.dispose();
      }

      this.charts.trend = echarts.init(this.$refs.trendChart, 'dark');

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['业务', '抽检', '运单'],
          textStyle: { color: '#fff' }
        },
        xAxis: {
          type: 'category',
          data: this.dashboardData.trend.map(item => item.date),
          axisLine: { lineStyle: { color: '#666' } },
          axisLabel: { color: '#999' }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#666' } },
          axisLabel: { color: '#999' },
          splitLine: { lineStyle: { color: '#333' } }
        },
        series: [
          {
            name: '业务',
            type: 'line',
            data: this.dashboardData.trend.map(item => item.businesses),
            smooth: true,
            itemStyle: { color: '#409eff' }
          },
          {
            name: '抽检',
            type: 'line',
            data: this.dashboardData.trend.map(item => item.inspections),
            smooth: true,
            itemStyle: { color: '#67c23a' }
          },
          {
            name: '运单',
            type: 'line',
            data: this.dashboardData.trend.map(item => item.waybills),
            smooth: true,
            itemStyle: { color: '#e6a23c' }
          }
        ]
      };

      this.charts.trend.setOption(option);
    },
    initRiskChart() {
      if (!this.dashboardData.risk_distribution) return;

      if (this.charts.risk) {
        this.charts.risk.dispose();
      }

      this.charts.risk = echarts.init(this.$refs.riskChart, 'dark');

      const option = {
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#1a1a1a',
              borderWidth: 2
            },
            label: {
              show: true,
              color: '#fff'
            },
            data: this.dashboardData.risk_distribution.map(item => ({
              name: this.getRiskLabel(item.risk_level),
              value: item.count,
              itemStyle: {
                color: this.getRiskColor(item.risk_level)
              }
            }))
          }
        ]
      };

      this.charts.risk.setOption(option);
    },
    initInspectionChart() {
      if (!this.dashboardData.inspection_result) return;

      if (this.charts.inspection) {
        this.charts.inspection.dispose();
      }

      this.charts.inspection = echarts.init(this.$refs.inspectionChart, 'dark');

      const option = {
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            type: 'pie',
            radius: '70%',
            data: this.dashboardData.inspection_result.map(item => ({
              name: this.getResultLabel(item.result),
              value: item.count,
              itemStyle: {
                color: item.result === 'passed' ? '#67c23a' : '#f56c6c'
              }
            })),
            label: {
              show: true,
              color: '#fff',
              formatter: '{b}: {d}%'
            }
          }
        ]
      };

      this.charts.inspection.setOption(option);
    },
    startAutoRefresh() {
      this.refreshTimer = setInterval(() => {
        this.loadData();
      }, 30000); // 30秒刷新一次
    },
    stopAutoRefresh() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
      }
    },
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },
    getRiskLabel(level) {
      const labels = { low: '低风险', medium: '中风险', high: '高风险' };
      return labels[level] || level;
    },
    getRiskColor(level) {
      const colors = { low: '#67c23a', medium: '#e6a23c', high: '#f56c6c' };
      return colors[level] || '#999';
    },
    getResultLabel(result) {
      const labels = { passed: '通过', failed: '未通过', pending: '待审核' };
      return labels[result] || result;
    },
    formatTime(date) {
      if (!date) return '';
      if (date instanceof Date && !isNaN(date)) {
        const m = date.getMonth() + 1;
        const d = date.getDate();
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        return `${m}-${d} ${hh}:${mm}`;
      }
      if (typeof date === 'string') {
        const m = date.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
        if (m) {
          const y = parseInt(m[1]); const mo = parseInt(m[2]); const da = parseInt(m[3]);
          const hh = parseInt(m[4]); const mm = parseInt(m[5]);
          const dt = new Date(y, mo - 1, da, hh, mm, 0);
          const mon = dt.getMonth() + 1;
          const day = dt.getDate();
          const hhs = String(dt.getHours()).padStart(2, '0');
          const mms = String(dt.getMinutes()).padStart(2, '0');
          return `${mon}-${day} ${hhs}:${mms}`;
        }
        const dt = new Date(date);
        if (!isNaN(dt)) {
          const mon = dt.getMonth() + 1;
          const day = dt.getDate();
          const hhs = String(dt.getHours()).padStart(2, '0');
          const mms = String(dt.getMinutes()).padStart(2, '0');
          return `${mon}-${day} ${hhs}:${mms}`;
        }
      }
      return '';
    }
  }
};
</script>

<style scoped>
.regulation-dashboard {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.toolbar { margin-bottom: 12px; }
.align-right { text-align: right; }
.mt8-md { margin-top: 8px; }

.regulation-dashboard.dark-theme {
  color: #fff;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #0f3460;
}

.dashboard-header h1 {
  font-size: 32px;
  font-weight: bold;
  background: linear-gradient(90deg, #00d4ff, #0099ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.time {
  font-size: 18px;
  color: #00d4ff;
  font-family: 'Courier New', monospace;
}

.btn-icon {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid #00d4ff;
  color: #00d4ff;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.top-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-box {
  background: rgba(15, 52, 96, 0.6);
  border: 1px solid #0f3460;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.stat-box.danger {
  border-color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);
}

.stat-title {
  font-size: 14px;
  color: #999;
  margin-bottom: 10px;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  color: #00d4ff;
  margin-bottom: 8px;
}

.stat-box.danger .stat-number {
  color: #f56c6c;
}

.stat-sub {
  font-size: 12px;
  color: #666;
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.chart-panel {
  background: rgba(15, 52, 96, 0.6);
  border: 1px solid #0f3460;
  border-radius: 8px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #00d4ff;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #0f3460;
}

.chart {
  width: 100%;
  height: 300px;
}

.bottom-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.info-panel {
  background: rgba(15, 52, 96, 0.6);
  border: 1px solid #0f3460;
  border-radius: 8px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.company-list,
.inspection-list,
.alert-list {
  max-height: 300px;
  overflow-y: auto;
}

.company-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.rank {
  width: 24px;
  height: 24px;
  background: #0f3460;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #00d4ff;
}

.company-item .name {
  flex: 1;
  color: #fff;
}

.company-item .count {
  color: #00d4ff;
  font-weight: bold;
}

.company-item .risk {
  color: #f56c6c;
  font-size: 12px;
}

.inspection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.inspection-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.inspection-info .code {
  color: #00d4ff;
  font-weight: 500;
}

.inspection-info .company {
  color: #999;
  font-size: 12px;
}

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.status-passed {
  background: rgba(103, 194, 58, 0.2);
  color: #67c23a;
}

.status-failed {
  background: rgba(245, 108, 108, 0.2);
  color: #f56c6c;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  margin-bottom: 8px;
  background: rgba(245, 108, 108, 0.1);
  border-left: 3px solid #f56c6c;
  border-radius: 4px;
}

.alert-icon {
  width: 24px;
  height: 24px;
  background: #f56c6c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #fff;
}

.alert-content {
  flex: 1;
}

.alert-title {
  color: #fff;
  font-weight: 500;
  margin-bottom: 4px;
}

.alert-message {
  color: #999;
  font-size: 12px;
}

.alert-time {
  color: #666;
  font-size: 12px;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}

::-webkit-scrollbar-thumb {
  background: #0f3460;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #00d4ff;
}
</style>
