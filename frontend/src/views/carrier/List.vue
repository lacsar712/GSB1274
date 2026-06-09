<template>
  <div class="carrier-list">
    <div class="page-header">
      <h1>承运人管理</h1>
      <button class="btn-primary" @click="goToCreate">
        <i class="icon-plus"></i> 添加承运人
      </button>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-bar">
      <div class="search-item">
        <label>承运人名称：</label>
        <input 
          v-model="searchForm.name" 
          type="text" 
          placeholder="请输入承运人名称"
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="search-item">
        <label>联系人：</label>
        <input 
          v-model="searchForm.contact_person" 
          type="text" 
          placeholder="请输入联系人"
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="search-item">
        <label>状态：</label>
        <select v-model="searchForm.status">
          <option value="">全部</option>
          <option value="active">活跃</option>
          <option value="inactive">停用</option>
          <option value="suspended">暂停</option>
        </select>
      </div>
      <div class="search-actions">
        <button class="btn-primary" @click="handleSearch">搜索</button>
        <button class="btn-secondary" @click="handleReset">重置</button>
      </div>
    </div>

    <!-- 承运人卡片列表 -->
    <el-skeleton v-if="loading" animated :rows="6" />
    <div v-else-if="carriers.length === 0" class="empty">
      <p>暂无承运人数据</p>
    </div>
    <div v-else class="carrier-grid">
      <div 
        v-for="carrier in carriers" 
        :key="carrier.id" 
        class="carrier-card"
        @click="goToDetail(carrier.id)"
      >
        <div class="card-header">
          <h3>{{ carrier.name }}</h3>
          <span :class="['status-badge', `status-${carrier.status}`]">
            {{ getStatusText(carrier.status) }}
          </span>
        </div>
        
        <div class="card-body">
          <div class="info-row">
            <i class="icon-user"></i>
            <span>联系人：{{ carrier.contact_person }}</span>
          </div>
          <div class="info-row">
            <i class="icon-phone"></i>
            <span>电话：{{ carrier.contact_phone }}</span>
          </div>
          <div class="info-row" v-if="carrier.contact_email">
            <i class="icon-email"></i>
            <span>邮箱：{{ carrier.contact_email }}</span>
          </div>
          <div class="info-row" v-if="carrier.address">
            <i class="icon-location"></i>
            <span>地址：{{ carrier.address }}</span>
          </div>
          
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-label">车辆数</span>
              <span class="stat-value">{{ carrier.vehicle_count || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">司机数</span>
              <span class="stat-value">{{ carrier.driver_count || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">运单数</span>
              <span class="stat-value">{{ carrier.waybill_count || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">总运费</span>
              <span class="stat-value">¥{{ formatAmount(carrier.total_freight) }}</span>
            </div>
          </div>
        </div>
        
        <div class="card-footer" @click.stop>
          <button class="btn-text" @click="goToDetail(carrier.id)">查看详情</button>
          <button class="btn-text" @click="handleEdit(carrier.id)">编辑</button>
          <button 
            class="btn-text" 
            :class="{ 'text-danger': carrier.status === 'active' }"
            @click="handleToggleStatus(carrier)"
          >
            {{ carrier.status === 'active' ? '停用' : '启用' }}
          </button>
          <button class="btn-text text-danger" @click="handleDelete(carrier)">删除</button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination">
      <button 
        class="btn-secondary" 
        :disabled="currentPage === 1"
        @click="handlePageChange(currentPage - 1)"
      >
        上一页
      </button>
      <span class="page-info">
        第 {{ currentPage }} / {{ totalPages }} 页，共 {{ total }} 条
      </span>
      <button 
        class="btn-secondary" 
        :disabled="currentPage === totalPages"
        @click="handlePageChange(currentPage + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script>
import { ElMessage, ElMessageBox } from 'element-plus';
import { getCarriers, deleteCarrier, updateCarrierStatus } from '@/api/carrier';

export default {
  name: 'CarrierList',
  data() {
    return {
      carriers: [],
      loading: false,
      searchForm: {
        name: '',
        contact_person: '',
        status: ''
      },
      currentPage: 1,
      pageSize: 12,
      total: 0
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.total / this.pageSize);
    }
  },
  mounted() {
    this.loadCarriers();
  },
  methods: {
    async loadCarriers() {
      this.loading = true;
      try {
        const params = {
          ...this.searchForm,
          page: this.currentPage,
          pageSize: this.pageSize
        };
        
        const response = await getCarriers(params);
        
        if (response.code === 200) {
          this.carriers = response.data;
          this.total = response.pagination.total;
        } else {
          ElMessage.error(response.message || '获取承运人列表失败');
        }
      } catch (error) {
        console.error('获取承运人列表失败:', error);
        ElMessage.error('获取承运人列表失败');
      } finally {
        this.loading = false;
      }
    },
    
    handleSearch() {
      this.currentPage = 1;
      this.loadCarriers();
    },
    
    handleReset() {
      this.searchForm = {
        name: '',
        contact_person: '',
        status: ''
      };
      this.currentPage = 1;
      this.loadCarriers();
    },
    
    handlePageChange(page) {
      this.currentPage = page;
      this.loadCarriers();
    },
    
    goToCreate() {
      this.$router.push('/carriers/create');
    },
    
    goToDetail(id) {
      this.$router.push(`/carriers/${id}`);
    },
    
    handleEdit(id) {
      this.$router.push(`/carriers/${id}/edit`);
    },
    
    async handleToggleStatus(carrier) {
      const newStatus = carrier.status === 'active' ? 'inactive' : 'active';
      const action = newStatus === 'active' ? '启用' : '停用';
      try {
        await ElMessageBox.confirm(`确定要${action}承运人"${carrier.name}"吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        const response = await updateCarrierStatus(carrier.id, newStatus);
        if (response.code === 200) {
          ElMessage.success(`${action}成功`);
          this.loadCarriers();
        } else {
          ElMessage.error(response.message || `${action}失败`);
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error(`${action}承运人失败:`, error);
          ElMessage.error(`${action}失败`);
        }
      }
    },
    
    async handleDelete(carrier) {
      try {
        await ElMessageBox.confirm(`确定要删除承运人"${carrier.name}"吗？此操作不可恢复。`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        try {
          const response = await deleteCarrier(carrier.id);
          if (response.code === 200) {
            ElMessage.success('删除成功');
            this.loadCarriers();
          } else {
            ElMessage.error(response.message || '删除失败');
          }
        } catch (error) {
          console.error('删除承运人失败:', error);
          ElMessage.error(error.response?.data?.message || '删除失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('操作已取消');
        }
      }
    },
    
    getStatusText(status) {
      const statusMap = {
        active: '活跃',
        inactive: '停用',
        suspended: '暂停'
      };
      return statusMap[status] || status;
    },
    
    formatAmount(amount) {
      return (amount || 0).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  }
};
</script>

<style scoped>
.carrier-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.search-bar {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-item label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.search-item input,
.search-item select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 200px;
}

.search-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.carrier-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.carrier-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.carrier-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background: #e8f5e9;
  color: #4caf50;
}

.status-inactive {
  background: #fce4ec;
  color: #e91e63;
}

.status-suspended {
  background: #fff3e0;
  color: #ff9800;
}

.card-body {
  margin-bottom: 15px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.info-row i {
  color: #999;
  width: 16px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.card-footer {
  display: flex;
  justify-content: space-around;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.btn-primary,
.btn-secondary,
.btn-text {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #1976d2;
  color: #fff;
}

.btn-primary:hover {
  background: #1565c0;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-text {
  background: none;
  color: #1976d2;
  padding: 4px 8px;
}

.btn-text:hover {
  background: #f5f5f5;
}

.btn-text.text-danger {
  color: #f44336;
}

.loading,
.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-info {
  font-size: 14px;
  color: #666;
}

.icon-plus::before { content: '+'; }
.icon-user::before { content: '👤'; }
.icon-phone::before { content: '📞'; }
.icon-email::before { content: '📧'; }
.icon-location::before { content: '📍'; }
</style>
