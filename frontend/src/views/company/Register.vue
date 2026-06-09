<template>
  <div class="company-register">
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <h2>企业注册</h2>
          <p class="subtitle">请填写企业基本信息并上传相关资质文件</p>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="register-form"
      >
        <el-divider content-position="left">基本信息</el-divider>

        <el-form-item label="企业名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入企业全称"
            clearable
          />
        </el-form-item>

        <el-form-item label="信用代码" prop="creditCode">
          <el-input
            v-model="formData.creditCode"
            placeholder="请输入统一社会信用代码（18位）"
            maxlength="18"
            clearable
          />
        </el-form-item>

        <el-form-item label="法人代表" prop="legalPerson">
          <el-input
            v-model="formData.legalPerson"
            placeholder="请输入法人代表姓名"
            clearable
          />
        </el-form-item>

        <el-divider content-position="left">联系信息</el-divider>

        <el-form-item label="联系人" prop="contactPerson">
          <el-input
            v-model="formData.contactPerson"
            placeholder="请输入联系人姓名"
            clearable
          />
        </el-form-item>

        <el-form-item label="联系电话" prop="contactPhone">
          <el-input
            v-model="formData.contactPhone"
            placeholder="请输入联系电话"
            maxlength="11"
            clearable
          />
        </el-form-item>

        <el-form-item label="联系邮箱" prop="contactEmail">
          <el-input
            v-model="formData.contactEmail"
            placeholder="请输入联系邮箱"
            clearable
          />
        </el-form-item>

        <el-form-item label="企业地址" prop="address">
          <el-input
            v-model="formData.address"
            type="textarea"
            :rows="3"
            placeholder="请输入企业详细地址"
          />
        </el-form-item>

        <el-divider content-position="left">资质文件</el-divider>

        <el-form-item label="营业执照" prop="businessLicense">
          <el-upload
            ref="businessLicenseUpload"
            :auto-upload="false"
            :limit="1"
            :on-change="handleBusinessLicenseChange"
            :on-exceed="handleExceed"
            accept=".jpg,.jpeg,.png,.pdf"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                支持jpg/png/pdf格式，文件大小不超过5MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="其他资质" prop="otherDocuments">
          <el-upload
            ref="otherDocumentsUpload"
            :auto-upload="false"
            :limit="5"
            :on-change="handleOtherDocumentsChange"
            :on-exceed="handleExceed"
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                支持jpg/png/pdf/doc/docx格式，最多5个文件，每个文件不超过5MB
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleSubmit">
            提交注册
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="handleBack">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { registerCompany } from '@/api/company';
import { useRouter } from 'vue-router';

const router = useRouter();
const formRef = ref(null);
const businessLicenseUpload = ref(null);
const otherDocumentsUpload = ref(null);
const loading = ref(false);

const formData = reactive({
  name: '',
  creditCode: '',
  legalPerson: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  address: '',
  businessLicense: null,
  otherDocuments: []
});

const rules = {
  name: [
    { required: true, message: '请输入企业名称', trigger: 'blur' }
  ],
  creditCode: [
    { required: true, message: '请输入统一社会信用代码', trigger: 'blur' },
    { len: 18, message: '统一社会信用代码必须为18位', trigger: 'blur' }
  ],
  legalPerson: [
    { required: true, message: '请输入法人代表', trigger: 'blur' }
  ],
  contactPerson: [
    { required: true, message: '请输入联系人', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  contactEmail: [
    { required: true, message: '请输入联系邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入企业地址', trigger: 'blur' }
  ],
  businessLicense: [
    { required: true, message: '请上传营业执照', trigger: 'change' }
  ]
};

const handleBusinessLicenseChange = (file) => {
  formData.businessLicense = file.raw;
};

const handleOtherDocumentsChange = (file, fileList) => {
  formData.otherDocuments = fileList.map(item => item.raw);
};

const handleExceed = () => {
  ElMessage.warning('文件数量超出限制');
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    
    loading.value = true;
    
    // 创建FormData对象
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('creditCode', formData.creditCode);
    submitData.append('legalPerson', formData.legalPerson);
    submitData.append('contactPerson', formData.contactPerson);
    submitData.append('contactPhone', formData.contactPhone);
    submitData.append('contactEmail', formData.contactEmail);
    submitData.append('address', formData.address);
    
    if (formData.businessLicense) {
      submitData.append('businessLicense', formData.businessLicense);
    }
    
    formData.otherDocuments.forEach(file => {
      submitData.append('otherDocuments', file);
    });
    
    const result = await registerCompany(submitData);
    
    if (result.success) {
      ElMessage.success('企业注册成功，请等待审核');
      handleReset();
      // 可以跳转到企业列表或状态查询页面
      setTimeout(() => {
        router.push('/company/status');
      }, 1500);
    }
  } catch (error) {
    if (error.errors) {
      // 表单验证错误
      ElMessage.error('请检查表单填写是否正确');
    } else {
      ElMessage.error(error.message || '注册失败，请稍后重试');
    }
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  formRef.value.resetFields();
  formData.businessLicense = null;
  formData.otherDocuments = [];
  businessLicenseUpload.value?.clearFiles();
  otherDocumentsUpload.value?.clearFiles();
};

const handleBack = () => {
  router.back();
};
</script>

<style scoped>
.company-register {
  padding: 20px;
  min-height: 100vh;
}

.register-card {
  max-width: 900px;
  margin: 0 auto;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
}

.subtitle {
  margin: 10px 0 0;
  color: #909399;
  font-size: 14px;
}

.register-form {
  margin-top: 20px;
}

:deep(.el-divider__text) {
  font-weight: 600;
  color: #409eff;
}

:deep(.el-upload__tip) {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
}
</style>
