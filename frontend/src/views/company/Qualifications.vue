<template>
  <div class="qualifications-manage">
    <div class="page-header">
      <h2>企业资质管理</h2>
      <button @click="goBack" class="btn btn-secondary">返回</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="company" class="manage-content">
      <!-- 企业基本信息 -->
      <div class="company-info">
        <h3>{{ company.name }}</h3>
        <p>统一社会信用代码：{{ company.credit_code }}</p>
      </div>

      <!-- 营业执照 -->
      <div class="qualification-section">
        <h3 class="section-title">营业执照</h3>
        <div class="file-display">
          <div v-if="company.business_license" class="file-item">
            <div class="file-info">
              <span class="file-icon">📄</span>
              <span class="file-name">营业执照</span>
            </div>
            <div class="file-actions">
              <a :href="getFileUrl(company.business_license)" target="_blank" class="btn btn-small btn-view">
                查看
              </a>
            </div>
          </div>
          <div v-else class="no-file">
            <p>暂无营业执照</p>
          </div>
        </div>
      </div>

      <!-- 其他资质文件 -->
      <div class="qualification-section">
        <div class="section-header">
          <h3 class="section-title">其他资质文件</h3>
          <button @click="showUploadDialog = true" class="btn btn-primary">
            <span class="icon">+</span> 上传资质
          </button>
        </div>

        <div class="file-list">
          <div v-if="otherDocuments.length > 0">
            <div v-for="(doc, index) in otherDocuments" :key="index" class="file-item">
              <div class="file-info">
                <span class="file-icon">📄</span>
                <span class="file-name">资质文件 {{ index + 1 }}</span>
                <span class="file-path">{{ getFileName(doc) }}</span>
              </div>
              <div class="file-actions">
                <a :href="getFileUrl(doc)" target="_blank" class="btn btn-small btn-view">
                  查看
                </a>
                <button @click="handleDelete(doc)" class="btn btn-small btn-danger">
                  删除
                </button>
              </div>
            </div>
          </div>
          <div v-else class="no-file">
            <p>暂无其他资质文件</p>
            <p class="hint">点击"上传资质"按钮添加资质文件</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传对话框 -->
    <div v-if="showUploadDialog" class="dialog-overlay" @click="closeUploadDialog">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>上传资质文件</h3>
          <button @click="closeUploadDialog" class="close-btn">&times;</button>
        </div>
        <div class="dialog-body">
          <div class="upload-area">
            <input
              ref="fileInput"
              type="file"
              @change="handleFileSelect"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              style="display: none"
            />
            <div v-if="!selectedFile" class="upload-placeholder" @click="$refs.fileInput.click()">
              <div class="upload-icon">📁</div>
              <p>点击选择文件</p>
              <p class="hint">支持 JPG、PNG、PDF、DOC、DOCX 格式，最大 10MB</p>
            </div>
            <div v-else class="selected-file">
              <div class="file-info">
                <span class="file-icon">📄</span>
                <span class="file-name">{{ selectedFile.name }}</span>
                <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
              </div>
              <button @click="clearSelectedFile" class="btn btn-small btn-secondary">
                重新选择
              </button>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button @click="handleUpload" :disabled="!selectedFile || uploading" class="btn btn-primary">
            {{ uploading ? '上传中...' : '确认上传' }}
          </button>
          <button @click="closeUploadDialog" class="btn btn-secondary">
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCompanyDetail, uploadQualification, deleteQualification } from '@/api/company';

