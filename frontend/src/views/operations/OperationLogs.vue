<template>
  <div class="operation-logs">
    <div class="page-header">
      <h2>操作日志</h2>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="用户">
          <el-input
            v-model="filters.userId"
            placeholder="用户ID"
            clearable
            style="width: 150px;"
          />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="filters.action" placeholder="全部操作" clearable>
            <el-option label="创建" value="create" />
            <el-option label="更新" value="update" />
            <el-option label="删除" value="delete" />
            <el-option label="查询" value="query" />
            <el-option label="登录" value="login" />
            <el-option label="登出" value="logout" />
          </el-select>
        </el-form-item>
        <el-form-item label="模块">
          <el-select v-model="filters.module" placeholder="全部模块" clearable>
            <el-option label="用户管理" value="user" />
            <el-option label="系统配置" value="system" />
            <el-option label="权限管理" value="permission" />
            <el-option label="数据管理" value="data" />
            <el-option label="审核管理" value="audit" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="exportLogs">导出日志</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 日志列表 -->
    <el-card class="logs-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="logs"
        style="width: 100%"
        :default-sort="{ prop: 'created_at', order: 'descending' }"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="log-details">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="日志ID">
                  {{ row.id }}
                </el-descriptions-item>
                <el-descriptions-item label="用户ID">
                  {{ row.user_id }}
                </el-descriptions-item>
                <el-descriptions-item label="用户名">
                  {{ row.username }}
                </el-descriptions-item>
                <el-descriptions-item label="IP地址">
                  {{ row.ip_address }}
                </el-descriptions-item>
                <el-descriptions-item label="User Agent" :span="2">
                  {{ row.user_agent || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="操作描述" :span="2">
                  {{ row.description }}
                </el-descriptions-item>
                <el-descriptions-item label="请求数据" :span="2">
                  <pre class="log-data">{{ formatData(row.request_data) }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="响应数据" :span="2">
                  <pre class="log-data">{{ formatData(row.response_data) }}</pre>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="user_id" label="用户ID" width="100" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-tag :type="getActionType(row.action)" size="small">
              {{ getActionName(row.action) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="模块" width="120">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ getModuleName(row.module) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip_address" label="IP地址" width="150" />
        <el-table-column prop="created_at" label="操作时间" width="180" sortable>
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty v-if="logs.length === 0 && !loading" description="暂无操作日志" />

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[20, 50, 100, 200]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getOperationLogs } from '@/api/operations';

const loading = ref(false);
const logs = ref([]);
const dateRange = ref([]);

const filters = reactive({
  userId: '',
  action: '',
  module: '',
  startDate: '',
  endDate: ''
});

const pagination = reactive({
  page: 1,
  pageSize: 50,
  total: 0
});

const fetchLogs = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters
    };
    const response = await getOperationLogs(params);
    if (response.success) {
      logs.value = response.data.list;
      pagination.total = response.data.pagination.total;
    }
  } catch (error) {
    ElMessage.error('获取操作日志失败');
  } finally {
    loading.value = false;
  }
};

const handleDateChange = (value) => {
  if (value) {
    filters.startDate = value[0];
    filters.endDate = value[1];
  } else {
    filters.startDate = '';
    filters.endDate = '';
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchLogs();
};

const handleReset = () => {
  Object.assign(filters, {
    userId: '',
    action: '',
    module: '',
    startDate: '',
    endDate: ''
  });
  dateRange.value = [];
  handleSearch();
};

const handlePageChange = (page) => {
  pagination.page = page;
  fetchLogs();
};

const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchLogs();
};

const exportLogs = () => {
  ElMessage.info('导出日志功能开发中...');
  // 实现日志导出功能
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
};

const formatData = (data) => {
  if (!data) return '-';
  if (typeof data === 'string') {
    try {
      return JSON.stringify(JSON.parse(data), null, 2);
    } catch {
      return data;
    }
  }
  return JSON.stringify(data, null, 2);
};

const getActionType = (action) => {
  const typeMap = {
    create: 'success',
    update: 'warning',
    delete: 'danger',
    query: 'info',
    login: 'success',
    logout: 'info'
  };
  return typeMap[action] || 'info';
};

const getActionName = (action) => {
  const nameMap = {
    create: '创建',
    update: '更新',
    delete: '删除',
    query: '查询',
    login: '登录',
    logout: '登出'
  };
  return nameMap[action] || action;
};

const getModuleName = (module) => {
  const nameMap = {
    user: '用户管理',
    system: '系统配置',
    permission: '权限管理',
    data: '数据管理',
    audit: '审核管理'
  };
  return nameMap[module] || module;
};

onMounted(() => {
  fetchLogs();
});
</script>

<style scoped>
.operation-logs {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 0;
}

.logs-card {
  min-height: 400px;
}

.log-details {
  padding: 20px;
  background-color: #f5f7fa;
}

.log-data {
  margin: 0;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
