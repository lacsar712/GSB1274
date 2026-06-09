<template>
  <div class="carrier-detail">
    <div class="page-header">
      <button class="btn-back" @click="goBack">
        <i class="icon-back"></i> 返回
      </button>
      <h1>承运人详情</h1>
      <div class="header-actions">
        <button class="btn-secondary" @click="handleEdit">编辑</button>
        <button 
          class="btn-secondary" 
          :class="{ 'btn-danger': carrier.status === 'active' }"
          @click="handleToggleStatus"
        >
          {{ carrier.status === 'active' ? '停用' : '启用' }}
        </button>
        <button class="btn-danger" @click="handleDelete">删除</button>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="!carrier.id" class="empty">承运人不存在</div>
    <div v-else class="detail-content">
      <!-- 基本信息 -->
      <div class="info-section">
        <div class="section-header">
          <h2>基本信息</h2>
          <span :class="['status-badge', `status-${carrier.status}`]">
            {{ getStatusText(carrier.status) }}
          </span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <label>承运人名称</label>
            <span>{{ carrier.name }}</span>
          </div>
          <div class="info-item">
            <label>联系人</label>
            <span>{{ carrier.contact_person }}</span>
          </div>
          <div class="info-item">
            <label>联系电话</label>
            <span>{{ carrier.contact_phone }}</span>
          </div>
          <div class="info-item">
            <label>联系邮箱</label>
            <span>{{ carrier.contact_email || '-' }}</span>
          </div>
          <div class="info-item full-width">
            <label>地址</label>
            <span>{{ carrier.address || '-' }}</span>
          </div>
          <div class="info-item">
            <label>营业执照号</label>
            <span>{{ carrier.business_license || '-' }}</span>
          </div>
          <div class="info-item">
            <label>道路运输许可证</label>
            <span>{{ carrier.transport_license || '-' }}</span>
          </div>
          <div class="info-item">
            <label>车辆数量</label>
            <span>{{ carrier.vehicle_count || 0 }} 辆</span>
          </div>
          <div class="info-item">
            <label>司机数量</label>
            <span>{{ carrier.driver_count || 0 }} 人</span>
          </div>
          <div class="info-item full-width">
            <label>服务区域</label>
            <span>{{ carrier.service_area || '-' }}</span>
          </div>
          <div class="info-item full-width">
            <label>描述</label>
            <span>{{ carrier.description || '-' }}</span>
          </div>
          <div class="info-item">
            <label>创建时间</label>
            <span>{{ formatDate(carrier.created_at) }}</span>
          </div>
          <div class="info-item">
            <label>更新时间</label>
            <span>{{ formatDate(carrier.updated_at) }}</span>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="info-section">
        <div class="section-header">
          <h2>运营统计</h2>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-content">
              <div class="stat-label">总运单数</div>
              <div class="stat-value">{{ carrier.waybill_count || 0 }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <div class="stat-label">总运费</div>
              <div class="stat-value">¥{{ formatAmount(carrier.total_freight) }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <div class="stat-label">平均评分</div>
              <div class="stat-value">{{ formatRating(carrier.avg_rating) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近运单 -->
      <div class="info-section">
        <div class="section-header">
          <h2>最近运单</h2>
        </div>
        <div v-if="!carrier.recent_waybills || carrier.recent_waybills.length === 0" class="empty-list">
          暂无运单记录
        </div>
        <div v-else class="waybill-list">
          <table class="waybill-table">
            <thead>
              <tr>
                <th>运单号</th>
                <th>起始地</th>
                <th>目的地</th>
                <th>运费</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="waybill in carrier.recent_waybills" :key="waybill.id">
                <td>{{ waybill.waybill_number }}</td>
                <td>{{ waybill.origin }}</td>
                <td>{{ waybill.destination }}</td>
                <td>¥{{ formatAmount(waybill.freight_amount) }}</td>
                <td>
                  <span :class="['status-badge', `status-${waybill.status}`]">
                    {{ getWaybillStatusText(waybill.status) }}
                  </span>
                </td>
                <td>{{ formatDate(waybill.created_at) }}</td>
                <td>
                  <button class="btn-text" @click="goToWaybill(waybill.id)">查看</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCarrierById, deleteCarrier, updateCarrierStatus } from '@/api/carrier';

export default {
  name: 'CarrierDetail',
  data() {
    return {
      carrier: {},
      loading: false
    };
  },
  mounted() {
    this.loadCarrier();
  },
  methods: {
    async loadCarrier() {
      this.loading = true;
      try {
        const carrierId = this.$route.params.id;
        const response = await getCarrierById(carrierId);
        
        if (response.code === 200) {
          this.carrier = response.data;
        } else {
          this.$message.error(response.message || '获取承运人详情失败');
        }
      } catch (error) {
        console.error('获取承运人详情失败:', error);
        this.$message.error('获取承运人详情失败');
      } finally {
        this.loading = false;
      }
    },
    
    goBack() {
      this.$router.back();
    },
    
    handleEdit() {
      this.$router.push(`/carriers/${this.carrier.id}/edit`);
    },
    
    async handleToggleStatus() {
      const newStatus = this.carrier.status === 'active' ? 'inactive' : 'active';
      const action = newStatus === 'active' ? '启用' : '停用';
      
      if (!confirm(`确定要${action}承运人"${this.carrier.name}"吗？`)) {
        return;
      }
      
      try {
        const response = await updateCarrierStatus(this.carrier.id, newStatus);
        
        if (response.code === 200) {
          this.$message.success(`${action}成功`);
          this.loadCarrier();
        } else {
          this.$message.error(response.message || `${action}失败`);
        }
      } catch (error) {
        console.error(`${action}承运人失败:`, error);
        this.$message.error(`${action}失败`);
      }
    },
    
    async handleDelete() {
      if (!confirm(`确定要删除承运人"${this.carrier.name}"吗？此操作不可恢复。`)) {
        return;
      }
      
      try {
        const response = await deleteCarrier(this.carrier.id);
        
        if (response.code === 200) {
          this.$message.success('删除成功');
          this.$router.push('/carriers');
        } else {
          this.$message.error(response.message || '删除失败');
        }
      } catch (error) {
        console.error('删除承运人失败:', error);
        this.$message.error(error.response?.data?.message || '删除失败');
      }
    },
    
    goToWaybill(id) {
      this.$router.push(`/waybills/${id}`);
    },
    
    getStatusText(status) {
      const statusMap = {
        active: '活跃',
        inactive: '停用',
        suspended: '暂停'
      };
      return statusMap[status] || status;
    },
    
    getWaybillStatusText(status) {
      const statusMap = {
        pending: '待处理',
        in_transit: '运输中',
        completed: '已完成',
        cancelled: '已取消'
      };
      return statusMap[status] || status;
    },
    
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    formatAmount(amount) {
      return (amount || 0).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },
    
    formatRating(rating) {
      return (rating || 0).toFixed(1);
    }
  }
};
</script>

<style scoped>
.carrier-detail {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.btn-back {
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-back:hover {
  background: #e0e0e0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.section-header h2 {
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

.status-pending {
  background: #e3f2fd;
  color: #2196f3;
}

.status-in_transit {
  background: #fff3e0;
  color: #ff9800;
}

.status-completed {
  background: #e8f5e9;
  color: #4caf50;
}

.status-cancelled {
  background: #fce4ec;
  color: #e91e63;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: 14px;
  color: #999;
  font-weight: 500;
}

.info-item span {
  font-size: 15px;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-icon {
  font-size: 32px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.empty-list {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
}

.waybill-table {
  width: 100%;
  border-collapse: collapse;
}

.waybill-table th,
.waybill-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.waybill-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #666;
  font-size: 14px;
}

.waybill-table td {
  font-size: 14px;
  color: #333;
}

.waybill-table tbody tr:hover {
  background: #f8f9fa;
}

.btn-primary,
.btn-secondary,
.btn-danger,
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

.btn-secondary.btn-danger {
  background: #fce4ec;
  color: #e91e63;
}

.btn-danger {
  background: #f44336;
  color: #fff;
}

.btn-danger:hover {
  background: #d32f2f;
}

.btn-text {
  background: none;
  color: #1976d2;
  padding: 4px 8px;
}

.btn-text:hover {
  background: #f5f5f5;
}

.loading,
.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
}

.icon-back::before {
  content: '←';
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .waybill-table {
    font-size: 12px;
  }
}
</style>
