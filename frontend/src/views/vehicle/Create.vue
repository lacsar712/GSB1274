<template>
  <div class="vehicle-create">
    <div class="page-header">
      <button class="btn-back" @click="goBack">
        <i class="icon-back"></i> 返回
      </button>
      <h1>{{ isEdit ? '编辑车辆' : '添加车辆' }}</h1>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <!-- 基本信息 -->
        <div class="form-section">
          <h2>基本信息</h2>
          <div class="form-grid">
            <div class="form-item required">
              <label>车牌号</label>
              <input 
                v-model="form.plate_number" 
                type="text" 
                placeholder="请输入车牌号"
                required
              />
              <span class="form-hint">例如：京A12345</span>
            </div>

            <div class="form-item required">
              <label>车辆类型</label>
              <select v-model="form.vehicle_type" required>
                <option value="">请选择车辆类型</option>
                <option value="truck">货车</option>
                <option value="van">厢式货车</option>
                <option value="flatbed">平板车</option>
                <option value="container">集装箱车</option>
                <option value="refrigerated">冷藏车</option>
              </select>
            </div>

            <div class="form-item">
              <label>品牌</label>
              <input 
                v-model="form.brand" 
                type="text" 
                placeholder="请输入车辆品牌"
              />
            </div>

            <div class="form-item">
              <label>型号</label>
              <input 
                v-model="form.model" 
                type="text" 
                placeholder="请输入车辆型号"
              />
            </div>

            <div class="form-item">
              <label>颜色</label>
              <input 
                v-model="form.color" 
                type="text" 
                placeholder="请输入车辆颜色"
              />
            </div>

            <div class="form-item">
              <label>年份</label>
              <input 
                v-model.number="form.year" 
                type="number" 
                min="1990"
                :max="new Date().getFullYear()"
                placeholder="请输入生产年份"
              />
            </div>

            <div class="form-item">
              <label>载重能力（吨）</label>
              <input 
                v-model.number="form.load_capacity" 
                type="number" 
                step="0.1"
                min="0"
                placeholder="请输入载重能力"
              />
            </div>

            <div class="form-item">
              <label>容积（m³）</label>
              <input 
                v-model.number="form.volume_capacity" 
                type="number" 
                step="0.1"
                min="0"
                placeholder="请输入容积"
              />
            </div>

            <div class="form-item">
              <label>状态</label>
              <select v-model="form.status">
                <option value="available">可用</option>
                <option value="in_use">使用中</option>
                <option value="maintenance">维护中</option>
                <option value="inactive">停用</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 司机信息 -->
        <div class="form-section">
          <h2>司机信息</h2>
          <div class="form-grid">
            <div class="form-item">
              <label>司机姓名</label>
              <input 
                v-model="form.driver_name" 
                type="text" 
                placeholder="请输入司机姓名"
              />
            </div>

            <div class="form-item">
              <label>司机电话</label>
              <input 
                v-model="form.driver_phone" 
                type="tel" 
                placeholder="请输入司机电话"
                pattern="^1[3-9]\d{9}$"
              />
              <span class="form-hint">请输入11位手机号码</span>
            </div>

            <div class="form-item">
              <label>驾驶证号</label>
              <input 
                v-model="form.driver_license" 
                type="text" 
                placeholder="请输入驾驶证号"
              />
            </div>
          </div>
        </div>

        <!-- 承运人信息 -->
        <div class="form-section">
          <h2>承运人信息</h2>
          <div class="form-grid">
            <div class="form-item">
              <label>承运人</label>
              <select v-model="form.carrier_id">
                <option value="">请选择承运人（可选）</option>
                <option v-for="carrier in carriers" :key="carrier.id" :value="carrier.id">
                  {{ carrier.name }}
                </option>
              </select>
              <span class="form-hint">如果车辆属于某个承运人，请选择</span>
            </div>
          </div>
        </div>

        <!-- 证件信息 -->
        <div class="form-section">
          <h2>证件信息</h2>
          <div class="form-grid">
            <div class="form-item">
              <label>注册日期</label>
              <input 
                v-model="form.registration_date" 
                type="date" 
              />
            </div>

            <div class="form-item">
              <label>保险到期日</label>
              <input 
                v-model="form.insurance_expiry" 
                type="date" 
              />
            </div>

            <div class="form-item">
              <label>年检到期日</label>
              <input 
                v-model="form.inspection_expiry" 
                type="date" 
              />
            </div>

            <div class="form-item">
              <label>GPS设备ID</label>
              <input 
                v-model="form.gps_device_id" 
                type="text" 
                placeholder="请输入GPS设备ID"
              />
            </div>
          </div>
        </div>

        <!-- 位置信息 -->
        <div class="form-section">
          <h2>位置信息</h2>
          <div class="form-grid">
            <div class="form-item full-width">
              <label>当前位置</label>
              <input 
                v-model="form.current_location" 
                type="text" 
                placeholder="请输入当前位置"
              />
            </div>

            <div class="form-item">
              <label>纬度</label>
              <input 
                v-model.number="form.latitude" 
                type="number" 
                step="0.000001"
                placeholder="请输入纬度"
              />
            </div>

            <div class="form-item">
              <label>经度</label>
              <input 
                v-model.number="form.longitude" 
                type="number" 
                step="0.000001"
                placeholder="请输入经度"
              />
            </div>
          </div>
        </div>

        <!-- 其他信息 -->
        <div class="form-section">
          <h2>其他信息</h2>
          <div class="form-grid">
            <div class="form-item full-width">
              <label>描述</label>
              <textarea 
                v-model="form.description" 
                rows="4"
                placeholder="请输入车辆描述信息"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- 表单操作 -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" @click="goBack">取消</button>
          <button type="submit" class="btn-primary" :disabled="submitting">
            {{ submitting ? '提交中...' : (isEdit ? '保存' : '创建') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { createVehicle, updateVehicle, getVehicleById } from '@/api/vehicle';
import { getCarriers } from '@/api/carrier';

export default {
  name: 'VehicleCreate',
  data() {
    return {
      isEdit: false,
      submitting: false,
      carriers: [],
      form: {
        plate_number: '',
        vehicle_type: '',
        brand: '',
        model: '',
        color: '',
        year: null,
        load_capacity: null,
        volume_capacity: null,
        carrier_id: '',
        driver_name: '',
        driver_phone: '',
        driver_license: '',
        registration_date: '',
        insurance_expiry: '',
        inspection_expiry: '',
        gps_device_id: '',
        current_location: '',
        latitude: null,
        longitude: null,
        description: '',
        status: 'available'
      }
    };
  },
  mounted() {
    this.isEdit = !!this.$route.params.id;
    this.loadCarriers();
    
    if (this.isEdit) {
      this.loadVehicle();
    }
  },
  methods: {
    async loadCarriers() {
      try {
        const response = await getCarriers({ pageSize: 1000 });
        if (response.code === 200) {
          this.carriers = response.data;
        }
      } catch (error) {
        console.error('加载承运人列表失败:', error);
      }
    },
    
    async loadVehicle() {
      try {
        const vehicleId = this.$route.params.id;
        const response = await getVehicleById(vehicleId);
        
        if (response.code === 200) {
          const vehicle = response.data;
          
          // 填充表单数据
          this.form = {
            plate_number: vehicle.plate_number || '',
            vehicle_type: vehicle.vehicle_type || '',
            brand: vehicle.brand || '',
            model: vehicle.model || '',
            color: vehicle.color || '',
            year: vehicle.year || null,
            load_capacity: vehicle.load_capacity || null,
            volume_capacity: vehicle.volume_capacity || null,
            carrier_id: vehicle.carrier_id || '',
            driver_name: vehicle.driver_name || '',
            driver_phone: vehicle.driver_phone || '',
            driver_license: vehicle.driver_license || '',
            registration_date: this.formatDateForInput(vehicle.registration_date),
            insurance_expiry: this.formatDateForInput(vehicle.insurance_expiry),
            inspection_expiry: this.formatDateForInput(vehicle.inspection_expiry),
            gps_device_id: vehicle.gps_device_id || '',
            current_location: vehicle.current_location || '',
            latitude: vehicle.latitude || null,
            longitude: vehicle.longitude || null,
            description: vehicle.description || '',
            status: vehicle.status || 'available'
          };
        }
      } catch (error) {
        console.error('加载车辆信息失败:', error);
        this.$notifyError('加载车辆信息', error);
      }
    },
    
    async handleSubmit() {
      this.submitting = true;
      
      try {
        // 准备提交数据
        const submitData = {
          ...this.form,
          carrier_id: this.form.carrier_id || null,
          year: this.form.year || null,
          load_capacity: this.form.load_capacity || null,
          volume_capacity: this.form.volume_capacity || null,
          latitude: this.form.latitude || null,
          longitude: this.form.longitude || null
        };
        
        let response;
        if (this.isEdit) {
          const vehicleId = this.$route.params.id;
          response = await updateVehicle(vehicleId, submitData);
        } else {
          response = await createVehicle(submitData);
        }
        
        if (response.code === 200 || response.code === 201) {
          this.$notifySuccess(this.isEdit ? '更新车辆' : '创建车辆');
          this.$router.push('/vehicles');
        }
      } catch (error) {
        console.error('提交失败:', error);
        this.$notifyError('提交车辆信息', error);
      } finally {
        this.submitting = false;
      }
    },
    
    goBack() {
      this.$router.back();
    },
    
    formatDateForInput(date) {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
};
</script>

<style scoped>
.vehicle-create {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
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

.form-container {
  background: white;
  border-radius: 4px;
  padding: 20px;
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-item.full-width {
  grid-column: 1 / -1;
}

.form-item label {
  font-size: 14px;
  color: #666;
}

.form-item.required label::after {
  content: ' *';
  color: #f5222d;
}

.form-item input,
.form-item select,
.form-item textarea {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-item input:focus,
.form-item select:focus,
.form-item textarea:focus {
  outline: none;
  border-color: #1890ff;
}

.form-item textarea {
  resize: vertical;
  font-family: inherit;
}

.form-hint {
  font-size: 12px;
  color: #999;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-primary {
  padding: 10px 24px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 14px;
}

.btn-primary:hover:not(:disabled) {
  background: #40a9ff;
}

.btn-primary:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 24px;
  background: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.btn-secondary:hover {
  color: #1890ff;
  border-color: #1890ff;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
