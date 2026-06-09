<template>
  <div class="company-status">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>企业审核状态</h2>
          <el-button type="primary" @click="loadData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="待审核" name="pending" />
        <el-tab-pane label="已通过" name="approved" />
        <el-tab-pane label="已驳回" name="rejected" />
      </el-tabs>

      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" />
        
        <el-table-column prop="name" label="企业名称" min-width="180" />
        
        <el-table-column prop="creditCode" label="信用代码" width="180" />
        
        <el-table-column prop="contactPerson" label="联系人" width="100" />
        
        <el-table-column prop="contactPhone" label="联系电话" width="120" />
        
        <el-table-column prop="status" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="warning">
              待审核
            </el-tag>
            <el-tag v-else-if="row.status === 'approved'" type="success">
              已通过
            </el-tag>
            <el-tag v-else-if="row.status === 'rejected'" type="danger">
              已驳回
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="申请时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="approvedAt" label="审核时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.approved_at || row.rejected_at) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleView(row)"
            >
              查看详情
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
        <el-descriptions-item label="审核状态" :span="2">
          <el-tag v-if="currentCompany.status === 'pending'" type="warning">
            待审核
          </el-tag>
          <el-tag v-else-if="currentCompany.status === 'approved'" type="success">
            已通过
          </el-tag>
          <el-tag v-else-if="currentCompany.status === 'rejected'" type="danger">
            已驳回
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请时间" :span="2">
          {{ formatDate(currentCompany.created_at) }}
        </el-descriptions-item>
        <el-descriptions-item 
          v-if="currentCompany.approved_at" 
          label="审核通过时间" 
          :span="2"
        >
          {{ formatDate(currentCompany.approved_at) }}
        </el-descriptions-item>
        <el-descriptions-item 
          v-if="currentCompany.rejected_at" 
          label="驳回时间" 
          :span="2"
        >
          {{ formatDate(currentCompany.rejected_at) }}
        </el-descriptions-item>
        <el-descriptions-item 
          v-if="currentCompany.reject_reason" 
          label="驳回原因" 
          :span="2"
        >
          <el-text type="danger">{{ currentCompany.reject_reason }}</el-text>
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
        <el-button 
          v-if="currentCompany?.status === 'approved'" 
          type="success"
          @click="handleActivate"
        >
          激活企业
        </el-button>
      </template>
    </el-dialog>

    <!-- 激活成功提示 -->
    <el-dialog
      v-model="activateDialogVisible"
      title="企业激活成功"
      width="500px"
      :show-close="false"
      :close-on-click-modal="false"
    >
      <el-result
        icon="success"
        title="企业已激活"
        sub-title="您的企业已成功激活，现在可以使用系统的所有功能"
      >
        <template #extra>
          <el-button type="primary" @click="goToHome">
            进入系统
          </el-button>
        </template>
      </el-result>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import { getCompanies } from '@/api/company';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const tableData = ref([]);
const activeTab = ref('all');
const detailDialogVisible = ref(false);
const activateDialogVisible = ref(false);
const currentCompany = ref(null);

const loadData = async () => {
  try {
    loading.value = true;
    const status = activeTab.value === 'all' ? null : activeTab.value;
    const result = await getCompanies({ status });
    if (result.success) {
      tableData.value = result.data;
    }
  } catch (error) {
    ElMessage.error(error.message || '加载数据失败');
  } finally {
    loading.value = false;
  }
};

const handleTabChange = () => {
  loadData();
};

const handleView = (row) => {
  currentCompany.value = row;
  detailDialogVisible.value = true;
};

const handleActivate = () => {
  detailDialogVisible.value = false;
  activateDialogVisible.value = true;
  // 这里可以调用激活接口，保存激活状态等
  ElMessage.success('企业激活成功');
};

const goToHome = () => {
  activateDialogVisible.value = false;
  router.push('/');
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
.company-status {
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

:deep(.el-tabs) {
  margin-bottom: 20px;
}
</style>
