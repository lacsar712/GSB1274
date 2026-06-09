<template>
  <div class="system-logs">
    <div class="page-header">
      <h2>系统日志</h2>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="日志级别">
          <el-select v-model="filters.level" placeholder="全部级别" clearable>
            <el-option label="调试 (DEBUG)" value="debug" />
            <el-option label="信息 (INFO)" value="info" />
            <el-option label="警告 (WARNING)" value="warning" />
            <el-option label="错误 (ERROR)" value="error" />
            <el-option label="严重 (CRITICAL)" value="critical" />
          </el-select>
        </el-form-item>
        <el-form-item label="模块">
          <el-select v-model="filters.module" placeholder="全部模块" clearable>
            <el-option label="系统" value="system" />
            <el-option label="数据库" value="database" />
            <el-option label="API" value="api" />
            <el-option label="认证" value="auth" />
            <el-option label="业务" value="business" />
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
        <el-form-item label="关键词">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索日志内容"
            clearable
            style="width: 200px;"
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
                  {{ row.user_id || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="IP地址">
                  {{ row.ip_address || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="时间">
                  {{ formatDate(row.created_at) }}
                </el-descriptions-item>
                <el-descriptions-item label="消息" :span="2">
                  <pre class="log-message">{{ row.message }}</pre>
                </el-descriptions-item>
                <el-descriptions-item label="详细信息" :span="2">
                  <pre class="log-details-content">{{ formatDetails(row.details) }}</pre>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" size="small">
              {{ getLevelName(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="120">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.module }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="消息" min-width="300" show-overflow-tooltip />
        <el-table-column prop="ip_address" label="IP地址" width="150" />
        <el-table-column prop="created_at" label="时间" width="180" sortable>
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty v-if="logs.length === 0 && !loading" description="暂无日志记录" />

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
import { getSystemLogs } from '@/api/operations';

const loading = ref(false);
const logs = ref([]);
const dateRange = ref([]);

const filters = reactive({
  level: '',
  module: '',
  startDate: '',
  endDate: '',
  keyword: ''
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
    const response = await getSystemLogs(params);
    if (response.success) {
      logs.value = response.data.list;
      pagination.total = response.data.pagination.total;
    }
  } catch (error) {
    ElMessage.error('获取系统日志失败');
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
    level: '',
    module: '',
    startDate: '',
    endDate: '',
    keyword: ''
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

const formatDetails = (details) => {
  if (!details) return '-';
  if (typeof details === 'string') return details;
  return JSON.stringify(details, null, 2);
};

const getLevelType = (level) => {
  const typeMap = {
    debug: 'info',
    info: 'success',
    warning: 'warning',
    error: 'danger',
    critical: 'danger'
  };
  return typeMap[level] || 'info';
};

const getLevelName = (level) => {
  const nameMap = {
    debug: 'DEBUG',
    info: 'INFO',
    warning: 'WARN',
    error: 'ERROR',
    critical: 'CRIT'
  };
  return nameMap[level] || level.toUpperCase();
};

onMounted(() => {
  fetchLogs();
});
</script>

<style scoped>
.system-logs {
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

.log-message {
  margin: 0;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.log-details-content {
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
