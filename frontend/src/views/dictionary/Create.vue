<template>
  <div class="dictionary-form">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <h2>{{ isEdit ? '编辑字典' : '新增字典' }}</h2>
          <el-button @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        style="max-width: 800px"
      >
        <el-form-item label="字典类型" prop="type">
          <el-input
            v-model="formData.type"
            placeholder="请输入字典类型，如：user_status"
            clearable
          />
        </el-form-item>

        <el-form-item label="字典代码" prop="code">
          <el-input
            v-model="formData.code"
            placeholder="请输入字典代码，如：active"
            clearable
          />
        </el-form-item>

        <el-form-item label="字典名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入字典名称，如：启用"
            clearable
          />
        </el-form-item>

        <el-form-item label="字典值" prop="value">
          <el-input
            v-model="formData.value"
            placeholder="请输入字典值"
            clearable
          />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述信息"
          />
        </el-form-item>

        <el-form-item label="排序" prop="sortOrder">
          <el-input-number
            v-model="formData.sortOrder"
            :min="0"
            :max="9999"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">
            {{ isEdit ? '保存' : '创建' }}
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import {
  getDictionaryById,
  createDictionary,
  updateDictionary
} from '@/api/dictionary';

const router = useRouter();
const route = useRoute();

const formRef = ref(null);
const loading = ref(false);

// 是否为编辑模式
const isEdit = computed(() => !!route.params.id);

// 表单数据
const formData = reactive({
  type: '',
  code: '',
  name: '',
  value: '',
  description: '',
  sortOrder: 0,
  status: 'active'
});

// 表单验证规则
const formRules = {
  type: [
    { required: true, message: '请输入字典类型', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入字典代码', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入字典名称', trigger: 'blur' }
  ],
  value: [
    { required: true, message: '请输入字典值', trigger: 'blur' }
  ],
  sortOrder: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
};

// 加载字典详情（编辑模式）
const loadData = async () => {
  if (!isEdit.value) return;
  
  loading.value = true;
  try {
    const response = await getDictionaryById(route.params.id);
    if (response.data.success) {
      const data = response.data.data;
      Object.assign(formData, {
        type: data.type,
        code: data.code,
        name: data.name,
        value: data.value,
        description: data.description || '',
        sortOrder: data.sortOrder,
        status: data.status
      });
    }
  } catch (error) {
    ElMessage.error('加载数据失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    
    loading.value = true;
    
    if (isEdit.value) {
      // 更新
      const response = await updateDictionary(route.params.id, formData);
      if (response.data.success) {
        ElMessage.success('更新成功');
        router.push('/dictionary/list');
      }
    } else {
      // 创建
      const response = await createDictionary(formData);
      if (response.data.success) {
        ElMessage.success('创建成功');
        router.push('/dictionary/list');
      }
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败：' + error.message);
    }
  } finally {
    loading.value = false;
  }
};

// 重置表单
const handleReset = () => {
  formRef.value.resetFields();
};

// 返回
const handleBack = () => {
  router.back();
};

// 初始化
onMounted(() => {
  loadData();
});
</script>

<style scoped>
.dictionary-form {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
}
</style>
