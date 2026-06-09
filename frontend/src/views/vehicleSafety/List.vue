<template>
  <div class="safety-list">
    <div class="page-header">
      <div class="header-actions">
        <CompanySelect v-model="selectedCompanyId" />
      </div>
    </div>
    <el-card class="filter-card">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="车辆ID">
          <el-input v-model="filters.vehicle_id" placeholder="请输入车辆ID" clearable />
        </el-form-item>
        <el-form-item label="事件类型">
          <el-select v-model="filters.event_type" placeholder="请选择事件类型" clearable>
            <el-option label="超速" value="speeding" />
            <el-option label="急刹车" value="hard_brake" />
            <el-option label="急加速" value="hard_acceleration" />
            <el-option label="疲劳驾驶" value="fatigue_driving" />
            <el-option label="偏离路线" value="route_deviation" />
            <el-option label="违规停车" value="illegal_parking" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="事件等级">
          <el-select v-model="filters.event_level" placeholder="请选择事件等级" clearable>
            <el-option label="严重" value="critical" />
            <el-option label="高危" value="high" />
            <el-option label="中等" value="medium" />
            <el-option label="低危" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="filters.status" placeholder="请选择处理状态" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已处理" value="resolved" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="车牌号/司机/位置" clearable />
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
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="records" v-loading="loading" border stripe>
        <el-table-column prop="vehicle_no" label="车牌号" width="120" />
        <el-table-column prop="driver_name" label="司机" width="100" />
        <el-table-column prop="event_type" label="事件类型" width="120">
          <template #default="{ row }">
            {{ getEventTypeText(row.event_type) }}
          </template>
        </el-table-column>
        <el-table-column prop="event_level" label="事件等级" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.event_level)">
              {{ getLevelText(row.event_level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="位置" min-width="200" show-overflow-tooltip />
        <el-table-column prop="speed" label="速度(km/h)" width="100" />
        <el-table-column prop="event_time" label="事件时间" width="160" />
        <el-table-column prop="status" label="处理状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button 
              v-if="row.status !== 'resolved'" 
              link 
              type="success" 
              size="small" 
              @click="handleProcess(row)"
            >
              处理
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

    <!-- 处理对话框 -->
    <el-dialog v-model="processDialogVisible" title="处理安全事件" width="600px">
      <el-form :model="processForm" label-width="100px">
        <el-form-item label="处理状态">
          <el-select v-model="processForm.status" placeholder="请选择处理状态">
            <el-option label="处理中" value="processing" />
            <el-option label="已处理" value="resolved" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理结果">
          <el-input 
            v-model="processForm.handle_result" 
            type="textarea" 
            :rows="4"
            placeholder="请输入处理结果"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmProcess">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getSafetyRecords, deleteSafetyRecord, updateSafetyStatus } from '@/api/vehicleSafety';
import CompanySelect from '@/components/CompanySelect.vue';

const router = useRouter();
const loading = ref(false);
const records = ref([]);
const dateRange = ref([]);
const selectedCompanyId = ref('');

const filters = reactive({
  vehicle_id: '',
  event_type: '',
  event_level: '',
  status: '',
  keyword: ''
});

const pagination = reactive({
  page: 1,
  page_size: 20,
  total: 0
});

const processDialogVisible = ref(false);
const processForm = reactive({
  record_id: null,
  status: '',
  handle_result: ''
});

// 获取安全记录列表
const fetchRecords = async () => {
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

    const response = await getSafetyRecords(params);
    if (response.success) {
      records.value = response.data.list;
      pagination.total = response.data.pagination.total;
    }
  } catch (error) {
    ElMessage.error('获取安全记录列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchRecords();
};

// 重置
const handleReset = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = '';
  });
  dateRange.value = [];
  pagination.page = 1;
  fetchRecords();
};

// 查看详情
const handleView = (row) => {
  router.push(`/vehicle-safety/detail/${row.id}`);
};

// 处理事件
const handleProcess = (row) => {
  processForm.record_id = row.id;
  processForm.status = row.status === 'pending' ? 'processing' : 'resolved';
  processForm.handle_result = '';
  processDialogVisible.value = true;
};

// 确认处理
const handleConfirmProcess = async () => {
  if (!processForm.status) {
    ElMessage.warning('请选择处理状态');
    return;
  }

  try {
    const response = await updateSafetyStatus(processForm.record_id, {
      status: processForm.status,
      handle_result: processForm.handle_result
    });

    if (response.success) {
      ElMessage.success('处理成功');
      processDialogVisible.value = false;
      fetchRecords();
    }
  } catch (error) {
    ElMessage.error('处理失败');
  }
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该安全记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await deleteSafetyRecord(row.id);
      if (response.success) {
        ElMessage.success('删除成功');
        fetchRecords();
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
  fetchRecords();
};

// 页码改变
const handlePageChange = (page) => {
  pagination.page = page;
  fetchRecords();
};

// 获取事件类型文本
const getEventTypeText = (type) => {
  const typeMap = {
    speeding: '超速',
    hard_brake: '急刹车',
    hard_acceleration: '急加速',
    fatigue_driving: '疲劳驾驶',
    route_deviation: '偏离路线',
    illegal_parking: '违规停车',
    other: '其他'
  };
  return typeMap[type] || type;
};

// 获取等级类型
const getLevelType = (level) => {
  const typeMap = {
    critical: 'danger',
    high: 'warning',
    medium: 'primary',
    low: 'info'
  };
  return typeMap[level] || 'info';
};

// 获取等级文本
const getLevelText = (level) => {
  const textMap = {
    critical: '严重',
    high: '高危',
    medium: '中等',
    low: '低危'
  };
  return textMap[level] || level;
};

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: 'info',
    processing: 'warning',
    resolved: 'success'
  };
  return typeMap[status] || 'info';
};

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已处理'
  };
  return textMap[status] || status;
};

onMounted(() => {
  fetchRecords();
});

watch(selectedCompanyId, async () => {
  pagination.page = 1;
  await fetchRecords();
});
</script>

<style scoped>
.safety-list {
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
</style>