export default {
  name: 'QualificationsManage',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(false);
    const uploading = ref(false);
    const company = ref(null);
    const showUploadDialog = ref(false);
    const selectedFile = ref(null);
    const fileInput = ref(null);

    const companyId = route.params.id;

    const otherDocuments = computed(() => {
      if (!company.value?.other_documents) return [];
      return company.value.other_documents.split(',').filter(doc => doc.trim());
    });

    const fetchCompanyDetail = async () => {
      loading.value = true;
      try {
        const response = await getCompanyDetail(companyId);
        if (response.success) {
          company.value = response.data;
        }
      } catch (error) {
        console.error('获取企业详情失败:', error);
        alert('获取企业详情失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    };

    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file) {
        // 验证文件大小
        if (file.size > 10 * 1024 * 1024) {
          alert('文件大小不能超过 10MB');
          return;
        }
        selectedFile.value = file;
      }
    };

    const clearSelectedFile = () => {
      selectedFile.value = null;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    const handleUpload = async () => {
      if (!selectedFile.value) return;

      uploading.value = true;
      try {
        const response = await uploadQualification(companyId, selectedFile.value);
        if (response.success) {
          alert('资质文件上传成功');
          closeUploadDialog();
          await fetchCompanyDetail(); // 刷新数据
        } else {
          alert(response.message || '上传失败，请稍后重试');
        }
      } catch (error) {
        console.error('上传资质文件失败:', error);
        alert(error.response?.data?.message || '上传失败，请稍后重试');
      } finally {
        uploading.value = false;
      }
    };

    const handleDelete = async (filePath) => {
      if (!confirm('确定要删除这个资质文件吗？')) return;

      try {
        const response = await deleteQualification(companyId, filePath);
        if (response.success) {
          alert('资质文件删除成功');
          await fetchCompanyDetail(); // 刷新数据
        } else {
          alert(response.message || '删除失败，请稍后重试');
        }
      } catch (error) {
        console.error('删除资质文件失败:', error);
        alert(error.response?.data?.message || '删除失败，请稍后重试');
      }
    };

    const closeUploadDialog = () => {
      showUploadDialog.value = false;
      clearSelectedFile();
    };

    const getFileUrl = (filePath) => {
      return `${import.meta.env.VITE_API_BASE_URL}/${filePath}`;
    };

    const getFileName = (filePath) => {
      return filePath.split('/').pop();
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const goBack = () => {
      router.back();
    };

    onMounted(() => {
      fetchCompanyDetail();
    });

    return {
      loading,
      uploading,
      company,
      showUploadDialog,
      selectedFile,
      fileInput,
      otherDocuments,
      handleFileSelect,
      clearSelectedFile,
      handleUpload,
      handleDelete,
      closeUploadDialog,
      getFileUrl,
      getFileName,
      formatFileSize,
      goBack
    };
  }
};
</script>

<style scoped>
.qualifications-manage {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.page-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #409eff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #66b1ff;
}

.btn-primary:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #909399;
  color: white;
}

.btn-secondary:hover {
  background-color: #a6a9ad;
}

.btn-small {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-view {
  background-color: #67c23a;
  color: white;
}

.btn-view:hover {
  background-color: #85ce61;
}

.btn-danger {
  background-color: #f56c6c;
  color: white;
}

.btn-danger:hover {
  background-color: #f78989;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

.manage-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.company-info {
  padding: 25px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px 8px 0 0;
}

.company-info h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
}

.company-info p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.qualification-section {
  padding: 25px;
  border-bottom: 1px solid #f0f0f0;
}

.qualification-section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.section-header .section-title {
  margin: 0;
}

.icon {
  font-size: 18px;
  margin-right: 5px;
}

.file-display,
.file-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.file-icon {
  font-size: 24px;
}

.file-name {
  font-weight: 500;
  color: #333;
}

.file-path {
  color: #909399;
  font-size: 12px;
}

.file-size {
  color: #909399;
  font-size: 12px;
}

.file-actions {
  display: flex;
  gap: 10px;
}

.no-file {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.no-file p {
  margin: 5px 0;
}

.hint {
  font-size: 12px;
  color: #c0c4cc;
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
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.dialog-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #909399;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #333;
}

.dialog-body {
  padding: 20px;
}

.upload-area {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-placeholder {
  text-align: center;
  padding: 40px;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
}

.upload-placeholder:hover {
  border-color: #409eff;
  background: #f5f7fa;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.upload-placeholder p {
  margin: 5px 0;
  color: #606266;
}

.selected-file {
  width: 100%;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.selected-file .file-info {
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 15px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .file-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .dialog {
    width: 95%;
  }
}
</style>
