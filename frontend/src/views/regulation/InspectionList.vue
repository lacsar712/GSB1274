<template>
  <div class="regulation-inspection-list">
    <el-card class="mb12" shadow="hover">
      <div class="page-header">
        <h2>抽检管理</h2>
        <el-button type="primary" @click="showCreateDialog">创建抽检</el-button>
      </div>
    </el-card>

    <!-- 搜索和筛选 -->
    <el-card class="mb12" shadow="never">
      <el-row :gutter="10" class="filter-row" align="middle">
        <el-col :xs="24" :md="8">
          <el-input
            v-model="filters.search"
            placeholder="搜索抽检编号或标题"
            clearable
            @keyup.enter="loadInspections"
          />
        </el-col>
        <el-col :xs="12" :md="4">
          <el-select v-model="filters.inspection_type" placeholder="抽检类型" clearable style="width: 100%">
            <el-option label="常规抽检" value="routine" />
            <el-option label="专项抽检" value="special" />
            <el-option label="随机抽检" value="random" />
          </el-select>
        </el-col>
        <el-col :xs="12" :md="4">
          <el-select v-model="filters.status" placeholder="状态" clearable style="width: 100%">
            <el-option label="已安排" value="scheduled" />
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-col>
        <el-col :xs="12" :md="4">
          <el-select v-model="filters.result" placeholder="结果" clearable style="width: 100%">
            <el-option label="通过" value="passed" />
            <el-option label="未通过" value="failed" />
          </el-select>
        </el-col>
        <el-col :xs="24" :md="8" class="align-right mt8-md">
          <el-button type="primary" @click="loadInspections">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="12" class="mb12" v-if="statistics">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">总抽检数</div>
          <div class="stat-value">{{ statistics.total || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">进行中</div>
          <div class="stat-value">{{ statistics.in_progress_count || 0 }}</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-label">通过率</div>
          <div class="stat-value success">{{ calculatePassRate() }}%</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 抽检卡片列表 -->
    <el-row :gutter="12" class="inspection-cards">
      <el-col v-for="inspection in inspections" :key="inspection.id" :xs="24" :sm="12" :md="8">
        <el-card shadow="hover" class="inspection-card">
          <div class="card-header">
            <h3>{{ inspection.inspection_title }}</h3>
            <el-tag :type="statusTagType(inspection.status)">
              {{ getStatusLabel(inspection.status) }}
            </el-tag>
          </div>
          <div class="card-body">
            <div class="card-info">
              <div class="info-item">
                <label>抽检编号:</label>
                <span>{{ inspection.inspection_code }}</span>
              </div>
              <div class="info-item">
                <label>抽检类型:</label>
                <span>{{ getInspectionTypeLabel(inspection.inspection_type) }}</span>
              </div>
              <div class="info-item">
                <label>企业名称:</label>
                <span>{{ inspection.company_name }}</span>
              </div>
              <div class="info-item">
                <label>检查员:</label>
                <span>{{ inspection.inspector_name }}</span>
              </div>
              <div class="info-item">
                <label>计划日期:</label>
                <span>{{ formatDate(inspection.scheduled_date) }}</span>
              </div>
              <div class="info-item" v-if="inspection.result">
                <label>抽检结果:</label>
                <el-tag :type="resultTagType(inspection.result)">
                  {{ getResultLabel(inspection.result) }}
                </el-tag>
              </div>
              <div class="info-item" v-if="inspection.score">
                <label>评分:</label>
                <span class="score">{{ inspection.score }}</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <el-button link type="primary" @click="viewDetail(inspection.id)">查看详情</el-button>
            <el-button link @click="editInspection(inspection.id)">编辑</el-button>
            <el-button link type="danger" @click="deleteInspection(inspection.id)">删除</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col v-if="inspections.length === 0" :xs="24">
        <div class="no-data">暂无抽检数据</div>
      </el-col>
    </el-row>

    <!-- 分页 -->
    <div class="pagination" v-if="inspections.length > 0">
      <el-button @click="prevPage" :disabled="currentPage === 1">上一页</el-button>
      <span class="page-info">第 {{ currentPage }} 页</span>
      <el-button @click="nextPage" :disabled="inspections.length < pageSize">下一页</el-button>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog v-model="showDialog" :title="isEdit ? '编辑抽检' : '创建抽检'" width="560px">
      <el-form :model="formData" label-position="top">
        <el-form-item label="抽检编号">
          <el-input v-model="formData.inspection_code" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="抽检标题">
          <el-input v-model="formData.inspection_title" />
        </el-form-item>
        <el-form-item label="抽检类型">
          <el-select v-model="formData.inspection_type" style="width: 100%">
            <el-option label="常规抽检" value="routine" />
            <el-option label="专项抽检" value="special" />
            <el-option label="随机抽检" value="random" />
          </el-select>
        </el-form-item>
        <el-form-item label="企业ID">
          <el-input v-model="formData.company_id" />
        </el-form-item>
        <el-form-item label="业务ID">
          <el-input v-model="formData.business_id" />
        </el-form-item>
        <el-form-item label="计划日期">
          <el-date-picker v-model="formData.scheduled_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea" :rows="3" />
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
import { getInspections, createInspection, updateInspection, deleteInspection, getInspectionStatistics } from '@/api/regulationInspection';

export default {
  name: 'RegulationInspectionList',
  data() {
    return {
      inspections: [],
      statistics: null,
      filters: {
        search: '',
        inspection_type: '',
        status: '',
        result: ''
      },
      currentPage: 1,
      pageSize: 12,
      showDialog: false,
      isEdit: false,
      formData: {
        inspection_code: '',
        inspection_title: '',
        inspection_type: '',
        company_id: '',
        business_id: '',
        scheduled_date: '',
        description: ''
      }
    };
  },
  mounted() {
    this.loadInspections();
    this.loadStatistics();
  },
  methods: {
    async loadInspections() {
      try {
        const params = {
          ...this.filters,
          limit: this.pageSize,
          offset: (this.currentPage - 1) * this.pageSize
        };
        const response = await getInspections(params);
        if (response.success) {
          this.inspections = response.data;
        }
      } catch (error) {
        this.$notifyError('加载抽检列表', error);
      }
    },
    async loadStatistics() {
      try {
        const response = await getInspectionStatistics(this.filters);
        if (response.success) {
          this.statistics = response.data;
        }
      } catch (error) {
        this.$notifyError('加载统计数据', error);
      }
    },
    calculatePassRate() {
      if (!this.statistics || !this.statistics.total) return 0;
      const passRate = (this.statistics.passed_count / this.statistics.total) * 100;
      return passRate.toFixed(1);
    },
    resetFilters() {
      this.filters = {
        search: '',
        inspection_type: '',
        status: '',
        result: ''
      };
      this.currentPage = 1;
      this.loadInspections();
      this.loadStatistics();
    },
    showCreateDialog() {
      this.isEdit = false;
      this.formData = {
        inspection_code: '',
        inspection_title: '',
        inspection_type: '',
        company_id: '',
        business_id: '',
        scheduled_date: '',
        description: ''
      };
      this.showDialog = true;
    },
    editInspection(id) {
      const inspection = this.inspections.find(i => i.id === id);
      if (inspection) {
        this.isEdit = true;
        this.formData = { ...inspection };
        this.showDialog = true;
      }
    },
    async submitForm() {
      try {
        if (this.isEdit) {
          const resp = await updateInspection(this.formData.id, this.formData);
          if (resp?.success) {
            this.$notifySuccess('抽检更新');
          } else {
            this.$notifyError('抽检更新', new Error(resp?.message || '请求失败'));
            return;
          }
        } else {
          const resp = await createInspection(this.formData);
          if (resp?.success) {
            this.$notifySuccess('抽检创建');
          } else {
            this.$notifyError('抽检创建', new Error(resp?.message || '请求失败'));
            return;
          }
        }
        this.closeDialog();
        this.loadInspections();
        this.loadStatistics();
      } catch (error) {
        this.$notifyError('提交抽检', error);
      }
    },
    async deleteInspection(id) {
      const { isConfirmed } = await this.$confirm('确定要删除这个抽检吗？', '删除确认', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      });
      if (!isConfirmed) return;
      try {
        const resp = await deleteInspection(id);
        if (resp?.success) {
          this.$notifySuccess('删除抽检');
        } else {
          this.$notifyError('删除抽检', new Error(resp?.message || '请求失败'));
          return;
        }
        this.loadInspections();
        this.loadStatistics();
      } catch (error) {
        this.$notifyError('删除抽检', error);
      }
    },
    viewDetail(id) {
      this.$router.push(`/regulation/inspections/${id}`);
    },
    closeDialog() {
      this.showDialog = false;
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadInspections();
      }
    },
    nextPage() {
      this.currentPage++;
      this.loadInspections();
    },
    getInspectionTypeLabel(type) {
      const labels = {
        routine: '常规抽检',
        special: '专项抽检',
        random: '随机抽检'
      };
      return labels[type] || type;
    },
    getStatusLabel(status) {
      const labels = {
        scheduled: '已安排',
        in_progress: '进行中',
        completed: '已完成'
      };
      return labels[status] || status;
    },
    getResultLabel(result) {
      const labels = {
        passed: '通过',
        failed: '未通过'
      };
      return labels[result] || result;
    },
    formatDate(date) {
      if (!date) return '-';
      return new Date(date).toLocaleDateString('zh-CN');
    },
    statusTagType(s) {
      if (s === 'completed') return 'success';
      if (s === 'in_progress') return 'warning';
      return 'info';
    },
    resultTagType(r) {
      if (r === 'passed') return 'success';
      if (r === 'failed') return 'danger';
      return 'info';
    }
  }
};
</script>

