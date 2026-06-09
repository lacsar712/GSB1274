<template>
  <div class="company-detail">
    <div class="page-header">
      <h2>企业信息详情</h2>
      <div class="actions">
        <button @click="goToEdit" class="btn btn-primary">编辑信息</button>
        <button @click="goBack" class="btn btn-secondary">返回</button>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="company" class="detail-content">
      <!-- 基本信息 -->
      <div class="info-section">
        <h3 class="section-title">基本信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>企业名称：</label>
            <span>{{ company.name }}</span>
          </div>
          <div class="info-item">
            <label>统一社会信用代码：</label>
            <span>{{ company.credit_code }}</span>
          </div>
          <div class="info-item">
            <label>法人代表：</label>
            <span>{{ company.legal_person }}</span>
          </div>
          <div class="info-item">
            <label>企业地址：</label>
            <span>{{ company.address }}</span>
          </div>
          <div class="info-item">
            <label>审核状态：</label>
            <span :class="['status', `status-${company.status}`]">
              {{ getStatusText(company.status) }}
            </span>
          </div>
          <div class="info-item">
            <label>注册时间：</label>
            <span>{{ formatDate(company.created_at) }}</span>
          </div>
        </div>
      </div>

      <!-- 联系人信息 -->
      <div class="info-section">
        <h3 class="section-title">联系人信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>联系人：</label>
            <span>{{ company.contact_person }}</span>
          </div>
          <div class="info-item">
            <label>联系电话：</label>
            <span>{{ company.contact_phone }}</span>
          </div>
          <div class="info-item">
            <label>联系邮箱：</label>
            <span>{{ company.contact_email }}</span>
          </div>
        </div>
      </div>

      <!-- 资质信息 -->
      <div class="info-section">
        <h3 class="section-title">
          资质信息
          <button @click="goToQualifications" class="btn btn-small btn-primary">
            管理资质
          </button>
        </h3>
        <div class="qualifications">
          <div class="qualification-item">
            <label>营业执照：</label>
            <div v-if="company.business_license" class="file-info">
              <a :href="getFileUrl(company.business_license)" target="_blank" class="file-link">
                查看文件
              </a>
            </div>
            <span v-else class="no-data">未上传</span>
          </div>
          <div class="qualification-item">
            <label>其他资质文件：</label>
            <div v-if="otherDocuments.length > 0" class="file-list">
              <div v-for="(doc, index) in otherDocuments" :key="index" class="file-info">
                <a :href="getFileUrl(doc)" target="_blank" class="file-link">
                  文件 {{ index + 1 }}
                </a>
              </div>
            </div>
            <span v-else class="no-data">未上传</span>
          </div>
        </div>
      </div>

      <!-- 审核信息 -->
      <div v-if="company.status !== 'pending'" class="info-section">
        <h3 class="section-title">审核信息</h3>
        <div class="info-grid">
          <div v-if="company.approved_at" class="info-item">
            <label>审核通过时间：</label>
            <span>{{ formatDate(company.approved_at) }}</span>
          </div>
          <div v-if="company.rejected_at" class="info-item">
            <label>驳回时间：</label>
            <span>{{ formatDate(company.rejected_at) }}</span>
          </div>
          <div v-if="company.reject_reason" class="info-item full-width">
            <label>驳回原因：</label>
            <span class="reject-reason">{{ company.reject_reason }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error">
      <p>企业信息不存在</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCompanyDetail } from '@/api/company';

export default {
  name: 'CompanyDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(false);
    const company = ref(null);

    const companyId = computed(() => route.params.id);

    const otherDocuments = computed(() => {
      if (!company.value?.other_documents) return [];
      return company.value.other_documents.split(',').filter(doc => doc.trim());
    });

    const fetchCompanyDetail = async () => {
      loading.value = true;
      try {
        const response = await getCompanyDetail(companyId.value);
        if (response.success) {
          company.value = response.data;
        }
      } catch (error) {
        const vm = getCurrentInstance()?.proxy;
        vm?.$notifyError('获取企业详情', error);
      } finally {
        loading.value = false;
      }
    };

    const getStatusText = (status) => {
      const statusMap = {
        pending: '待审核',
        approved: '已通过',
        rejected: '已驳回'
      };
      return statusMap[status] || status;
    };

    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getFileUrl = (filePath) => {
      return `${import.meta.env.VITE_API_BASE_URL}/${filePath}`;
    };

    const goToEdit = () => {
      router.push(`/company/${companyId.value}/edit`);
    };

    const goToQualifications = () => {
      router.push(`/company/${companyId.value}/qualifications`);
    };

    const goBack = () => {
      router.back();
    };

    onMounted(() => {
      fetchCompanyDetail();
    });

    return {
      loading,
      company,
      otherDocuments,
      getStatusText,
      formatDate,
      getFileUrl,
      goToEdit,
      goToQualifications,
      goBack
    };
  }
};
</script>

<style scoped>
.company-detail {
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

.actions {
  display: flex;
  gap: 10px;
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

.btn-primary:hover {
  background-color: #66b1ff;
}

.btn-secondary {
  background-color: #909399;
  color: white;
}

.btn-secondary:hover {
  background-color: #a6a9ad;
}

.btn-small {
  padding: 5px 15px;
  font-size: 12px;
  margin-left: 15px;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

.detail-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.info-section {
  padding: 25px;
  border-bottom: 1px solid #f0f0f0;
}

.info-section:last-child {
  border-bottom: none;
}

.section-title {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: flex-start;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  min-width: 140px;
  color: #666;
  font-weight: 500;
  flex-shrink: 0;
}

.info-item span {
  color: #333;
  word-break: break-all;
}

.status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background-color: #fff3e0;
  color: #ff9800;
}

.status-approved {
  background-color: #e8f5e9;
  color: #4caf50;
}

.status-rejected {
  background-color: #ffebee;
  color: #f44336;
}

.qualifications {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.qualification-item {
  display: flex;
  align-items: flex-start;
}

.qualification-item label {
  min-width: 140px;
  color: #666;
  font-weight: 500;
  flex-shrink: 0;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-info {
  display: flex;
  align-items: center;
}

.file-link {
  color: #409eff;
  text-decoration: none;
  padding: 4px 12px;
  border: 1px solid #409eff;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.file-link:hover {
  background-color: #409eff;
  color: white;
}

.no-data {
  color: #999;
  font-style: italic;
}

.reject-reason {
  color: #f44336;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-item label {
    min-width: 120px;
  }
}
</style>
