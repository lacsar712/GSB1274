<template>
  <div class="vehicle-detail">
    <div class="page-header">
      <button class="btn-back" @click="goBack">
        <i class="icon-back"></i> 返回
      </button>
      <h1>车辆详情</h1>
      <div class="header-actions">
        <button class="btn-secondary" @click="handleEdit">编辑</button>
        <button 
          class="btn-secondary" 
          :class="{ 'btn-danger': vehicle.status === 'available' }"
          @click="handleToggleStatus"
        >
          {{ vehicle.status === 'available' ? '停用' : '启用' }}
        </button>
        <button class="btn-danger" @click="handleDelete">删除</button>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="!vehicle.id" class="empty">车辆不存在</div>
    <div v-else class="detail-content">
      <!-- 基本信息 -->
      <div class="info-section">
        <div class="section-header">
          <h2>基本信息</h2>
          <span :class="['status-badge', `status-${vehicle.status}`]">
            {{ getStatusText(vehicle.status) }}
          </span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <label>车牌号</label>
            <span class="plate-number">{{ vehicle.plate_number }}</span>
          </div>
          <div class="info-item">
            <label>车辆类型</label>
            <span>{{ getVehicleTypeText(vehicle.vehicle_type) }}</span>
          </div>
          <div class="info-item">
            <label>品牌</label>
            <span>{{ vehicle.brand || '-' }}</span>
          </div>
          <div class="info-item">
            <label>型号</label>
            <span>{{ vehicle.model || '-' }}</span>
          </div>
          <div class="info-item">
            <label>颜色</label>
            <span>{{ vehicle.color || '-' }}</span>
          </div>
          <div class="info-item">
            <label>年份</label>
            <span>{{ vehicle.year || '-' }}</span>
          </div>
          <div class="info-item">
            <label>载重能力</label>
            <span>{{ vehicle.load_capacity ? `${vehicle.load_capacity} 吨` : '-' }}</span>
          </div>
          <div class="info-item">
            <label>容积</label>
            <span>{{ vehicle.volume_capacity ? `${vehicle.volume_capacity} m³` : '-' }}</span>
          </div>
          <div class="info-item">
            <label>GPS设备ID</label>
            <span>{{ vehicle.gps_device_id || '-' }}</span>
          </div>
          <div class="info-item">
            <label>注册日期</label>
            <span>{{ formatDate(vehicle.registration_date) }}</span>
          </div>
          <div class="info-item">
            <label>保险到期日</label>
            <span :class="{ 'text-danger': isExpiringSoon(vehicle.insurance_expiry) }">
              {{ formatDate(vehicle.insurance_expiry) }}
            </span>
          </div>
          <div class="info-item">
            <label>年检到期日</label>
            <span :class="{ 'text-danger': isExpiringSoon(vehicle.inspection_expiry) }">
              {{ formatDate(vehicle.inspection_expiry) }}
            </span>
          </div>
          <div class="info-item">
            <label>创建时间</label>
            <span>{{ formatDate(vehicle.created_at) }}</span>
          </div>
          <div class="info-item">
            <label>更新时间</label>
            <span>{{ formatDate(vehicle.updated_at) }}</span>
          </div>
        </div>
      </div>

      <!-- 司机信息 -->
      <div class="info-section">
        <div class="section-header">
          <h2>司机信息</h2>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <label>司机姓名</label>
            <span>{{ vehicle.driver_name || '-' }}</span>
          </div>
          <div class="info-item">
            <label>司机电话</label>
            <span>{{ vehicle.driver_phone || '-' }}</span>
          </div>
          <div class="info-item">
            <label>驾驶证号</label>
            <span>{{ vehicle.driver_license || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 承运人信息 -->
      <div class="info-section" v-if="vehicle.carrier_name">
        <div class="section-header">
          <h2>承运人信息</h2>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <label>承运人名称</label>
            <span>{{ vehicle.carrier_name }}</span>
          </div>
          <div class="info-item">
            <label>联系人</label>
            <span>{{ vehicle.carrier_contact || '-' }}</span>
          </div>
          <div class="info-item">
            <label>联系电话</label>
            <span>{{ vehicle.carrier_phone || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 位置信息 -->
      <div class="info-section">
        <div class="section-header">
          <h2>位置信息</h2>
          <button class="btn-secondary" @click="handleUpdateLocation">更新位置</button>
        </div>
        <div class="info-grid">
          <div class="info-item full-width">
            <label>当前位置</label>
            <span>{{ vehicle.current_location || '-' }}</span>
          </div>
          <div class="info-item">
            <label>纬度</label>
            <span>{{ vehicle.latitude || '-' }}</span>
          </div>
          <div class="info-item">
            <label>经度</label>
            <span>{{ vehicle.longitude || '-' }}</span>
          </div>
        </div>
        <div v-if="vehicle.latitude && vehicle.longitude" class="map-preview">
          <div class="map-placeholder">
            <p>地图位置预览</p>
            <p class="coords">坐标: {{ vehicle.latitude }}, {{ vehicle.longitude }}</p>
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
              <div class="stat-value">{{ vehicle.waybill_count || 0 }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <div class="stat-label">总运费</div>
              <div class="stat-value">¥{{ formatAmount(vehicle.total_freight) }}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <div class="stat-label">平均评分</div>
              <div class="stat-value">{{ formatRating(vehicle.avg_rating) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近运单 -->
      <div class="info-section" v-if="vehicle.recent_waybills && vehicle.recent_waybills.length > 0">
        <div class="section-header">
          <h2>最近运单</h2>
        </div>
        <div class="waybill-list">
          <div 
            v-for="waybill in vehicle.recent_waybills" 
            :key="waybill.id"
            class="waybill-item"
            @click="goToWaybill(waybill.id)"
          >
            <div class="waybill-header">
              <span class="waybill-number">{{ waybill.waybill_number }}</span>
              <span :class="['status-badge', `status-${waybill.status}`]">
                {{ getWaybillStatusText(waybill.status) }}
              </span>
            </div>
            <div class="waybill-route">
              <span>{{ waybill.origin }}</span>
              <i class="icon-arrow"></i>
              <span>{{ waybill.destination }}</span>
            </div>
            <div class="waybill-footer">
              <span class="amount">¥{{ formatAmount(waybill.freight_amount) }}</span>
              <span class="date">{{ formatDate(waybill.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 更新位置对话框 -->
    <div v-if="showLocationDialog" class="dialog-overlay" @click="showLocationDialog = false">
      <div class="dialog" @click.stop>
        <div class="dialog-header">
          <h3>更新车辆位置</h3>
          <button class="btn-close" @click="showLocationDialog = false">×</button>
        </div>
        <div class="dialog-body">
          <div class="form-item">
            <label>当前位置</label>
            <input v-model="locationForm.current_location" type="text" placeholder="请输入当前位置" />
          </div>
          <div class="form-item">
            <label>纬度</label>
            <input v-model="locationForm.latitude" type="number" step="0.000001" placeholder="请输入纬度" />
          </div>
          <div class="form-item">
            <label>经度</label>
            <input v-model="locationForm.longitude" type="number" step="0.000001" placeholder="请输入经度" />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-secondary" @click="showLocationDialog = false">取消</button>
          <button class="btn-primary" @click="submitLocationUpdate">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessageBox } from 'element-plus';
import { getVehicleById, updateVehicleStatus, updateVehicleLocation, deleteVehicle } from '@/api/vehicle';

export default {
  name: 'VehicleDetail',
  data() {
    return {
      loading: false,
      vehicle: {},
      showLocationDialog: false,
      locationForm: {
        current_location: '',
        latitude: null,
        longitude: null
      }
    };
  },
  mounted() {
    this.loadVehicle();
  },
  methods: {
    async loadVehicle() {
      this.loading = true;
      try {
        const vehicleId = this.$route.params.id;
        const response = await getVehicleById(vehicleId);
        
        if (response.code === 200) {
          this.vehicle = response.data;
        }
      } catch (error) {
        console.error('加载车辆详情失败:', error);
        this.$notifyError('加载车辆详情', error);
      } finally {
        this.loading = false;
      }
    },
    
    goBack() {
      this.$router.back();
    },
    
    handleEdit() {
      this.$router.push(`/vehicles/${this.vehicle.id}/edit`);
    },
    
    async handleToggleStatus() {
      const newStatus = this.vehicle.status === 'available' ? 'inactive' : 'available';
      const action = newStatus === 'inactive' ? '停用' : '启用';
      try {
        await ElMessageBox.confirm(`确定要${action}这辆车辆吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
      } catch (err) {
        return;
      }
      try {
        const response = await updateVehicleStatus(this.vehicle.id, newStatus);
        
        if (response.code === 200) {
          this.$notifySuccess(`${action}车辆`);
          this.loadVehicle();
        }
      } catch (error) {
        console.error('更新车辆状态失败:', error);
        this.$notifyError('更新车辆状态', error);
      }
    },
    
    async handleDelete() {
      try {
        await ElMessageBox.confirm('确定要删除这辆车辆吗？此操作不可恢复。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
      } catch (err) {
        return;
      }
      try {
        const response = await deleteVehicle(this.vehicle.id);
        
        if (response.code === 200) {
          this.$notifySuccess('删除车辆');
          this.$router.push('/vehicles');
        }
      } catch (error) {
        console.error('删除车辆失败:', error);
        this.$notifyError('删除车辆', error);
      }
    },
    
    handleUpdateLocation() {
      this.locationForm = {
        current_location: this.vehicle.current_location || '',
        latitude: this.vehicle.latitude || null,
        longitude: this.vehicle.longitude || null
      };
      this.showLocationDialog = true;
    },
    
    async submitLocationUpdate() {
      try {
        const response = await updateVehicleLocation(this.vehicle.id, this.locationForm);
        
        if (response.code === 200) {
          this.$notifySuccess('更新车辆位置');
          this.showLocationDialog = false;
          this.loadVehicle();
        }
      } catch (error) {
        console.error('更新车辆位置失败:', error);
        this.$notifyError('更新车辆位置', error);
      }
    },
    
    goToWaybill(id) {
      this.$router.push(`/waybills/${id}`);
    },
    
    getVehicleTypeText(type) {
      const types = {
        truck: '货车',
        van: '厢式货车',
        flatbed: '平板车',
        container: '集装箱车',
        refrigerated: '冷藏车'
      };
      return types[type] || type;
    },
    
    getStatusText(status) {
      const statuses = {
        available: '可用',
        in_use: '使用中',
        maintenance: '维护中',
        inactive: '停用'
      };
      return statuses[status] || status;
    },
    
    getWaybillStatusText(status) {
      const statuses = {
        pending: '待处理',
        confirmed: '已确认',
        in_transit: '运输中',
        completed: '已完成',
        cancelled: '已取消'
      };
      return statuses[status] || status;
    },
    
    formatDate(date) {
      if (!date) return '-';
      return new Date(date).toLocaleString('zh-CN');
    },
    
    formatAmount(amount) {
      return (amount || 0).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },
    
    formatRating(rating) {
      return rating ? rating.toFixed(1) : '-';
    },
    
    isExpiringSoon(date) {
      if (!date) return false;
      const expiryDate = new Date(date);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    }
  }
};
</script>

<style scoped>
.vehicle-detail {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.page-header h1 {
  flex: 1;
  margin: 0;
  font-size: 24px;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-back {
  padding: 8px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-back:hover {
  background: #f5f5f5;
}

.loading,
.empty {
  text-align: center;
  padding: 40px;
  color: #999;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-section {
  background: white;
  border-radius: 4px;
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: 14px;
  color: #999;
}

.info-item span {
  font-size: 16px;
  color: #333;
}

.plate-number {
  font-weight: 600;
  color: #1890ff;
  font-size: 18px !important;
}

.text-danger {
  color: #f5222d !important;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-available {
  background: #e6f7ff;
  color: #1890ff;
}

.status-in_use {
  background: #fff7e6;
  color: #fa8c16;
}

.status-maintenance {
  background: #fff1f0;
  color: #f5222d;
}

.status-inactive {
  background: #f5f5f5;
  color: #999;
}

.map-preview {
  margin-top: 20px;
}

.map-placeholder {
  height: 300px;
  background: #f5f5f5;
  border: 1px solid #eee;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.coords {
  font-size: 14px;
  margin-top: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 4px;
}

.stat-icon {
  font-size: 32px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.waybill-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.waybill-item {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.waybill-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.waybill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.waybill-number {
  font-weight: 600;
  color: #1890ff;
}

.waybill-route {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: #666;
}

.waybill-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.amount {
  font-weight: 600;
  color: #52c41a;
}

.date {
  color: #999;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 4px;
  width: 500px;
  max-width: 90%;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
}

.btn-close {
  border: none;
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.btn-close:hover {
  color: #333;
}

.dialog-body {
  padding: 20px;
}

.form-item {
  margin-bottom: 15px;
}

.form-item label {
  display: block;
  margin-bottom: 5px;
  color: #666;
}

.form-item input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #eee;
}

.btn-primary {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #40a9ff;
}

.btn-secondary {
  padding: 8px 16px;
  background: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  color: #1890ff;
  border-color: #1890ff;
}

.btn-danger {
  padding: 8px 16px;
  background: #f5222d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-danger:hover {
  background: #ff4d4f;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