<style scoped>
.mb12 { margin-bottom: 12px; }
.align-right { text-align: right; }
.mt8-md { margin-top: 8px; }
.regulation-inspection-list { padding: 0; }

.page-header { display: flex; justify-content: space-between; align-items: center; margin: 0; }
.regulation-inspection-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

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

.stat-value.success {
  color: #4caf50;
}

.inspection-cards { margin-bottom: 12px; }

.inspection-card { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; transition: transform 0.2s; }

.inspection-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.card-header { padding: 16px; background: #f5f5f5; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; }

.card-header h3 { margin: 0; font-size: 16px; font-weight: 600; }

.status-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }

.status-scheduled { background: #e3f2fd; color: #2196f3; }
.status-in_progress { background: #fff3e0; color: #ff9800; }
.status-completed { background: #e8f5e9; color: #4caf50; }

.card-body { padding: 16px; }

.card-info { display: grid; gap: 12px; }

.info-item { display: flex; gap: 8px; }

.info-item label { font-weight: 500; color: #666; min-width: 80px; }

.info-item span { color: #333; }

.result-badge { padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; }

.result-passed { background: #e8f5e9; color: #4caf50; }
.result-failed { background: #ffebee; color: #f44336; }

.score { font-weight: 600; color: #409eff; }

.card-footer { padding: 12px 16px; background: #fafafa; display: flex; gap: 16px; border-top: 1px solid #eee; }

.btn-link { background: none; border: none; color: #409eff; cursor: pointer; padding: 0; font-size: 14px; }

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

.no-data { grid-column: 1 / -1; text-align: center; color: #999; padding: 24px; background: white; border-radius: 8px; }
</style>
