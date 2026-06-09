<template>
  <div class="driver-list">
    <div class="page-header">
      <h2>驾驶员管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新增驾驶员
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="姓名/手机号/身份证/驾驶证号"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="在职" value="active" />
            <el-option label="离职" value="inactive" />
            <el-option label="停职" value="suspended" />
          </el-select>
        </el-form-item>
        <el-form-item label="驾驶证类型">
          <el-select v-model="searchForm.licenseType" placeholder="请选择驾驶证类型" clearable>
            <el-option label="A1" value="A1" />
            <el-option label="A2" value="A2" />
            <el-option label="B1" value="B1" />
            <el-option label="B2" value="B2" />
            <el-option label="C1" value="C1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计信息 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">总驾驶员数</div>
            <div class="stat-value">{{ statistics.total }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">在职</div>
            <div class="stat-value success">{{ statistics.active }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">离职</div>
            <div class="stat-value info">{{ statistics.inactive }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">停职</div>
            <div class="stat-value warning">{{ statistics.suspended }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-card class="table-card">
      <div class="table-header">
        <el-button
          type="danger"
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        stripe
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="idCard" label="身份证号" width="180" />
        <el-table-column prop="licenseNumber" label="驾驶证号" width="150" />
        <el-table-column prop="licenseType" label="驾驶证类型" width="100" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            <span v-if="row.gender === 'male'">男</span>
            <span v-else-if="row.gender === 'female'">女</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="drivingYears" label="驾龄" width="80">
          <template #default="{ row }">
            {{ row.drivingYears ? row.drivingYears + '年' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'active'" type="success">在职</el-tag>
            <el-tag v-else-if="row.status === 'inactive'" type="info">离职</el-tag>
            <el-tag v-else-if="row.status === 'suspended'" type="warning">停职</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="hireDate" label="入职日期" width="120">
          <template #default="{ row }">
            {{ row.hireDate ? formatDate(row.hireDate) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row.id)">
              查看
            </el-button>
            <el-button type="warning" size="small" @click="handleEdit(row.id)">
              编辑
            </el-button>
            <el-dropdown @command="(command) => handleStatusChange(row.id, command)">
              <el-button size="small">
                状态 <el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="active">在职</el-dropdown-item>
                  <el-dropdown-item command="inactive">离职</el-dropdown-item>
                  <el-dropdown-item command="suspended">停职</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="danger" size="small" @click="handleDelete(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        class="pagination"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import {
  Plus,
  Search,
  Refresh,
  Delete,
  ArrowDown
} from '@element-plus/icons-vue';
import {
  getDrivers,
  deleteDriver,
  batchDeleteDrivers,
  updateDriverStatus,
  getDriverStatistics
} from '@/api/driver';

const router = useRouter();
const { proxy } = getCurrentInstance();

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
  licenseType: ''
});

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

// 统计信息
const statistics = reactive({
  total: 0,
  active: 0,
  inactive: 0,
  suspended: 0
});

// 表格数据
const tableData = ref([]);
const loading = ref(false);
const selectedIds = ref([]);

// 获取驾驶员列表
const fetchDrivers = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    };
    const response = await getDrivers(params);
    if (response.code === 200) {
      tableData.value = response.data.list;
      pagination.total = response.data.total;
    }
  } catch (error) {
    proxy.$notifyError('获取驾驶员列表', error);
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 获取统计信息
const fetchStatistics = async () => {
  try {
    const response = await getDriverStatistics();
    if (response.code === 200) {
      Object.assign(statistics, response.data);
    }
  } catch (error) {
    console.error('获取统计信息失败:', error);
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchDrivers();
};

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    status: '',
    licenseType: ''
  });
  handleSearch();
};

// 新增
const handleCreate = () => {
  router.push('/drivers/create');
};

// 查看
const handleView = (id) => {
  router.push(`/drivers/${id}`);
};

// 编辑
const handleEdit = (id) => {
  router.push(`/drivers/${id}/edit`);
};

// 删除
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该驾驶员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const response = await deleteDriver(id);
    if (response.code === 200) {
      proxy.$notifySuccess('删除驾驶员');
      fetchDrivers();
      fetchStatistics();
    }
  } catch (error) {
    if (error !== 'cancel') {
      proxy.$notifyError('删除驾驶员', error);
      console.error(error);
    }
  }
};

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个驾驶员吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    const response = await batchDeleteDrivers(selectedIds.value);
    if (response.code === 200) {
      proxy.$notifySuccess('批量删除驾驶员');
      selectedIds.value = [];
      fetchDrivers();
      fetchStatistics();
    }
  } catch (error) {
    if (error !== 'cancel') {
      proxy.$notifyError('批量删除驾驶员', error);
      console.error(error);
    }
  }
};

// 更新状态
const handleStatusChange = async (id, status) => {
  try {
    const response = await updateDriverStatus(id, status);
    if (response.code === 200) {
      proxy.$notifySuccess('更新驾驶员状态');
      fetchDrivers();
      fetchStatistics();
    }
  } catch (error) {
    proxy.$notifyError('更新驾驶员状态', error);
    console.error(error);
  }
};

// 选择变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map((item) => item.id);
};

// 分页大小变化
const handleSizeChange = () => {
  pagination.page = 1;
  fetchDrivers();
};

// 页码变化
const handlePageChange = () => {
  fetchDrivers();
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('zh-CN');
};

// 初始化
onMounted(() => {
  fetchDrivers();
  fetchStatistics();
});
</script>

<style scoped>
.driver-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.statistics-row {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 10px 0;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.stat-value.success {
  color: #67c23a;
}

.stat-value.info {
  color: #909399;
}

.stat-value.warning {
  color: #e6a23c;
}

.table-card {
  margin-bottom: 20px;
}

.table-header {
  margin-bottom: 15px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
