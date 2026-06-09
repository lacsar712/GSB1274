<template>
  <div class="company-config-list">
    <div class="page-header">
      <h2>企业配置管理</h2>
      <button @click="showCreateDialog" class="btn-primary">
        <i class="icon-plus"></i> 新建配置
      </button>
    </div>

    <!-- 搜索筛选 -->
    <div class="filter-section">
      <div class="filter-group">
        <label>企业ID：</label>
        <input v-model="filters.companyId" type="text" placeholder="请输入企业ID" />
      </div>
      <div class="filter-group">
        <label>配置类型：</label>
        <select v-model="filters.configType">
          <option value="">全部</option>
          <option v-for="type in configTypes" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>状态：</label>
        <select v-model="filters.status">
          <option value="">全部</option>
          <option value="active">启用</option>
          <option value="inactive">禁用</option>
        </select>
      </div>
      <button @click="loadConfigs" class="btn-search" :disabled="loading">搜索</button>
      <button @click="resetFilters" class="btn-reset" :disabled="loading">重置</button>
    </div>

    <!-- 配置卡片列表 -->
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="configs.length === 0" class="empty-state">
      <p>暂无配置数据</p>
    </div>
    <div v-else class="config-grid">
      <div v-for="config in configs" :key="config.id" class="config-card">
        <div class="card-header">
          <h3>{{ config.config_key }}</h3>
          <span :class="['status-badge', config.status]">
            {{ config.status === 'active' ? '启用' : '禁用' }}
          </span>
        </div>
        <div class="card-body">
          <div class="config-info">
            <div class="info-item">
              <label>企业ID：</label>
              <span>{{ config.company_id }}</span>
            </div>
            <div class="info-item">
              <label>配置类型：</label>
              <span class="type-tag">{{ config.config_type }}</span>
            </div>
            <div class="info-item">
              <label>配置值：</label>
              <span class="config-value">{{ config.config_value }}</span>
            </div>
            <div class="info-item" v-if="config.description">
              <label>描述：</label>
              <span>{{ config.description }}</span>
            </div>
            <div class="info-item">
              <label>更新时间：</label>
              <span>{{ formatDate(config.updated_at) }}</span>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <button @click="viewDetail(config.id)" class="btn-link">查看详情</button>
          <button @click="editConfig(config)" class="btn-link">编辑</button>
          <button
            @click="deleteConfig(config.id)"
            class="btn-link danger"
            :disabled="deletingId === config.id || loading"
          >
            {{ deletingId === config.id ? '删除中...' : '删除' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="pagination.total > 0" class="pagination">
      <button 
        @click="changePage(pagination.page - 1)" 
        :disabled="pagination.page === 1"
        class="btn-page"
      >
        上一页
      </button>
      <span class="page-info">
        第 {{ pagination.page }} / {{ pagination.totalPages }} 页，共 {{ pagination.total }} 条
      </span>
      <button 
        @click="changePage(pagination.page + 1)" 
        :disabled="pagination.page === pagination.totalPages"
        class="btn-page"
      >
        下一页
      </button>
    </div>

    <!-- 创建/编辑对话框 -->
    <div v-if="dialogVisible" class="dialog-overlay" @click.self="closeDialog">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ isEdit ? '编辑配置' : '新建配置' }}</h3>
          <button @click="closeDialog" class="btn-close">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label>企业ID <span class="required">*</span></label>
              <input v-model="formData.companyId" type="number" required :disabled="isEdit" />
            </div>
            <div class="form-group">
              <label>配置键 <span class="required">*</span></label>
              <input v-model="formData.configKey" type="text" required :disabled="isEdit" />
            </div>
            <div class="form-group">
              <label>配置值 <span class="required">*</span></label>
              <textarea v-model="formData.configValue" required rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>配置类型 <span class="required">*</span></label>
              <select v-model="formData.configType" required>
                <option value="">请选择</option>
                <option value="system">系统配置</option>
                <option value="business">业务配置</option>
                <option value="notification">通知配置</option>
                <option value="payment">支付配置</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div class="form-group">
              <label>描述</label>
              <textarea v-model="formData.description" rows="2"></textarea>
            </div>
            <div class="form-group">
              <label>状态</label>
              <select v-model="formData.status">
                <option value="active">启用</option>
                <option value="inactive">禁用</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeDialog" class="btn-cancel">取消</button>
              <button type="submit" class="btn-submit" :disabled="submitLoading">
                {{ submitLoading ? (isEdit ? '更新中...' : '创建中...') : (isEdit ? '更新' : '创建') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { 
  getCompanyConfigs, 
  createCompanyConfig, 
  updateCompanyConfig, 
  deleteCompanyConfig,
  getConfigTypes 
} from '../../api/companyConfig';
import { ElMessageBox } from 'element-plus';

export default {
  name: 'CompanyConfigList',
  data() {
    return {
      configs: [],
      configTypes: [],
      loading: false,
      filters: {
        companyId: '',
        configType: '',
        status: ''
      },
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
      },
      dialogVisible: false,
      isEdit: false,
      submitLoading: false,
      deletingId: '',
      formData: {
        id: null,
        companyId: '',
        configKey: '',
        configValue: '',
        configType: '',
        description: '',
        status: 'active'
      }
    };
  },
  mounted() {
    this.loadConfigs();
    this.loadConfigTypes();
  },
  methods: {
    async loadConfigs() {
      this.loading = true;
      try {
        const params = {
          ...this.filters,
          page: this.pagination.page,
          limit: this.pagination.limit
        };
        const response = await getCompanyConfigs(params);
        if (response.data.success) {
          this.configs = response.data.data;
          this.pagination = response.data.pagination;
        } else {
          this.configs = [];
          this.pagination = { page: 1, limit: this.pagination.limit, total: 0, totalPages: 0 };
        }
      } catch (error) {
        this.configs = [];
        this.pagination = { page: 1, limit: this.pagination.limit, total: 0, totalPages: 0 };
      } finally {
        this.loading = false;
      }
    },
    async loadConfigTypes() {
      try {
        const response = await getConfigTypes();
        if (response.data.success) {
          this.configTypes = response.data.data;
        } else {
          this.configTypes = [];
        }
      } catch (error) {
        this.configTypes = [];
      }
    },
    resetFilters() {
      this.filters = {
        companyId: '',
        configType: '',
        status: ''
      };
      this.pagination.page = 1;
      this.loadConfigs();
    },
    changePage(page) {
      this.pagination.page = page;
      this.loadConfigs();
    },
    showCreateDialog() {
      this.isEdit = false;
      this.formData = {
        id: null,
        companyId: '',
        configKey: '',
        configValue: '',
        configType: '',
        description: '',
        status: 'active'
      };
      this.dialogVisible = true;
    },
    editConfig(config) {
      this.isEdit = true;
      this.formData = {
        id: config.id,
        companyId: config.company_id,
        configKey: config.config_key,
        configValue: config.config_value,
        configType: config.config_type,
        description: config.description || '',
        status: config.status
      };
      this.dialogVisible = true;
    },
    async submitForm() {
      try {
        this.submitLoading = true;
        if (this.isEdit) {
          const response = await updateCompanyConfig(this.formData.id, {
            configValue: this.formData.configValue,
            configType: this.formData.configType,
            description: this.formData.description,
            status: this.formData.status
          });
          if (response.data.success) {
            this.$notifySuccess('配置更新');
            this.closeDialog();
            this.loadConfigs();
          }
        } else {
          const response = await createCompanyConfig(this.formData);
          if (response.data.success) {
            this.$notifySuccess('配置创建');
            this.closeDialog();
            this.loadConfigs();
          }
        }
      } catch (error) {
        console.error('提交失败:', error);
      } finally {
        this.submitLoading = false;
      }
    },
    async deleteConfig(id) {
      try {
        await ElMessageBox.confirm('确定要删除此配置吗？', '删除确认', {
          type: 'warning',
          confirmButtonText: '删除',
          cancelButtonText: '取消'
        });
      } catch (_) {
        return;
      }
      
      try {
        this.deletingId = id;
        const response = await deleteCompanyConfig(id);
        if (response.data.success) {
          this.$notifySuccess('配置删除');
          this.loadConfigs();
        }
      } catch (error) {
        console.error('删除失败:', error);
      } finally {
        this.deletingId = '';
      }
    },
    viewDetail(id) {
      this.$router.push(`/company-configs/${id}`);
    },
    closeDialog() {
      this.dialogVisible = false;
    },
    formatDate(date) {
      if (!date) return '-';
      try {
        return new Date(date).toLocaleString('zh-CN');
      } catch (_) {
        return String(date);
      }
    }
  }
};
</script>

<style scoped>
.company-config-list {
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
  color: #333;
}

.filter-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-size: 14px;
  color: #666;
}

