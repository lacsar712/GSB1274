<template>
  <div class="company-audit">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>企业审核管理</h2>
          <el-button type="primary" @click="loadData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" />
        
        <el-table-column prop="name" label="企业名称" min-width="180" />
        
        <el-table-column prop="creditCode" label="信用代码" width="180" />
        
        <el-table-column prop="legalPerson" label="法人代表" width="100" />
        
        <el-table-column prop="contactPerson" label="联系人" width="100" />
        
        <el-table-column prop="contactPhone" label="联系电话" width="120" />
        
        <el-table-column prop="createdAt" label="申请时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleView(row)"
            >
              查看详情
            </el-button>
            <el-button
              type="success"
              size="small"
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleReject(row)"
            >
              驳回
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 企业详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="企业详情"
      width="800px"
    >
      <el-descriptions :column="2" border v-if="currentCompany">
        <el-descriptions-item label="企业名称" :span="2">
          {{ currentCompany.name }}
        </el-descriptions-item>
        <el-descriptions-item label="信用代码" :span="2">
          {{ currentCompany.credit_code }}
        </el-descriptions-item>
        <el-descriptions-item label="法人代表">
          {{ currentCompany.legal_person }}
        </el-descriptions-item>
        <el-descriptions-item label="联系人">
          {{ currentCompany.contact_person }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ currentCompany.contact_phone }}
        </el-descriptions-item>
        <el-descriptions-item label="联系邮箱">
          {{ currentCompany.contact_email }}
        </el-descriptions-item>
        <el-descriptions-item label="企业地址" :span="2">
          {{ currentCompany.address }}
        </el-descriptions-item>
        <el-descriptions-item label="申请时间" :span="2">
          {{ formatDate(currentCompany.created_at) }}
        </el-descriptions-item>
        <el-descriptions-item label="营业执照" :span="2">
          <el-link
            v-if="currentCompany.business_license"
            type="primary"
            :href="getFileUrl(currentCompany.business_license)"
            target="_blank"
          >
            查看文件
          </el-link>
          <span v-else>未上传</span>
        </el-descriptions-item>
        <el-descriptions-item label="其他资质" :span="2">
          <div v-if="currentCompany.other_documents">
            <el-link
              v-for="(doc, index) in currentCompany.other_documents.split(',')"
              :key="index"
              type="primary"
              :href="getFileUrl(doc)"
              target="_blank"
              style="margin-right: 10px"
            >
              文件{{ index + 1 }}
            </el-link>
          </div>
          <span v-else>未上传</span>
        </el-descriptions-item>
      </el-descriptions>
      
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="success" @click="handleApprove(currentCompany)">
          审核通过
        </el-button>
        <el-button type="danger" @click="handleReject(currentCompany)">
          驳回申请
        </el-button>
      </template>
    </el-dialog>

    <!-- 驳回原因对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="驳回申请"
      width="500px"
    >
      <el-form :model="rejectForm" :rules="rejectRules" ref="rejectFormRef">
        <el-form-item label="驳回原因" prop="reason">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入驳回原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="rejecting" @click="confirmReject">
          确认驳回
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import { getPendingCompanies, approveCompany, rejectCompany } from '@/api/company';

const loading = ref(false);
const tableData = ref([]);
const detailDialogVisible = ref(false);
const rejectDialogVisible = ref(false);
const currentCompany = ref(null);
const rejectFormRef = ref(null);
const rejecting = ref(false);

const rejectForm = reactive({
  reason: ''
});

const rejectRules = {
  reason: [
    { required: true, message: '请输入驳回原因', trigger: 'blur' }
  ]
};

const loadData = async () => {
  try {
    loading.value = true;
    const result = await getPendingCompanies();
    if (result.success) {
      tableData.value = result.data;
    }
  } catch (error) {
    ElMessage.error(error.message || '加载数据失败');
  } finally {
    loading.value = false;
  }
};

const handleView = (row) => {
  currentCompany.value = row;
  detailDialogVisible.value = true;
};

const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认审核通过企业"${row.name}"吗？`,
      '确认操作',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    const result = await approveCompany(row.id);
    if (result.success) {
      ElMessage.success('审核通过成功');
      detailDialogVisible.value = false;
      loadData();
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '审核操作失败');
    }
  }
};

const handleReject = (row) => {
  currentCompany.value = row;
  rejectForm.reason = '';
  rejectDialogVisible.value = true;
};

const confirmReject = async () => {
  try {
    await rejectFormRef.value.validate();
    
    rejecting.value = true;
    const result = await rejectCompany(currentCompany.value.id, rejectForm.reason);
    
    if (result.success) {
      ElMessage.success('已驳回企业申请');
      rejectDialogVisible.value = false;
      detailDialogVisible.value = false;
      loadData();
    }
  } catch (error) {
    if (error.errors) {
      ElMessage.error('请填写驳回原因');
    } else {
      ElMessage.error(error.message || '驳回操作失败');
    }
  } finally {
    rejecting.value = false;
  }
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

const getFileUrl = (path) => {
  if (!path) return '';
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  return `${baseUrl.replace('/api', '')}/${path}`;
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.company-audit {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #303133;
  font-size: 20px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}
</style>
