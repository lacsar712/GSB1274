<template>
  <div class="waybill-list">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <h2>运单管理</h2>
      <div class="page-actions">
        <CompanySelect v-model="companyId" @change="handleCompanyChange" />
      <el-button v-if="$hasPerm('waybill.create')" type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>
        创建运单
      </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-label">总运单数</div>
          <div class="stat-value">{{ stats.total || 0 }}</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-label">待发货</div>
          <div class="stat-value">{{ stats.statusStats?.['待发货'] || 0 }}</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-label">运输中</div>
          <div class="stat-value">{{ stats.statusStats?.['运输中'] || 0 }}</div>
        </div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-content">
          <div class="stat-label">已签收</div>
          <div class="stat-value">{{ stats.statusStats?.['已签收'] || 0 }}</div>
        </div>
      </el-card>
    </div>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="运单号">
          <el-input v-model="filters.waybillNo" placeholder="请输入运单号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="请选择状态" clearable>
            <el-option label="待发货" value="待发货" />
            <el-option label="运输中" value="运输中" />
            <el-option label="已到达" value="已到达" />
            <el-option label="已签收" value="已签收" />
            <el-option label="异常" value="异常" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
        <el-form-item label="货物类型">
          <el-select v-model="filters.cargoType" placeholder="请选择货物类型" clearable>
            <el-option label="普货" value="普货" />
            <el-option label="危险品" value="危险品" />
            <el-option label="冷链" value="冷链" />
            <el-option label="贵重物品" value="贵重物品" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="运输方式">
          <el-select v-model="filters.transportType" placeholder="请选择运输方式" clearable>
            <el-option label="公路" value="公路" />
            <el-option label="铁路" value="铁路" />
            <el-option label="航空" value="航空" />
            <el-option label="水运" value="水运" />
            <el-option label="多式联运" value="多式联运" />
          </el-select>
        </el-form-item>
        <el-form-item label="发货人电话">
          <el-input v-model="filters.senderPhone" placeholder="请输入发货人电话" clearable />
        </el-form-item>
        <el-form-item label="收货人电话">
          <el-input v-model="filters.receiverPhone" placeholder="请输入收货人电话" clearable />
        </el-form-item>
        <el-form-item label="创建日期">
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
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 运单列表 -->
    <div class="waybill-cards">
      <el-card
        v-for="waybill in waybills"
        :key="waybill._id"
        class="waybill-card"
        shadow="hover"
      >
        <div class="waybill-header">
          <div class="waybill-no">
            <el-icon><Document /></el-icon>
            <span>{{ waybill.waybillNo }}</span>
          </div>
          <el-tag :type="getStatusType(waybill.status)">
            {{ waybill.status }}
          </el-tag>
        </div>

        <div class="waybill-body">
          <div class="waybill-route">
            <div class="route-item">
              <div class="route-label">发货地</div>
              <div class="route-value">
                {{ waybill.sender.address?.city || '-' }}
              </div>
              <div class="route-detail">{{ waybill.sender.name }} {{ waybill.sender.phone }}</div>
            </div>
            <div class="route-arrow">
              <el-icon><Right /></el-icon>
            </div>
            <div class="route-item">
              <div class="route-label">收货地</div>
              <div class="route-value">
                {{ waybill.receiver.address?.city || '-' }}
              </div>
              <div class="route-detail">{{ waybill.receiver.name }} {{ waybill.receiver.phone }}</div>
            </div>
          </div>

          <div class="waybill-info">
            <div class="info-item">
              <span class="info-label">货物名称：</span>
              <span class="info-value">{{ waybill.cargo.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">货物类型：</span>
              <span class="info-value">{{ waybill.cargo.type }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">重量：</span>
              <span class="info-value">{{ waybill.cargo.weight }} kg</span>
            </div>
            <div class="info-item">
              <span class="info-label">运输方式：</span>
              <span class="info-value">{{ waybill.transport.type }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">运费：</span>
              <span class="info-value">¥{{ waybill.fee?.total || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间：</span>
              <span class="info-value">{{ formatDate(waybill.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="waybill-footer">
          <el-button size="small" @click="viewDetail(waybill._id)">
            查看详情
          </el-button>
          <el-button size="small" :disabled="!$hasPerm('waybill.edit')" @click="updateStatus(waybill)">
            更新状态
          </el-button>
          <el-button
            size="small"
            type="danger"
            :disabled="!$hasPerm('waybill.delete') || !canDelete(waybill.status) || deletingId === waybill._id || loading"
            @click="handleDelete(waybill._id)"
          >
            {{ deletingId === waybill._id ? '删除中...' : '删除' }}
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && waybills.length === 0" description="暂无运单数据" />

    <!-- 分页 -->
    <div v-if="pagination.total > 0" class="pagination">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 加载状态 -->
    <el-loading v-if="loading" fullscreen />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox } from 'element-plus';
import { Plus, Document, Right } from '@element-plus/icons-vue';
import { getWaybillList, deleteWaybill, getWaybillStats } from '@/api/waybill';
import CompanySelect from '@/components/CompanySelect.vue';

const router = useRouter();
const { proxy } = getCurrentInstance();

const companyId = ref('');

// 数据
const waybills = ref([]);
const stats = ref({});
const loading = ref(false);
const dateRange = ref([]);

// 筛选条件
const filters = reactive({
  waybillNo: '',
  status: '',
  cargoType: '',
  transportType: '',
  senderPhone: '',
  receiverPhone: ''
});

// 分页
const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
});

// 获取运单列表
const fetchWaybills = async () => {
  try {
    loading.value = true;
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters
    };

    // 添加日期范围
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0];
      params.endDate = dateRange.value[1];
    }

    const response = await getWaybillList(companyId.value, params);
    if (response.success) {
      waybills.value = response.data.waybills;
      pagination.total = response.data.pagination.total;
      stats.value.total = response.data.pagination.total;
      if (response.data.stats) {
        stats.value = response.data.stats;
      }
    }
  } catch (error) {
    proxy.$notifyError('获取运单列表', error);
  } finally {
    loading.value = false;
  }
};

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await getWaybillStats(companyId.value);
    if (response.success) {
      stats.value = response.data;
    }
  } catch (error) {
    console.error('获取统计数据失败:', error);
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchWaybills();
};

// 重置
const handleReset = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = '';
  });
  dateRange.value = [];
  pagination.page = 1;
  fetchWaybills();
};

