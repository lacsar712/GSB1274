<template>
  <div class="company-config-detail">
    <div class="page-header">
      <button @click="goBack" class="btn-back">← 返回</button>
      <h2>配置详情</h2>
      <div class="header-actions">
        <button @click="editConfig" class="btn-edit">编辑</button>
        <button @click="deleteConfig" class="btn-delete">删除</button>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="config" class="detail-container">
      <!-- 基本信息卡片 -->
      <div class="info-card">
        <div class="card-title">
          <h3>基本信息</h3>
          <span :class="['status-badge', config.status]">
            {{ config.status === 'active' ? '启用' : '禁用' }}
          </span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <label>配置ID</label>
            <span>{{ config.id }}</span>
          </div>
          <div class="info-item">
            <label>企业ID</label>
            <span>{{ config.company_id }}</span>
          </div>
          <div class="info-item">
            <label>配置键</label>
            <span class="config-key">{{ config.config_key }}</span>
          </div>
          <div class="info-item">
            <label>配置类型</label>
            <span class="type-tag">{{ config.config_type }}</span>
          </div>
        </div>
      </div>

      <!-- 配置值卡片 -->
      <div class="info-card">
        <div class="card-title">
          <h3>配置值</h3>
        </div>
        <div class="config-value-section">
          <pre>{{ config.config_value }}</pre>
        </div>
      </div>

      <!-- 描述信息卡片 -->
      <div class="info-card" v-if="config.description">
        <div class="card-title">
          <h3>描述信息</h3>
        </div>
        <div class="description-section">
          <p>{{ config.description }}</p>
        </div>
      </div>

      <!-- 时间信息卡片 -->
      <div class="info-card">
        <div class="card-title">
          <h3>时间信息</h3>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <label>创建时间</label>
            <span>{{ formatDate(config.created_at) }}</span>
          </div>
          <div class="info-item">
            <label>更新时间</label>
            <span>{{ formatDate(config.updated_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <div v-if="dialogVisible" class="dialog-overlay" @click.self="closeDialog">
      <div class="dialog">
        <div class="dialog-header">
          <h3>编辑配置</h3>
          <button @click="closeDialog" class="btn-close">×</button>
        </div>
        <div class="dialog-body">
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label>配置值 <span class="required">*</span></label>
              <textarea v-model="formData.configValue" required rows="4"></textarea>
            </div>
            <div class="form-group">
              <label>配置类型 <span class="required">*</span></label>
              <select v-model="formData.configType" required>
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
              <button type="submit" class="btn-submit">更新</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCompanyConfigById, updateCompanyConfig, deleteCompanyConfig } from '../../api/companyConfig';

export default {
  name: 'CompanyConfigDetail',
  data() {
    return {
      config: null,
      loading: false,
      dialogVisible: false,
      formData: {
        configValue: '',
        configType: '',
        description: '',
        status: 'active'
      }
    };
  },
  mounted() {
    this.loadConfig();
  },
  methods: {
    async loadConfig() {
      this.loading = true;
      try {
        const configId = this.$route.params.id;
        const response = await getCompanyConfigById(configId);
        if (response.data.success) {
          this.config = response.data.data;
        }
      } catch (error) {
        console.error('加载配置详情失败:', error);
        alert('加载配置详情失败');
      } finally {
        this.loading = false;
      }
    },
    editConfig() {
      this.formData = {
        configValue: this.config.config_value,
        configType: this.config.config_type,
        description: this.config.description || '',
        status: this.config.status
      };
      this.dialogVisible = true;
    },
    async submitForm() {
      try {
        const response = await updateCompanyConfig(this.config.id, this.formData);
        if (response.data.success) {
          alert('配置更新成功');
          this.closeDialog();
          this.loadConfig();
        }
      } catch (error) {
        console.error('更新失败:', error);
        alert(error.response?.data?.message || '更新失败');
      }
    },
    async deleteConfig() {
      if (!confirm('确定要删除此配置吗？')) return;
      
      try {
        const response = await deleteCompanyConfig(this.config.id);
        if (response.data.success) {
          alert('配置删除成功');
          this.goBack();
        }
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败');
      }
    },
    closeDialog() {
      this.dialogVisible = false;
    },
    goBack() {
      this.$router.back();
    },
    formatDate(date) {
      if (!date) return '-';
      return new Date(date).toLocaleString('zh-CN');
    }
  }
};
</script>

<style scoped>
.company-config-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
  flex: 1;
}

.btn-back {
  background: white;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.btn-back:hover {
  background: #f5f7fa;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-edit,
.btn-delete {
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  border: none;
}

.btn-edit {
  background: #409eff;
  color: white;
}

.btn-edit:hover {
  background: #66b1ff;
}

.btn-delete {
  background: #f56c6c;
  color: white;
}

.btn-delete:hover {
  background: #f78989;
}

.loading {
  text-align: center;
  padding: 60px;
  color: #999;
  font-size: 16px;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-title {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.2);
}

.status-badge.active {
  background: rgba(103, 194, 58, 0.9);
}

.status-badge.inactive {
  background: rgba(245, 108, 108, 0.9);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 30px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item label {
  font-size: 13px;
  color: #999;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.config-key {
  font-family: monospace;
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
  display: inline-block;
}

.type-tag {
  display: inline-block;
  padding: 6px 12px;
  background: #e1f3d8;
  color: #67c23a;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
}

.config-value-section {
  padding: 30px;
}

.config-value-section pre {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  overflow-x: auto;
  margin: 0;
  border: 1px solid #e4e7ed;
}

.description-section {
  padding: 30px;
}

.description-section p {
  margin: 0;
  font-size: 15px;
  line-height: 1.8;
  color: #666;
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
  font-family: 'Courier New', monospace;
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
