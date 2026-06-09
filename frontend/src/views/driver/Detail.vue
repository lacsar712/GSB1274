<template>
  <div class="driver-detail">
    <div class="page-header">
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <div class="header-actions">
        <el-button type="primary" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button type="danger" @click="handleDelete">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </div>
    </div>

    <el-card v-loading="loading" class="detail-card">
      <template #header>
        <div class="card-header">
          <span class="title">驾驶员详情</span>
          <el-tag v-if="driver.status === 'active'" type="success">在职</el-tag>
          <el-tag v-else-if="driver.status === 'inactive'" type="info">离职</el-tag>
          <el-tag v-else-if="driver.status === 'suspended'" type="warning">停职</el-tag>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="驾驶员ID">
          {{ driver.id }}
        </el-descriptions-item>
        <el-descriptions-item label="姓名">
          {{ driver.name }}
        </el-descriptions-item>
        <el-descriptions-item label="性别">
          <span v-if="driver.gender === 'male'">男</span>
          <span v-else-if="driver.gender === 'female'">女</span>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="出生日期">
          {{ driver.birthDate ? formatDate(driver.birthDate) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ driver.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="身份证号">
          {{ driver.idCard }}
        </el-descriptions-item>
        <el-descriptions-item label="住址" :span="2">
          {{ driver.address || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">驾驶证信息</el-divider>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="驾驶证号">
          {{ driver.licenseNumber }}
        </el-descriptions-item>
        <el-descriptions-item label="驾驶证类型">
          {{ driver.licenseType }}
        </el-descriptions-item>
        <el-descriptions-item label="发证日期">
          {{ driver.licenseIssueDate ? formatDate(driver.licenseIssueDate) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="有效期">
          {{ driver.licenseExpiryDate ? formatDate(driver.licenseExpiryDate) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="驾龄">
          {{ driver.drivingYears ? driver.drivingYears + '年' : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="从业资格证号">
          {{ driver.qualificationNumber || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="从业资格证有效期" :span="2">
          {{ driver.qualificationExpiryDate ? formatDate(driver.qualificationExpiryDate) : '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">紧急联系人</el-divider>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="紧急联系人">
          {{ driver.emergencyContact || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="紧急联系电话">
          {{ driver.emergencyPhone || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">工作信息</el-divider>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="入职日期">
          {{ driver.hireDate ? formatDate(driver.hireDate) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="driver.status === 'active'" type="success">在职</el-tag>
          <el-tag v-else-if="driver.status === 'inactive'" type="info">离职</el-tag>
          <el-tag v-else-if="driver.status === 'suspended'" type="warning">停职</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ driver.remarks || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">系统信息</el-divider>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="创建时间">
          {{ driver.createdAt ? formatDateTime(driver.createdAt) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ driver.updatedAt ? formatDateTime(driver.updatedAt) : '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import {
  ArrowLeft,
  Edit,
  Delete
} from '@element-plus/icons-vue';
import { getDriverById, deleteDriver } from '@/api/driver';

const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();

const driverId = route.params.id;
const driver = ref({});
const loading = ref(false);

// 获取驾驶员详情
const fetchDriver = async () => {
  loading.value = true;
  try {
    const response = await getDriverById(driverId);
    if (response.code === 200) {
      driver.value = response.data;
    }
  } catch (error) {
    proxy.$notifyError('获取驾驶员详情', error);
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 返回
const goBack = () => {
  router.back();
};

// 编辑
const handleEdit = () => {
  router.push(`/drivers/${driverId}/edit`);
};

// 删除
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除该驾驶员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const response = await deleteDriver(driverId);
    if (response.code === 200) {
      proxy.$notifySuccess('删除驾驶员');
      router.push('/drivers');
    }
  } catch (error) {
    if (error !== 'cancel') {
      proxy.$notifyError('删除驾驶员', error);
      console.error(error);
    }
  }
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('zh-CN');
};

// 格式化日期时间
const formatDateTime = (datetime) => {
  if (!datetime) return '-';
  return new Date(datetime).toLocaleString('zh-CN');
};

// 初始化
onMounted(() => {
  fetchDriver();
});
</script>

<style scoped>
.driver-detail {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.detail-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .title {
  font-size: 18px;
  font-weight: 600;
}

.el-divider {
  margin: 30px 0 20px;
}
</style>
