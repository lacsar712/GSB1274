<template>
  <div class="regulation-business-list">
    <el-card class="mb12" shadow="hover">
      <div class="page-header">
        <h2>业务管理</h2>
        <el-button type="primary" @click="showCreateDialog">
          创建业务
        </el-button>
      </div>
    </el-card>

    <!-- 搜索和筛选 -->
    <el-card class="mb12" shadow="never">
      <el-row :gutter="10" class="filter-row" align="middle">
        <el-col :xs="24" :md="8">
          <el-input
            v-model="filters.search"
            placeholder="搜索业务名称或编号"
            clearable
            @keyup.enter="loadBusinesses"
          />
        </el-col>
        <el-col :xs="12" :md="4">
          <el-select v-model="filters.business_type" placeholder="业务类型" clearable style="width: 100%">
            <el-option label="运输业务" value="transport" />
            <el-option label="仓储业务" value="storage" />
            <el-option label="配送业务" value="distribution" />
          </el-select>
        </el-col>
        <el-col :xs="12" :md="4">
          <el-select v-model="filters.status" placeholder="状态" clearable style="width: 100%">
            <el-option label="活跃" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-col>
        <el-col :xs="24" :md="8" class="align-right mt8-md">
          <el-button type="primary" @click="loadBusinesses">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="12" class="mb12" v-if="statistics">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">总业务数</div>
          <div class="stat-value">{{ statistics.total || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">活跃业务</div>
          <div class="stat-value">{{ statistics.active_count || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">高风险业务</div>
          <div class="stat-value danger">{{ statistics.high_risk_count || 0 }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 业务列表表格 -->
    <el-card shadow="never">
      <el-table :data="businesses" border stripe>
        <el-table-column prop="business_code" label="业务编号" min-width="140" />
        <el-table-column prop="business_name" label="业务名称" min-width="140" />
        <el-table-column label="业务类型" min-width="120">
          <template #default="{ row }">
            {{ getBusinessTypeLabel(row.business_type) }}
          </template>
        </el-table-column>
        <el-table-column prop="company_name" label="企业名称" min-width="140" />
        <el-table-column label="风险等级" min-width="120">
          <template #default="{ row }">
            <el-tag :type="riskTagType(row.risk_level)">
              {{ getRiskLevelLabel(row.risk_level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '活跃' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewDetail(row.id)">查看</el-button>
            <el-button link @click="editBusiness(row.id)">编辑</el-button>
            <el-button link type="danger" @click="deleteBusiness(row.id)">删除</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="no-data">暂无数据</div>
        </template>
      </el-table>
      <div class="pagination">
        <el-button @click="prevPage" :disabled="currentPage === 1">上一页</el-button>
        <span class="page-info">第 {{ currentPage }} 页</span>
        <el-button @click="nextPage" :disabled="businesses.length < pageSize">下一页</el-button>
      </div>
    </el-card>

    <!-- 分页 -->
    <div class="pagination" v-if="businesses.length > 0">
      <button @click="prevPage" :disabled="currentPage === 1" class="btn-secondary">上一页</button>
      <span class="page-info">第 {{ currentPage }} 页</span>
      <button @click="nextPage" :disabled="businesses.length < pageSize" class="btn-secondary">下一页</button>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog v-model="showDialog" :title="isEdit ? '编辑业务' : '创建业务'" width="560px">
      <el-form :model="formData" label-position="top">
        <el-form-item label="业务编号">
          <el-input v-model="formData.business_code" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="业务名称">
          <el-input v-model="formData.business_name" />
        </el-form-item>
        <el-form-item label="业务类型">
          <el-select v-model="formData.business_type" placeholder="请选择" style="width: 100%">
            <el-option label="运输业务" value="transport" />
            <el-option label="仓储业务" value="storage" />
            <el-option label="配送业务" value="distribution" />
          </el-select>
        </el-form-item>
        <el-form-item label="企业ID">
          <el-input v-model="formData.company_id" />
        </el-form-item>
        <el-form-item label="风险等级">
          <el-select v-model="formData.risk_level" style="width: 100%">
            <el-option label="低风险" value="low" />
            <el-option label="中风险" value="medium" />
            <el-option label="高风险" value="high" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="formData.status" style="width: 100%">
            <el-option label="活跃" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="formData.contact_person" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="formData.contact_phone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="submitForm">{{ isEdit ? '更新' : '创建' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getBusinesses, createBusiness, updateBusiness, deleteBusiness, getBusinessStatistics } from '@/api/regulationBusiness';

export default {
  name: 'RegulationBusinessList',
  data() {
    return {
      businesses: [],
      statistics: null,
      filters: {
        search: '',
        business_type: '',
        status: '',
        company_id: ''
      },
      currentPage: 1,
      pageSize: 20,
      showDialog: false,
      isEdit: false,
      formData: {
        business_code: '',
        business_name: '',
        business_type: '',
        company_id: '',
        risk_level: 'low',
        status: 'active',
        description: '',
        contact_person: '',
        contact_phone: ''
      }
    };
  },
  mounted() {
    this.loadBusinesses();
    this.loadStatistics();
  },
  methods: {
    async loadBusinesses() {
      try {
        const params = {
          ...this.filters,
          limit: this.pageSize,
          offset: (this.currentPage - 1) * this.pageSize
        };
        const response = await getBusinesses(params);
        if (response.success) {
          this.businesses = response.data;
        }
      } catch (error) {
        this.$notifyError('加载业务列表', error);
      }
    },
    async loadStatistics() {
      try {
        const response = await getBusinessStatistics(this.filters);
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
        business_type: '',
        status: '',
        company_id: ''
      };
      this.currentPage = 1;
      this.loadBusinesses();
      this.loadStatistics();
    },
    showCreateDialog() {
      this.isEdit = false;
      this.formData = {
        business_code: '',
        business_name: '',
        business_type: '',
        company_id: '',
        risk_level: 'low',
        status: 'active',
        description: '',
        contact_person: '',
        contact_phone: ''
      };
      this.showDialog = true;
    },
    editBusiness(id) {
      const business = this.businesses.find(b => b.id === id);
      if (business) {
        this.isEdit = true;
        this.formData = { ...business };
        this.showDialog = true;
      }
    },
    async submitForm() {
      try {
        if (this.isEdit) {
          const resp = await updateBusiness(this.formData.id, this.formData);
          if (resp?.success) {
            this.$notifySuccess('业务更新');
          } else {
            this.$notifyError('业务更新', new Error(resp?.message || '请求失败'));
            return;
          }
        } else {
          const resp = await createBusiness(this.formData);
          if (resp?.success) {
            this.$notifySuccess('业务创建');
          } else {
            this.$notifyError('业务创建', new Error(resp?.message || '请求失败'));
            return;
          }
        }
        this.closeDialog();
        this.loadBusinesses();
        this.loadStatistics();
      } catch (error) {
        this.$notifyError('提交业务', error);
      }
    },
    async deleteBusiness(id) {
      const { isConfirmed } = await this.$confirm('确定要删除这个业务吗？', '删除确认', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      });
      if (!isConfirmed) return;
      try {
        const resp = await deleteBusiness(id);
        if (resp?.success) {
          this.$notifySuccess('删除业务');
        } else {
          this.$notifyError('删除业务', new Error(resp?.message || '请求失败'));
          return;
        }
        this.loadBusinesses();
        this.loadStatistics();
      } catch (error) {
        this.$notifyError('删除业务', error);
      }
    },
    viewDetail(id) {
      this.$router.push({ name: 'RegulationBusinessDetail', params: { id } });
    },
    closeDialog() {
      this.showDialog = false;
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadBusinesses();
      }
    },
    nextPage() {
      this.currentPage++;
      this.loadBusinesses();
    },
    getBusinessTypeLabel(type) {
      const labels = {
        transport: '运输业务',
        storage: '仓储业务',
        distribution: '配送业务'
      };
      return labels[type] || type;
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
.regulation-business-list { padding: 0; }

.page-header { display: flex; justify-content: space-between; align-items: center; margin: 0; }

.filter-row { margin: 0; }

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.stats-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }

.stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

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

.stat-value.danger {
  color: #f56c6c;
}

.table-container { background: white; border-radius: 8px; overflow: hidden; }

.data-table { width: 100%; border-collapse: collapse; }

.data-table th,
.data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }

.data-table th { background: #f5f5f5; font-weight: 600; }

.data-table tbody tr:hover { background: #f9f9f9; }

.badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }

.badge-success { background: #e8f5e9; color: #4caf50; }

.badge-secondary { background: #f5f5f5; color: #999; }

.badge-low { background: #e8f5e9; color: #4caf50; }

.badge-medium { background: #fff3e0; color: #ff9800; }

.badge-high { background: #ffebee; color: #f44336; }

.actions { display: flex; gap: 10px; }

.btn-link { background: none; border: none; color: #409eff; cursor: pointer; padding: 0; }

.btn-link.danger { color: #f56c6c; }

.btn-primary,
.btn-secondary { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }

.btn-primary { background: #409eff; color: white; }

.btn-secondary { background: #f5f5f5; color: #333; }

.btn-primary:hover { background: #66b1ff; }

.btn-secondary:hover { background: #e0e0e0; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 12px; }

.page-info { color: #666; }

.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

.no-data {
  text-align: center;
  color: #999;
  padding: 24px;
}
</style>
