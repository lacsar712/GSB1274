<template>
  <div class="regulation-waybill-list">
    <el-card class="mb12" shadow="hover">
      <div class="page-header">
        <h2>监管运单管理</h2>
      </div>
    </el-card>

    <el-card class="mb12" shadow="never">
      <el-row :gutter="10" class="filter-row" align="middle">
        <el-col :xs="24" :md="8">
          <el-input
            v-model="filters.search"
            placeholder="搜索运单号或货物名称"
            clearable
            @keyup.enter="loadWaybills"
          />
        </el-col>
        <el-col :xs="12" :md="4">
          <el-select v-model="filters.regulation_status" placeholder="监管状态" clearable style="width: 100%">
            <el-option label="待审核" value="pending" />
            <el-option label="已批准" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-col>
        <el-col :xs="12" :md="4">
          <el-select v-model="filters.risk_level" placeholder="风险等级" clearable style="width: 100%">
            <el-option label="低风险" value="low" />
            <el-option label="中风险" value="medium" />
            <el-option label="高风险" value="high" />
          </el-select>
        </el-col>
        <el-col :xs="24" :md="8">
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
        <el-col :xs="24" :md="8" class="align-right mt8-md">
          <el-button type="primary" @click="loadWaybills">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-row :gutter="12" class="mb12" v-if="statistics">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">总运单数</div>
          <div class="stat-value">{{ statistics.total || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">待审核</div>
          <div class="stat-value warning">{{ statistics.pending_count || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">高风险运单</div>
          <div class="stat-value danger">{{ statistics.high_risk_count || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <el-table :data="waybills" border stripe>
        <el-table-column prop="waybill_number" label="运单号" min-width="140" />
        <el-table-column prop="company_name" label="企业名称" min-width="140" />
        <el-table-column prop="cargo_name" label="货物名称" min-width="140" />
        <el-table-column prop="driver_name" label="司机" min-width="120" />
        <el-table-column prop="vehicle_plate" label="车牌号" min-width="120" />
        <el-table-column label="监管状态" min-width="120">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.regulation_status)">
              {{ getRegulationStatusLabel(row.regulation_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="风险等级" min-width="120">
          <template #default="{ row }">
            <el-tag :type="riskTagType(row.risk_level)">
              {{ getRiskLevelLabel(row.risk_level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row.id)">查看</el-button>
            <el-button link @click="updateStatus(row.id)">更新状态</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="no-data">暂无数据</div>
        </template>
      </el-table>
      <div class="pagination">
        <el-button @click="prevPage" :disabled="currentPage === 1">上一页</el-button>
        <span class="page-info">第 {{ currentPage }} 页</span>
        <el-button @click="nextPage" :disabled="waybills.length < pageSize">下一页</el-button>
      </div>
    </el-card>

    <el-dialog v-model="showDialog" title="更新监管状态" width="520px">
      <el-form :model="updateData" label-position="top">
        <el-form-item label="监管状态">
          <el-select v-model="updateData.regulation_status" placeholder="选择状态" style="width: 100%">
            <el-option label="待审核" value="pending" />
            <el-option label="已批准" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="风险等级">
          <el-select v-model="updateData.risk_level" placeholder="选择等级" style="width: 100%">
            <el-option label="低风险" value="low" />
            <el-option label="中风险" value="medium" />
            <el-option label="高风险" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item label="监管备注">
          <el-input v-model="updateData.regulation_notes" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="监管结果">
          <el-input v-model="updateData.regulation_result" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitUpdate">更新</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getRegulationWaybills, updateRegulationWaybill, getRegulationWaybillStatistics } from '@/api/regulationWaybill';

export default {
  name: 'RegulationWaybillList',
  data() {
    return {
      waybills: [],
      statistics: null,
      filters: {
        search: '',
        regulation_status: '',
        risk_level: '',
        dateRange: []
      },
      currentPage: 1,
      pageSize: 20,
      showDialog: false,
      currentWaybillId: null,
      updateData: {
        regulation_status: '',
        risk_level: '',
        regulation_notes: '',
        regulation_result: ''
      }
    };
  },
  mounted() {
    this.loadWaybills();
    this.loadStatistics();
  },
  methods: {
    normalizedParams() {
      const p = {
        search: this.filters.search,
        regulation_status: this.filters.regulation_status,
        risk_level: this.filters.risk_level
      };
      if (this.filters.dateRange?.length === 2) {
        p.start_date = this.filters.dateRange[0];
        p.end_date = this.filters.dateRange[1];
      }
      return p;
    },
    async loadWaybills() {
      try {
        const params = {
          ...this.normalizedParams(),
          limit: this.pageSize,
          offset: (this.currentPage - 1) * this.pageSize
        };
        const response = await getRegulationWaybills(params);
        if (response.success) {
          const norm = (text) => {
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
          };
          this.waybills = (response.data || []).map(w => ({
            ...w,
            company_name: norm(w.company_name),
            cargo_name: norm(w.cargo_name),
            driver_name: norm(w.driver_name),
            vehicle_plate: norm(w.vehicle_plate),
            regulation_notes: norm(w.regulation_notes || ''),
            regulation_result: norm(w.regulation_result || '')
          }));
        }
      } catch (error) {
        this.$notifyError('加载监管运单列表', error);
      }
    },
    async loadStatistics() {
      try {
        const response = await getRegulationWaybillStatistics(this.normalizedParams());
        if (response.success) {
          this.statistics = response.data;
        }
      } catch (error) {
        this.$notifyError('加载统计数据', error);
      }
    },
    resetFilters() {
      this.filters = {
        search: '',
        regulation_status: '',
        risk_level: '',
        dateRange: []
      };
      this.currentPage = 1;
      this.loadWaybills();
      this.loadStatistics();
    },
    updateStatus(id) {
      const waybill = this.waybills.find(w => w.id === id);
      if (waybill) {
        this.currentWaybillId = id;
        this.updateData = {
          regulation_status: waybill.regulation_status || 'pending',
          risk_level: waybill.risk_level || 'low',
          regulation_notes: waybill.regulation_notes || '',
          regulation_result: waybill.regulation_result || ''
        };
        this.showDialog = true;
      }
    },
    async submitUpdate() {
      try {
        await updateRegulationWaybill(this.currentWaybillId, this.updateData);
        this.$notifySuccess('更新监管状态');
        this.closeDialog();
        this.loadWaybills();
        this.loadStatistics();
      } catch (error) {
        this.$notifyError('更新监管状态', error);
      }
    },
    viewDetail(id) {
      this.$router.push(`/regulation/waybills/${id}`);
    },
    closeDialog() {
      this.showDialog = false;
      this.currentWaybillId = null;
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadWaybills();
      }
    },
    nextPage() {
      this.currentPage++;
      this.loadWaybills();
    },
    getRegulationStatusLabel(status) {
      const labels = {
        pending: '待审核',
        approved: '已批准',
        rejected: '已拒绝'
      };
      return labels[status] || status;
    },
    getRiskLevelLabel(level) {
      const labels = {
        low: '低风险',
        medium: '中风险',
        high: '高风险'
      };
      return labels[level] || level;
    },
    formatDate(date) {
      if (!date) return '-';
      return new Date(date).toLocaleString('zh-CN');
    },
    statusTagType(s) {
      if (s === 'approved') return 'success';
      if (s === 'rejected') return 'danger';
      return 'warning';
    },
    riskTagType(r) {
      if (r === 'high') return 'danger';
      if (r === 'medium') return 'warning';
      return 'success';
    }
  }
};
</script>

<style scoped>
.mb12 { margin-bottom: 12px; }
.align-right { text-align: right; }
.mt8-md { margin-top: 8px; }
.regulation-waybill-list { padding: 0; }

.page-header { margin: 0; }

.filter-row { margin: 0; }

.search-input,
.filter-input {
  flex: 1;
  min-width: 150px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-value.warning {
  color: #ff9800;
}

.stat-value.danger {
  color: #f56c6c;
}

.table-container { background: white; border-radius: 8px; overflow: hidden; }

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #f5f5f5;
  font-weight: 600;
}

.data-table tbody tr:hover {
  background: #f9f9f9;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.badge-pending {
  background: #fff3e0;
  color: #ff9800;
}

.badge-approved {
  background: #e8f5e9;
  color: #4caf50;
}

.badge-rejected {
  background: #ffebee;
  color: #f44336;
}

.badge-low {
  background: #e8f5e9;
  color: #4caf50;
}

.badge-medium {
  background: #fff3e0;
  color: #ff9800;
}

.badge-high {
  background: #ffebee;
  color: #f44336;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn-link {
  background: none;
  border: none;
  color: #409eff;
  cursor: pointer;
  padding: 0;
}

.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #409eff;
  color: white;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-primary:hover {
  background: #66b1ff;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.pagination { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 12px; }

.page-info {
  color: #666;
}

.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

.no-data {
  text-align: center;
  color: #999;
  padding: 24px;
}
</style>