// 分页变化
const handlePageChange = (page) => {
  pagination.page = page;
  fetchWaybills();
};

const handleSizeChange = (size) => {
  pagination.limit = size;
  pagination.page = 1;
  fetchWaybills();
};

// 查看详情
const viewDetail = (waybillId) => {
  router.push(`/waybill/detail/${waybillId}`);
};

// 显示创建对话框
const showCreateDialog = () => {
  router.push('/waybill/create');
};

// 更新状态
const updateStatus = (waybill) => {
  router.push(`/waybill/detail/${waybill._id}?action=updateStatus`);
};

// 删除运单
const deletingId = ref('');
const handleDelete = async (waybillId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个运单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    deletingId.value = waybillId;
    const response = await deleteWaybill(companyId.value, waybillId);
    if (response.success) {
      proxy.$notifySuccess('删除运单');
      fetchWaybills();
      fetchStats();
    }
  } catch (error) {
    if (error !== 'cancel') {
      proxy.$notifyError('删除运单', error);
    }
  }
    deletingId.value = '';
};


// 判断是否可以删除
const canDelete = (status) => {
  return ['待发货', '已取消'].includes(status);
};

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    '待发货': 'info',
    '运输中': 'primary',
    '已到达': 'success',
    '已签收': 'success',
    '异常': 'danger',
    '已取消': 'info'
  };
  return typeMap[status] || 'info';
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
};

// 初始化
onMounted(async () => {
  if (companyId.value) {
    await fetchWaybills();
    await fetchStats();
  }
});

// 企业变更
const handleCompanyChange = async () => {
  pagination.page = 1;
  await fetchWaybills();
  await fetchStats();
};

watch(companyId, async (val, oldVal) => {
  if (val && val !== oldVal) {
    await handleCompanyChange();
  }
});
</script>

<style scoped>
.waybill-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #409eff;
}

/* 筛选卡片 */
.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 运单卡片 */
.waybill-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.waybill-card {
  transition: transform 0.2s;
}

.waybill-card:hover {
  transform: translateY(-2px);
}

.waybill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.waybill-no {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.waybill-body {
  margin-bottom: 15px;
}

.waybill-route {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.route-item {
  flex: 1;
  text-align: center;
}

.route-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.route-value {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
}

.route-detail {
  font-size: 12px;
  color: #606266;
}

.route-arrow {
  padding: 0 15px;
  font-size: 20px;
  color: #409eff;
}

.waybill-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.info-item {
  font-size: 14px;
}

.info-label {
  color: #909399;
}

.info-value {
  color: #606266;
  font-weight: 500;
}

.waybill-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .waybill-cards {
    grid-template-columns: 1fr;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .waybill-info {
    grid-template-columns: 1fr;
  }
}
</style>
