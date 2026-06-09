<template>
  <div class="driver-create">
    <div class="page-header">
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2>{{ isEdit ? '编辑驾驶员' : '新增驾驶员' }}</h2>
    </div>

    <el-card v-loading="loading">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="140px"
        class="driver-form"
      >
        <el-divider content-position="left">基本信息</el-divider>

        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="出生日期" prop="birthDate">
          <el-date-picker
            v-model="form.birthDate"
            type="date"
            placeholder="请选择出生日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>

        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" placeholder="请输入身份证号" />
        </el-form-item>

        <el-form-item label="住址" prop="address">
          <el-input
            v-model="form.address"
            type="textarea"
            :rows="3"
            placeholder="请输入住址"
          />
        </el-form-item>

        <el-divider content-position="left">驾驶证信息</el-divider>

        <el-form-item label="驾驶证号" prop="licenseNumber">
          <el-input v-model="form.licenseNumber" placeholder="请输入驾驶证号" />
        </el-form-item>

        <el-form-item label="驾驶证类型" prop="licenseType">
          <el-select v-model="form.licenseType" placeholder="请选择驾驶证类型">
            <el-option label="A1" value="A1" />
            <el-option label="A2" value="A2" />
            <el-option label="B1" value="B1" />
            <el-option label="B2" value="B2" />
            <el-option label="C1" value="C1" />
            <el-option label="C2" value="C2" />
          </el-select>
        </el-form-item>

        <el-form-item label="发证日期" prop="licenseIssueDate">
          <el-date-picker
            v-model="form.licenseIssueDate"
            type="date"
            placeholder="请选择发证日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="有效期" prop="licenseExpiryDate">
          <el-date-picker
            v-model="form.licenseExpiryDate"
            type="date"
            placeholder="请选择有效期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="驾龄" prop="drivingYears">
          <el-input-number
            v-model="form.drivingYears"
            :min="0"
            :max="50"
            placeholder="请输入驾龄"
          />
          <span style="margin-left: 10px">年</span>
        </el-form-item>

        <el-form-item label="从业资格证号" prop="qualificationNumber">
          <el-input v-model="form.qualificationNumber" placeholder="请输入从业资格证号" />
        </el-form-item>

        <el-form-item label="从业资格证有效期" prop="qualificationExpiryDate">
          <el-date-picker
            v-model="form.qualificationExpiryDate"
            type="date"
            placeholder="请选择从业资格证有效期"
            style="width: 100%"
          />
        </el-form-item>

        <el-divider content-position="left">紧急联系人</el-divider>

        <el-form-item label="紧急联系人" prop="emergencyContact">
          <el-input v-model="form.emergencyContact" placeholder="请输入紧急联系人" />
        </el-form-item>

        <el-form-item label="紧急联系电话" prop="emergencyPhone">
          <el-input v-model="form.emergencyPhone" placeholder="请输入紧急联系电话" />
        </el-form-item>

        <el-divider content-position="left">工作信息</el-divider>

        <el-form-item label="入职日期" prop="hireDate">
          <el-date-picker
            v-model="form.hireDate"
            type="date"
            placeholder="请选择入职日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">在职</el-radio>
            <el-radio label="inactive">离职</el-radio>
            <el-radio label="suspended">停职</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="form.remarks"
            type="textarea"
            :rows="4"
            placeholder="请输入备注"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '保存' : '创建' }}
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';
import { getDriverById, createDriver, updateDriver } from '@/api/driver';

const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();

const driverId = route.params.id;
const isEdit = computed(() => !!driverId);

const formRef = ref(null);
const loading = ref(false);
const submitting = ref(false);

// 表单数据
const form = reactive({
  name: '',
  gender: '',
  birthDate: '',
  phone: '',
  idCard: '',
  address: '',
  licenseNumber: '',
  licenseType: '',
  licenseIssueDate: '',
  licenseExpiryDate: '',
  drivingYears: null,
  qualificationNumber: '',
  qualificationExpiryDate: '',
  emergencyContact: '',
  emergencyPhone: '',
  hireDate: '',
  status: 'active',
  remarks: ''
});

// 验证规则
const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, message: '请输入正确的身份证号', trigger: 'blur' }
  ],
  licenseNumber: [
    { required: true, message: '请输入驾驶证号', trigger: 'blur' }
  ],
  licenseType: [
    { required: true, message: '请选择驾驶证类型', trigger: 'change' }
  ]
};

// 获取驾驶员详情
const fetchDriver = async () => {
  loading.value = true;
  try {
    const response = await getDriverById(driverId);
    if (response.code === 200) {
      Object.assign(form, response.data);
    }
  } catch (error) {
    proxy.$notifyError('获取驾驶员详情', error);
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    
    submitting.value = true;
    
    const data = { ...form };
    
    let response;
    if (isEdit.value) {
      response = await updateDriver(driverId, data);
    } else {
      response = await createDriver(data);
    }
    
    if (response.code === 200 || response.code === 201) {
      proxy.$notifySuccess(isEdit.value ? '更新驾驶员' : '创建驾驶员');
      router.push('/drivers');
    }
  } catch (error) {
    if (error !== false) {
      proxy.$notifyError(isEdit.value ? '更新驾驶员' : '创建驾驶员', error);
      console.error(error);
    }
  } finally {
    submitting.value = false;
  }
};

// 返回
const goBack = () => {
  router.back();
};

// 初始化
onMounted(() => {
  if (isEdit.value) {
    fetchDriver();
  }
});
</script>

<style scoped>
.driver-create {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.driver-form {
  max-width: 800px;
}

.el-divider {
  margin: 30px 0 20px;
}

.el-divider:first-child {
  margin-top: 0;
}
</style>
