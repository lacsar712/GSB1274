<template>
  <div class="delivery-list">
    <div class="page-header">
      <div class="header-actions">
        <CompanySelect v-model="selectedCompanyId" />
      </div>
    </div>
    <el-card class="filter-card">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="枢纽">
          <el-input v-model="filters.hub_id" placeholder="请输入枢纽ID" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="请选择状态" clearable>
            <el-option label="待分配" value="pending" />
            <el-option label="已分配" value="assigned" />
            <el-option label="取货中" value="picking" />
            <el-option label="配送中" value="delivering" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="配送类型">
          <el-select v-model="filters.delivery_type" placeholder="请选择配送类型" clearable>
            <el-option label="即时配送" value="instant" />
            <el-option label="预约配送" value="scheduled" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="订单号/收件人/电话" clearable />
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleCreate">新建订单</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="deliveries" v-loading="loading" border stripe>
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="hub_name" label="枢纽" width="120" />
        <el-table-column label="收件人信息" width="200">
          <template #default="{ row }">
            <div>{{ row.receiver_name }}</div>
            <div class="text-secondary">{{ row.receiver_phone }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="receiver_address" label="收件地址" min-width="200" show-overflow-tooltip />
        <el-table-column label="货物信息" width="150">
          <template #default="{ row }">
            <div>{{ row.goods_type }}</div>
            <div class="text-secondary">{{ row.goods_weight }}kg / {{ row.goods_volume }}m³</div>
          </template>
        </el-table-column>
        <el-table-column prop="delivery_type" label="配送类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.delivery_type === 'instant' ? 'danger' : 'warning'">
              {{ row.delivery_type === 'instant' ? '即时' : '预约' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="driver_name" label="配送员" width="100" />
        <el-table-column prop="created_at" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button 
              v-if="row.status === 'pending'" 
              link 
              type="success" 
              size="small" 
              @click="handleAssign(row)"
            >
              分配
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.page_size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        class="pagination"
      />
    </el-card>

    <!-- 分配配送员对话框 -->
    <el-dialog v-model="assignDialogVisible" title="分配配送员" width="500px">
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="配送员ID">
          <el-input v-model="assignForm.driver_id" placeholder="请输入配送员ID" />
        </el-form-item>
        <el-form-item label="配送员姓名">
          <el-input v-model="assignForm.driver_name" placeholder="请输入配送员姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAssign">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getDeliveries, deleteDelivery, assignDriver } from '@/api/delivery';
import CompanySelect from '@/components/CompanySelect.vue';

const router = useRouter();
const loading = ref(false);
const deliveries = ref([]);
const dateRange = ref([]);
const selectedCompanyId = ref('');

const filters = reactive({
  hub_id: '',
  status: '',
  delivery_type: '',
  keyword: ''
});

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0
});

const assignDialogVisible = ref(false);
const assignForm = reactive({
  delivery_id: null,
  driver_id: '',
  driver_name: ''
});

// 获取配送订单列表
const fetchDeliveries = async () => {
  loading.value = true;
  try {
    const params = {
      ...filters,
      page: pagination.page,
      page_size: pagination.page_size
    };

    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0];
      params.end_date = dateRange.value[1];
    }
    if (selectedCompanyId.value) {
      params.company_id = selectedCompanyId.value;
    }

    const response = await getDeliveries(params);
    if (response.success) {
      deliveries.value = response.data.list;
      pagination.total = response.data.pagination.total;
    }
  } catch (error) {
    ElMessage.error('获取配送订单列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchDeliveries();
};

// 重置
const handleReset = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = '';
  });
  dateRange.value = [];
  pagination.page = 1;
  fetchDeliveries();
};

// 新建订单
const handleCreate = () => {
  router.push('/delivery/create');
};

// 查看详情
const handleView = (row) => {
  router.push(`/delivery/detail/${row.id}`);
};

// 编辑
const handleEdit = (row) => {
  router.push(`/delivery/edit/${row.id}`);
};

// 分配配送员
const handleAssign = (row) => {
  assignForm.delivery_id = row.id;
  assignForm.driver_id = '';
  assignForm.driver_name = '';
  assignDialogVisible.value = true;
};

// 确认分配
const handleConfirmAssign = async () => {
  if (!assignForm.driver_id || !assignForm.driver_name) {
    ElMessage.warning('请填写完整的配送员信息');
    return;
  }

  try {
    const response = await assignDriver(assignForm.delivery_id, {
      driver_id: assignForm.driver_id,
      driver_name: assignForm.driver_name
    });

    if (response.success) {
      ElMessage.success('分配成功');
      assignDialogVisible.value = false;
      fetchDeliveries();
    }
  } catch (error) {
    ElMessage.error('分配失败');
  }
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该配送订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await deleteDelivery(row.id);
      if (response.success) {
        ElMessage.success('删除成功');
        fetchDeliveries();
      }
    } catch (error) {
      ElMessage.error('删除失败');
    }
  });
};

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.page_size = size;
  pagination.page = 1;
  fetchDeliveries();
};

// 页码改变
const handlePageChange = (page) => {
  pagination.page = page;
  fetchDeliveries();
};

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'info',
    assigned: 'warning',
    picking: 'primary',
    delivering: 'primary',
    completed: 'success',
    cancelled: 'danger'
  };
  return typeMap[status] || 'info';
};

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    pending: '待分配',
    assigned: '已分配',
    picking: '取货中',
    delivering: '配送中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return textMap[status] || status;
};

onMounted(() => {
  fetchDeliveries();
});

watch(selectedCompanyId, async () => {
  pagination.page = 1;
  await fetchDeliveries();
});
</script>

<style scoped>
.delivery-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: -18px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.text-secondary {
  color: #909399;
  font-size: 12px;
}
</style>
