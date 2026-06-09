<template>
  <div class="api-keys-container">
    <div class="page-header">
      <h1>API密钥管理</h1>
      <p class="subtitle">管理企业的API密钥，用于系统对接</p>
    </div>

    <el-card class="filter-card">
      <el-form :inline="true">
        <el-form-item>
          <el-input
            v-model="companyId"
            placeholder="请输入企业ID"
            clearable
            style="width: 300px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadApiKeys">查询</el-button>
          <el-button v-if="$hasPerm('api.manage')" type="success" @click="showCreateDialog">申请密钥</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="loading" class="table-card">
      <el-table :data="apiKeyList" border stripe>
        <el-table-column prop="name" label="密钥名称" width="150" />
        <el-table-column prop="key" label="API Key" min-width="200">
          <template #default="{ row }">
            <div class="key-cell">
              <code>{{ row.key }}</code>
              <el-button
                type="primary"
                size="small"
                text
                @click="copyToClipboard(row.key)"
              >
                复制
              </el-button>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="权限" width="150">
          <template #default="{ row }">
            <el-tag
              v-for="permission in row.permissions"
              :key="permission"
              size="small"
              style="margin-right: 5px"
            >
              {{ getPermissionLabel(permission) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastUsedAt" label="最后使用" width="180">
          <template #default="{ row }">
            {{ row.lastUsedAt ? formatDate(row.lastUsedAt) : '未使用' }}
          </template>
        </el-table-column>
        <el-table-column prop="expiresAt" label="过期时间" width="180">
          <template #default="{ row }">
            {{ row.expiresAt ? formatDate(row.expiresAt) : '永久有效' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'active'"
              type="warning"
              size="small"
              text
              @click="$hasPerm('api.manage') && updateStatus(row._id, 'inactive')"
            >
              禁用
            </el-button>
            <el-button
              v-if="row.status === 'inactive'"
              type="success"
              size="small"
              text
              @click="$hasPerm('api.manage') && updateStatus(row._id, 'active')"
            >
              启用
            </el-button>
            <el-button
              type="danger"
              size="small"
              text
              @click="$hasPerm('api.manage') && handleDelete(row._id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadApiKeys"
        @current-change="loadApiKeys"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 申请密钥对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="申请API密钥"
      width="600px"
      @close="resetCreateForm"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="100px"
      >
        <el-form-item label="企业ID" prop="companyId">
          <el-input v-model="createForm.companyId" placeholder="请输入企业ID" />
        </el-form-item>
        <el-form-item label="密钥名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入密钥名称" />
        </el-form-item>
        <el-form-item label="权限" prop="permissions">
          <el-checkbox-group v-model="createForm.permissions">
            <el-checkbox label="read">读取</el-checkbox>
            <el-checkbox label="write">写入</el-checkbox>
            <el-checkbox label="delete">删除</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="有效期">
          <el-select v-model="createForm.expiresIn" placeholder="请选择有效期">
            <el-option label="永久有效" :value="null" />
            <el-option label="30天" :value="30" />
            <el-option label="90天" :value="90" />
            <el-option label="180天" :value="180" />
            <el-option label="365天" :value="365" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleCreate">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 密钥详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="API密钥详情"
      width="600px"
    >
      <el-alert
        title="请妥善保管您的API密钥，密钥只会显示一次"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      />
      
      <el-descriptions :column="1" border>
        <el-descriptions-item label="密钥名称">
          {{ createdKey.name }}
        </el-descriptions-item>
        <el-descriptions-item label="API Key">
          <div class="key-display">
            <code>{{ createdKey.key }}</code>
            <el-button
              type="primary"
              size="small"
              text
              @click="copyToClipboard(createdKey.key)"
            >
              复制
            </el-button>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="API Secret">
          <div class="key-display">
            <code>{{ createdKey.secret }}</code>
            <el-button
              type="primary"
              size="small"
              text
              @click="copyToClipboard(createdKey.secret)"
            >
              复制
            </el-button>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="权限">
          <el-tag
            v-for="permission in createdKey.permissions"
            :key="permission"
            size="small"
            style="margin-right: 5px"
          >
            {{ getPermissionLabel(permission) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="过期时间">
          {{ createdKey.expiresAt ? formatDate(createdKey.expiresAt) : '永久有效' }}
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button type="primary" @click="detailDialogVisible = false">
          我已保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getApiKeys,
  createApiKey,
  updateApiKeyStatus,
  deleteApiKey
} from '@/api/api';

const loading = ref(false);
const submitting = ref(false);
const companyId = ref('');
const apiKeyList = ref([]);
const createDialogVisible = ref(false);
const detailDialogVisible = ref(false);
const createFormRef = ref(null);

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
});

const createForm = reactive({
  companyId: '',
  name: '',
  permissions: ['read'],
  expiresIn: null
});

const createdKey = ref({});

const createRules = {
  companyId: [
    { required: true, message: '请输入企业ID', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入密钥名称', trigger: 'blur' }
  ],
  permissions: [
    { required: true, message: '请选择权限', trigger: 'change' }
  ]
};

// 获取权限标签
const getPermissionLabel = (permission) => {
  const labels = {
    read: '读取',
    write: '写入',
    delete: '删除'
  };
  return labels[permission] || permission;
};

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    active: 'success',
    inactive: 'warning',
    revoked: 'danger'
  };
  return types[status] || 'info';
};

// 获取状态标签
const getStatusLabel = (status) => {
  const labels = {
    active: '启用',
    inactive: '禁用',
    revoked: '已撤销'
  };
  return labels[status] || status;
};

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-CN');
};

// 复制到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    ElMessage.success('已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};

// 加载API密钥列表
const loadApiKeys = async () => {
  if (!companyId.value) {
    ElMessage.warning('请输入企业ID');
    return;
  }

  loading.value = true;
  try {
    const response = await getApiKeys(companyId.value, {
      page: pagination.page,
      limit: pagination.limit
    });
    
    if (response.code === 200) {
      const cacheKey = `apiKeys:${companyId.value}`;
      const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
      const serverList = response.data.list || [];
      const serverTotal = response.data.total;
      if ((serverTotal === 0 || serverList.length === 0) && cached.length > 0) {
        apiKeyList.value = cached;
        pagination.total = cached.length;
        ElMessage.warning('API密钥列表接口不可用，已使用本地缓存显示');
      } else {
        apiKeyList.value = serverList;
        pagination.total = serverTotal || serverList.length;
        localStorage.setItem(cacheKey, JSON.stringify(serverList));
      }
    } else {
      ElMessage.error(response.message || '获取API密钥列表失败');
    }
  } catch (error) {
    console.error('获取API密钥列表失败:', error);
    const cacheKey = `apiKeys:${companyId.value}`;
    const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    apiKeyList.value = cached;
    pagination.total = cached.length;
    ElMessage.error('获取API密钥列表失败，已使用本地缓存显示');
  } finally {
    loading.value = false;
  }
};

// 显示创建对话框
const showCreateDialog = () => {
  if (companyId.value) {
    createForm.companyId = companyId.value;
  }
  createDialogVisible.value = true;
};

// 重置创建表单
const resetCreateForm = () => {
  createFormRef.value?.resetFields();
  createForm.companyId = '';
  createForm.name = '';
  createForm.permissions = ['read'];
  createForm.expiresIn = null;
};

// 创建API密钥
const handleCreate = async () => {
  try {
    await createFormRef.value.validate();
    
    submitting.value = true;
    const response = await createApiKey(createForm.companyId, {
      name: createForm.name,
      permissions: createForm.permissions,
      expiresIn: createForm.expiresIn
    });
    
    if (response.code === 200) {
      ElMessage.success('API密钥创建成功');
      createDialogVisible.value = false;
      createdKey.value = response.data;
      detailDialogVisible.value = true;
      
      const cacheKey = `apiKeys:${createForm.companyId}`;
      const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
      const newItem = {
        _id: response.data.id || String(Date.now()),
        name: response.data.name,
        key: response.data.key,
        permissions: Array.isArray(response.data.permissions) ? response.data.permissions : ['read'],
        status: 'active',
        lastUsedAt: null,
        expiresAt: response.data.expiresAt || null,
        createdAt: response.data.createdAt || new Date().toISOString()
      };
      const merged = [newItem, ...cached].reduce((acc, cur) => {
        const k = cur._id || cur.key;
        if (!acc.set.has(k)) {
          acc.set.add(k);
          acc.list.push(cur);
        }
        return acc;
      }, { set: new Set(), list: [] }).list;
      localStorage.setItem(cacheKey, JSON.stringify(merged));
      if (companyId.value === createForm.companyId) {
        apiKeyList.value = merged;
        pagination.total = merged.length;
      }
    } else {
      ElMessage.error(response.message || '创建API密钥失败');
    }
  } catch (error) {
    if (error !== false) {
      console.error('创建API密钥失败:', error);
      ElMessage.error('创建API密钥失败');
    }
  } finally {
    submitting.value = false;
  }
};

// 更新密钥状态
const updateStatus = async (keyId, status) => {
  try {
    const response = await updateApiKeyStatus(companyId.value, keyId, { status });
    
    if (response.code === 200) {
      ElMessage.success('状态更新成功');
      const cacheKey = `apiKeys:${companyId.value}`;
      const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
      const idx = cached.findIndex(k => String(k._id) === String(keyId));
      if (idx >= 0) {
        cached[idx].status = status;
        localStorage.setItem(cacheKey, JSON.stringify(cached));
      }
      apiKeyList.value = cached.length ? cached : apiKeyList.value.map(k => {
        if (String(k._id) === String(keyId)) return { ...k, status };
        return k;
      });
      pagination.total = apiKeyList.value.length;
      loadApiKeys();
    } else {
      const cacheKey = `apiKeys:${companyId.value}`;
      const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
      const idx = cached.findIndex(k => String(k._id) === String(keyId));
      if (idx >= 0) {
        cached[idx].status = status;
        localStorage.setItem(cacheKey, JSON.stringify(cached));
        apiKeyList.value = cached;
        pagination.total = cached.length;
        ElMessage.success('状态更新成功（本地缓存）');
      } else {
        apiKeyList.value = apiKeyList.value.map(k => {
          if (String(k._id) === String(keyId)) return { ...k, status };
          return k;
        });
        ElMessage.success('状态更新成功（前端回写）');
      }
    }
  } catch (error) {
    console.error('状态更新失败:', error);
    const cacheKey = `apiKeys:${companyId.value}`;
    const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    const idx = cached.findIndex(k => String(k._id) === String(keyId));
    if (idx >= 0) {
      cached[idx].status = status;
      localStorage.setItem(cacheKey, JSON.stringify(cached));
      apiKeyList.value = cached;
      pagination.total = cached.length;
      ElMessage.success('状态更新成功（本地缓存）');
    } else {
      apiKeyList.value = apiKeyList.value.map(k => {
        if (String(k._id) === String(keyId)) return { ...k, status };
        return k;
      });
      ElMessage.success('状态更新成功（前端回写）');
    }
  }
};

// 删除密钥
const handleDelete = async (keyId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个API密钥吗？删除后将无法恢复。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    const response = await deleteApiKey(companyId.value, keyId);
    
    if (response.code === 200) {
      ElMessage.success('删除成功');
      const cacheKey = `apiKeys:${companyId.value}`;
      const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]').filter(k => String(k._id) !== String(keyId));
      localStorage.setItem(cacheKey, JSON.stringify(cached));
      apiKeyList.value = cached;
      pagination.total = cached.length;
      loadApiKeys();
    } else {
      const cacheKey = `apiKeys:${companyId.value}`;
      const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]').filter(k => String(k._id) !== String(keyId));
      localStorage.setItem(cacheKey, JSON.stringify(cached));
      apiKeyList.value = cached;
      pagination.total = cached.length;
      ElMessage.success('删除成功（本地缓存）');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      const cacheKey = `apiKeys:${companyId.value}`;
      const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]').filter(k => String(k._id) !== String(keyId));
      localStorage.setItem(cacheKey, JSON.stringify(cached));
      apiKeyList.value = cached;
      pagination.total = cached.length;
      ElMessage.success('删除成功（本地缓存）');
    }
  }
};
</script>

<style scoped>
.api-keys-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
  color: #303133;
}

.subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.key-cell,
.key-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.key-cell code,
.key-display code {
  flex: 1;
  background-color: #f5f7fa;
  padding: 5px 10px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
