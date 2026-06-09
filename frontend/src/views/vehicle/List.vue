<template>
  <div class="vehicle-list">
    <div class="page-header">
      <h1>车辆管理</h1>
      <button class="btn-primary" @click="goToCreate">
        <i class="icon-plus"></i> 添加车辆
      </button>
    </div>

    <!-- 搜索筛选 -->
    <div class="search-bar">
      <div class="search-item">
        <label>车牌号：</label>
        <input 
          v-model="searchForm.plate_number" 
          type="text" 
          placeholder="请输入车牌号"
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="search-item">
        <label>车辆类型：</label>
        <select v-model="searchForm.vehicle_type">
          <option value="">全部</option>
          <option value="truck">货车</option>
          <option value="van">厢式货车</option>
          <option value="flatbed">平板车</option>
          <option value="container">集装箱车</option>
          <option value="refrigerated">冷藏车</option>
        </select>
      </div>
      <div class="search-item">
        <label>状态：</label>
        <select v-model="searchForm.status">
          <option value="">全部</option>
          <option value="available">可用</option>
          <option value="in_use">使用中</option>
          <option value="maintenance">维护中</option>
          <option value="inactive">停用</option>
        </select>
      </div>
      <div class="search-actions">
        <button class="btn-primary" @click="handleSearch">搜索</button>
        <button class="btn-secondary" @click="handleReset">重置</button>
      </div>
    </div>

    <!-- 视图切换 -->
    <div class="view-toggle">
      <button 
        :class="['toggle-btn', { active: viewMode === 'table' }]"
        @click="viewMode = 'table'"
      >
        <i class="icon-table"></i> 表格视图
      </button>
      <button 
        :class="['toggle-btn', { active: viewMode === 'map' }]"
        @click="viewMode = 'map'"
      >
        <i class="icon-map"></i> 地图视图
      </button>
    </div>

    <!-- 表格视图 -->
    <div v-if="viewMode === 'table'" class="table-view">
      <el-skeleton v-if="loading" animated :rows="5" />
      <div v-else-if="vehicles.length === 0" class="empty">
        <p>暂无车辆数据</p>
      </div>
      <div v-else class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>车牌号</th>
              <th>车辆类型</th>
              <th>品牌/型号</th>
              <th>载重/容积</th>
              <th>司机</th>
              <th>承运人</th>
              <th>当前位置</th>
              <th>状态</th>
              <th>运单数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="vehicle in vehicles" 
              :key="vehicle.id"
              @click="goToDetail(vehicle.id)"
              class="clickable-row"
            >
              <td class="plate-number">{{ vehicle.plate_number }}</td>
              <td>{{ getVehicleTypeText(vehicle.vehicle_type) }}</td>
              <td>{{ vehicle.brand }} {{ vehicle.model }}</td>
              <td>
                <div v-if="vehicle.load_capacity || vehicle.volume_capacity">
                  <span v-if="vehicle.load_capacity">{{ vehicle.load_capacity }}吨</span>
                  <span v-if="vehicle.volume_capacity"> / {{ vehicle.volume_capacity }}m³</span>
                </div>
                <span v-else>-</span>
              </td>
              <td>
                <div v-if="vehicle.driver_name">
                  <div>{{ vehicle.driver_name }}</div>
                  <div class="text-secondary">{{ vehicle.driver_phone }}</div>
                </div>
                <span v-else>-</span>
              </td>
              <td>{{ vehicle.carrier_name || '-' }}</td>
              <td>
                <div v-if="vehicle.current_location">
                  {{ vehicle.current_location }}
                  <button 
                    v-if="vehicle.latitude && vehicle.longitude"
                    class="btn-link"
                    @click.stop="showOnMap(vehicle)"
                  >
                    <i class="icon-location"></i> 查看
                  </button>
                </div>
                <span v-else>-</span>
              </td>
              <td>
                <span :class="['status-badge', `status-${vehicle.status}`]">
                  {{ getStatusText(vehicle.status) }}
                </span>
              </td>
              <td>{{ vehicle.waybill_count || 0 }}</td>
              <td class="actions" @click.stop>
                <button class="btn-icon" @click="goToDetail(vehicle.id)" title="查看详情">
                  <i class="icon-eye"></i>
                </button>
                <button class="btn-icon" @click="handleEdit(vehicle.id)" title="编辑">
                  <i class="icon-edit"></i>
                </button>
                <button class="btn-icon danger" @click="handleDelete(vehicle.id)" title="删除">
                  <i class="icon-delete"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div v-if="!loading && vehicles.length > 0" class="pagination">
        <button 
          class="btn-secondary" 
          :disabled="pagination.page === 1"
          @click="handlePageChange(pagination.page - 1)"
        >
          上一页
        </button>
        <span class="page-info">
          第 {{ pagination.page }} / {{ pagination.totalPages }} 页，
          共 {{ pagination.total }} 条
        </span>
        <button 
          class="btn-secondary" 
          :disabled="pagination.page === pagination.totalPages"
          @click="handlePageChange(pagination.page + 1)"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 地图视图 -->
    <div v-else class="map-view">
      <div class="map-container" ref="mapContainer">
        <div v-if="loadingLocations" class="map-loading">加载车辆位置中...</div>
        <div v-else-if="vehicleLocations.length === 0" class="map-empty">
          暂无车辆位置信息
        </div>
        <div v-else class="map-placeholder">
          <!-- 这里可以集成真实的地图组件，如高德地图、百度地图等 -->
          <div class="map-info">
            <h3>车辆位置地图</h3>
            <p>共 {{ vehicleLocations.length }} 辆车辆</p>
          </div>
          
          <!-- 车辆位置列表 -->
          <div class="location-list">
            <div 
              v-for="vehicle in vehicleLocations" 
              :key="vehicle.id"
              class="location-item"
              @click="goToDetail(vehicle.id)"
            >
              <div class="location-header">
                <span class="plate-number">{{ vehicle.plate_number }}</span>
                <span :class="['status-badge', `status-${vehicle.status}`]">
                  {{ getStatusText(vehicle.status) }}
                </span>
              </div>
              <div class="location-info">
                <div><i class="icon-location"></i> {{ vehicle.current_location }}</div>
                <div><i class="icon-user"></i> {{ vehicle.driver_name || '未分配' }}</div>
                <div v-if="vehicle.carrier_name">
                  <i class="icon-carrier"></i> {{ vehicle.carrier_name }}
                </div>
              </div>
              <div class="location-coords">
                坐标: {{ vehicle.latitude }}, {{ vehicle.longitude }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getVehicles, getVehicleLocations, deleteVehicle } from '@/api/vehicle';