.filter-group input,
.filter-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
}

.btn-primary {
  background: #409eff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-primary:hover {
  background: #66b1ff;
}

.btn-search,
.btn-reset {
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  border: 1px solid #ddd;
}

.btn-search {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.btn-reset {
  background: white;
  color: #666;
}

.loading,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.config-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.config-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.2);
}

.status-badge.active {
  background: rgba(103, 194, 58, 0.9);
}

.status-badge.inactive {
  background: rgba(245, 108, 108, 0.9);
}

.card-body {
  padding: 20px;
}

.config-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.info-item label {
  color: #666;
  min-width: 80px;
  font-weight: 500;
}

.info-item span {
  color: #333;
  flex: 1;
}

.type-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #e1f3d8;
  color: #67c23a;
  border-radius: 4px;
  font-size: 12px;
}

.config-value {
  word-break: break-all;
  font-family: monospace;
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.card-footer {
  padding: 15px 20px;
  background: #f5f7fa;
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.btn-link {
  background: none;
  border: none;
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}

.btn-link:hover {
  text-decoration: underline;
}

.btn-link.danger {
  color: #f56c6c;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.btn-page {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-size: 14px;
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
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: auto;
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

.required {
  color: #f56c6c;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
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
  border-radius: 4px;
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
</style>
