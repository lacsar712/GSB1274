<template>
  <div class="company-edit">
    <div class="page-header">
      <h2>编辑企业信息</h2>
      <button @click="goBack" class="btn btn-secondary">返回</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="company" class="edit-content">
      <form @submit.prevent="handleSubmit" class="edit-form">
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          <div class="form-grid">
            <div class="form-item">
              <label class="required">企业名称</label>
              <input
                v-model="formData.name"
                type="text"
                placeholder="请输入企业名称"
                required
              />
            </div>

            <div class="form-item">
              <label>统一社会信用代码</label>
              <input
                v-model="company.credit_code"
                type="text"
                disabled
                class="disabled-input"
              />
              <span class="hint">信用代码不可修改</span>
            </div>

            <div class="form-item">
              <label class="required">法人代表</label>
              <input
                v-model="formData.legalPerson"
                type="text"
                placeholder="请输入法人代表姓名"
                required
              />
            </div>

            <div class="form-item full-width">
              <label class="required">企业地址</label>
              <input
                v-model="formData.address"
                type="text"
                placeholder="请输入企业地址"
                required
              />
            </div>
          </div>
        </div>

        <!-- 联系人信息 -->
        <div class="form-section">
          <h3 class="section-title">联系人信息</h3>
          <div class="form-grid">
            <div class="form-item">
              <label class="required">联系人</label>
              <input
                v-model="formData.contactPerson"
                type="text"
                placeholder="请输入联系人姓名"
                required
              />
            </div>

            <div class="form-item">
              <label class="required">联系电话</label>
              <input
                v-model="formData.contactPhone"
                type="tel"
                placeholder="请输入联系电话"
                pattern="^1[3-9]\d{9}$"
                required
              />
              <span class="hint">请输入11位手机号码</span>
            </div>

            <div class="form-item">
              <label class="required">联系邮箱</label>
              <input
                v-model="formData.contactEmail"
                type="email"
                placeholder="请输入联系邮箱"
                required
              />
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '保存中...' : '保存修改' }}
          </button>
          <button type="button" @click="resetForm" class="btn btn-secondary">
            重置
          </button>
        </div>
      </form>
    </div>

    <div v-else class="error">
      <p>企业信息不存在</p>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCompanyDetail, updateCompany } from '@/api/company';

export default {
  name: 'CompanyEdit',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(false);
    const submitting = ref(false);
    const company = ref(null);

    const formData = reactive({
      name: '',
      legalPerson: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      address: ''
    });

    const companyId = route.params.id;

    const fetchCompanyDetail = async () => {
      loading.value = true;
      try {
        const response = await getCompanyDetail(companyId);
        if (response.success) {
          company.value = response.data;
          // 填充表单数据
          formData.name = response.data.name;
          formData.legalPerson = response.data.legal_person;
          formData.contactPerson = response.data.contact_person;
          formData.contactPhone = response.data.contact_phone;
          formData.contactEmail = response.data.contact_email;
          formData.address = response.data.address;
        }
      } catch (error) {
        console.error('获取企业详情失败:', error);
        alert('获取企业详情失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    };

    const handleSubmit = async () => {
      submitting.value = true;
      try {
        const response = await updateCompany(companyId, formData);
        if (response.success) {
          alert('企业信息更新成功');
          router.push(`/company/${companyId}`);
        } else {
          alert(response.message || '更新失败，请稍后重试');
        }
      } catch (error) {
        console.error('更新企业信息失败:', error);
        if (error.response?.data?.errors) {
          const errors = error.response.data.errors;
          const errorMsg = errors.map(e => e.msg).join('\n');
          alert(`数据验证失败：\n${errorMsg}`);
        } else {
          alert(error.response?.data?.message || '更新失败，请稍后重试');
        }
      } finally {
        submitting.value = false;
      }
    };

    const resetForm = () => {
      if (company.value) {
        formData.name = company.value.name;
        formData.legalPerson = company.value.legal_person;
        formData.contactPerson = company.value.contact_person;
        formData.contactPhone = company.value.contact_phone;
        formData.contactEmail = company.value.contact_email;
        formData.address = company.value.address;
      }
    };

    const goBack = () => {
      router.back();
    };

    onMounted(() => {
      fetchCompanyDetail();
    });

    return {
      loading,
      submitting,
      company,
      formData,
      handleSubmit,
      resetForm,
      goBack
    };
  }
};
</script>

<style scoped>
.company-edit {
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

.loading,
.error {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

.edit-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.edit-form {
  max-width: 900px;
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #f0f0f0;
}

.form-section:last-of-type {
  border-bottom: none;
}

.section-title {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
}

.form-item.full-width {
  grid-column: 1 / -1;
}

.form-item label {
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

.form-item label.required::after {
  content: '*';
  color: #f44336;
  margin-left: 4px;
}

.form-item input {
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-item input:focus {
  outline: none;
  border-color: #409eff;
}

.form-item input.disabled-input {
  background-color: #f5f7fa;
  color: #909399;
  cursor: not-allowed;
}

.hint {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
  }
}
</style>