export default {
  name: 'VehicleList',
  data() {
    return {
      viewMode: 'table', // 'table' 或 'map'
      loading: false,
      loadingLocations: false,
      vehicles: [],
      vehicleLocations: [],
      searchForm: {
        plate_number: '',
        vehicle_type: '',
        status: ''
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0
      }
    };
  },
  mounted() {
    this.loadVehicles();
  },
  watch: {
    viewMode(newMode) {
      if (newMode === 'map') {
        this.loadVehicleLocations();
      }
    }
  },
  methods: {
    async loadVehicles() {
      this.loading = true;
      try {
        const params = {
          ...this.searchForm,
          page: this.pagination.page,
          pageSize: this.pagination.pageSize
        };
        
        const response = await getVehicles(params);
        
        if (response.code === 200) {
          this.vehicles = response.data;
          this.pagination = response.pagination;
        }
      } catch (error) {
        console.error('加载车辆列表失败:', error);
        this.$notifyError('加载车辆列表', error);
      } finally {
        this.loading = false;
      }
    },
    
    async loadVehicleLocations() {
      this.loadingLocations = true;
      try {
        const params = {
          status: this.searchForm.status
        };
        
        const response = await getVehicleLocations(params);
        
        if (response.code === 200) {
          this.vehicleLocations = response.data;
        }
      } catch (error) {
        console.error('加载车辆位置失败:', error);
        this.$notifyError('加载车辆位置', error);
      } finally {
        this.loadingLocations = false;
      }
    },
    
    handleSearch() {
      this.pagination.page = 1;
      this.loadVehicles();
      if (this.viewMode === 'map') {
        this.loadVehicleLocations();
      }
    },
    
    handleReset() {
      this.searchForm = {
        plate_number: '',
        vehicle_type: '',
        status: ''
      };
      this.pagination.page = 1;
      this.loadVehicles();
      if (this.viewMode === 'map') {
        this.loadVehicleLocations();
      }
    },
    
    handlePageChange(page) {
      this.pagination.page = page;
      this.loadVehicles();
    },
    
    goToCreate() {
      this.$router.push('/vehicles/create');
    },
    
    goToDetail(id) {
      this.$router.push(`/vehicles/${id}`);
    },
    
    handleEdit(id) {
      this.$router.push(`/vehicles/${id}/edit`);
    },
    
    async handleDelete(id) {
      try {
        const { ElMessageBox } = await import('element-plus');
        await ElMessageBox.confirm('确定要删除该车辆吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        const response = await deleteVehicle(id);
        if (response.code === 200) {
          this.$notifySuccess('删除车辆');
          this.loadVehicles();
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$notifyError('删除车辆', error);
          console.error('删除车辆失败:', error);
        }
      }
    },
    
    showOnMap(vehicle) {
      // 切换到地图视图并定位到该车辆
      this.viewMode = 'map';
      this.$nextTick(() => {
        // 这里可以添加地图定位逻辑
        console.log('定位到车辆:', vehicle);
      });
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
.vehicle-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.search-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
  flex-wrap: wrap;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-item label {
  white-space: nowrap;
  color: #666;
}

.search-item input,
.search-item select {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 150px;
}

.search-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.view-toggle {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.toggle-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.toggle-btn:hover {
  background: #f5f5f5;
}

.toggle-btn.active {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.table-view {
  background: white;
  border-radius: 4px;
  padding: 20px;
}

.loading,
.empty {
  text-align: center;
  padding: 40px;
  color: #999;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #fafafa;
  font-weight: 600;
  color: #333;
}

.data-table tbody tr {
  transition: background 0.3s;
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  background: #f5f5f5;
}

.plate-number {
  font-weight: 600;
  color: #1890ff;
}

.text-secondary {
  font-size: 12px;
  color: #999;
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

.actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  padding: 4px 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
}

.btn-icon:hover {
  color: #1890ff;
}

.btn-icon.danger:hover {
  color: #f5222d;
}

.btn-link {
  padding: 2px 8px;
  border: none;
  background: transparent;
  color: #1890ff;
  cursor: pointer;
  font-size: 12px;
}

.btn-link:hover {
  text-decoration: underline;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.page-info {
  color: #666;
}

.map-view {
  background: white;
  border-radius: 4px;
  padding: 20px;
}

.map-container {
  min-height: 600px;
  border: 1px solid #eee;
  border-radius: 4px;
  position: relative;
}

.map-loading,
.map-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 600px;
  color: #999;
}

.map-placeholder {
  padding: 20px;
}

.map-info {
  text-align: center;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 20px;
}

.map-info h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.map-info p {
  margin: 0;
  color: #666;
}

.location-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.location-item {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.location-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.location-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.location-info i {
  margin-right: 5px;
  color: #999;
}

.location-coords {
  font-size: 12px;
  color: #999;
  padding-top: 10px;
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

.btn-primary:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
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

.btn-secondary:disabled {
  color: #d9d9d9;
  border-color: #d9d9d9;
  cursor: not-allowed;
}
</style>
