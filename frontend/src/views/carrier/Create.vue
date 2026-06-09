<template>
  <div class="carrier-create">
    <div class="page-header">
      <button class="btn-back" @click="goBack">
        <i class="icon-back"></i> 返回
      </button>
      <h1>{{ isEdit ? '编辑承运人' : '添加承运人' }}</h1>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <!-- 基本信息 -->
        <div class="form-section">
          <h2>基本信息</h2>
          <div class="form-grid">
            <div class="form-item required">
              <label>承运人名称</label>
              <input 
                v-model="form.name" 
                type="text" 
                placeholder="请输入承运人名称"
                required
              />
            </div>

            <div class="form-item required">
              <label>联系人</label>
              <input 
                v-model="form.contact_person" 
                type="text" 
                placeholder="请输入联系人姓名"
                required
              />
            </div>

            <div class="form-item required">
              <label>联系电话</label>
              <input 
                v-model="form.contact_phone" 
                type="tel" 
                placeholder="请输入联系电话"
                pattern="^1[3-9]\d{9}$"
                required
              />
              <span class="form-hint">请输入11位手机号码</span>
            </div>

            <div class="form-item">
              <label>联系邮箱</label>
              <input 
                v-model="form.contact_email" 
                type="email" 
                placeholder="请输入联系邮箱"
              />
            </div>

            <div class="form-item full-width">
              <label>地址</label>
              <input 
                v-model="form.address" 
                type="text" 
                placeholder="请输入详细地址"
              />
            </div>
          </div>
        </div>

        <!-- 资质信息 -->
        <div class="form-section">
          <h2>资质信息</h2>
          <div class="form-grid">
            <div class="form-item">
              <label>营业执照号</label>
              <input 
                v-model="form.business_license" 
                type="text" 
                placeholder="请输入营业执照号"
              />
            </div>

            <div class="form-item">
              <label>道路运输许可证</label>
              <input 
                v-model="form.transport_license" 
                type="text" 
                placeholder="请输入道路运输许可证号"
              />
            </div>

            <div class="form-item">
              <label>车辆数量</label>
              <input 
                v-model.number="form.vehicle_count" 
                type="number" 
                min="0"
                placeholder="请输入车辆数量"
              />
            </div>

            <div class="form-item">
              <label>司机数量</label>
              <input 
                v-model.number="form.driver_count" 
                type="number" 
                min="0"
                placeholder="请输入司机数量"
              />
            </div>

            <div class="form-item full-width">
              <label>服务区域</label>
              <input 
                v-model="form.service_area" 
                type="text" 
                placeholder="请输入服务区域，如：华东地区、全国等"
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
                placeholder="请输入承运人描述信息"
              ></textarea>
            </div>

            <div class="form-item">
              <label>状态</label>
              <select v-model="form.status">
                <option value="active">活跃</option>
                <option value="inactive">停用</option>
                <option value="suspended">暂停</option>
              </select>
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
import { createCarrier, updateCarrier, getCarrierById } from '@/api/carrier';

export default {
  name: 'CarrierCreate',
  data() {
    return {
      isEdit: false,
      submitting: false,
      form: {
        name: '',
        contact_person: '',
        contact_phone: '',
        contact_email: '',
        address: '',
        business_license: '',
        transport_license: '',
        vehicle_count: 0,
        driver_count: 0,
        service_area: '',
        description: '',
        status: 'active'
      }
    };
  },
  mounted() {
    const carrierId = this.$route.params.id;
    if (carrierId) {
      this.isEdit = true;
      this.loadCarrier(carrierId);
    }
  },
  methods: {
    async loadCarrier(carrierId) {
      try {
        const response = await getCarrierById(carrierId);
        
        if (response.code === 200) {
          const carrier = response.data;
          this.form = {
            name: carrier.name,
            contact_person: carrier.contact_person,
            contact_phone: carrier.contact_phone,
            contact_email: carrier.contact_email || '',
            address: carrier.address || '',
            business_license: carrier.business_license || '',
            transport_license: carrier.transport_license || '',
            vehicle_count: carrier.vehicle_count || 0,
            driver_count: carrier.driver_count || 0,
            service_area: carrier.service_area || '',
            description: carrier.description || '',
            status: carrier.status
          };
        } else {
          this.$message.error(response.message || '获取承运人信息失败');
          this.goBack();
        }
      } catch (error) {
        console.error('获取承运人信息失败:', error);
        this.$message.error('获取承运人信息失败');
        this.goBack();
      }
    },
    
    async handleSubmit() {
      // 验证必填字段
      if (!this.form.name || !this.form.contact_person || !this.form.contact_phone) {
        this.$message.error('请填写所有必填项');
        return;
      }

      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(this.form.contact_phone)) {
        this.$message.error('请输入正确的手机号码');
        return;
      }

      // 验证邮箱格式（如果填写了）
      if (this.form.contact_email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.form.contact_email)) {
          this.$message.error('请输入正确的邮箱地址');
          return;
        }
      }

      this.submitting = true;
      
      try {
        let response;
        if (this.isEdit) {
          const carrierId = this.$route.params.id;
          response = await updateCarrier(carrierId, this.form);
        } else {
          response = await createCarrier(this.form);
        }
        
        if (response.code === 200 || response.code === 201) {
          this.$message.success(this.isEdit ? '更新成功' : '创建成功');
          this.$router.push('/carriers');
        } else {
          this.$message.error(response.message || (this.isEdit ? '更新失败' : '创建失败'));
        }
      } catch (error) {
        console.error('提交失败:', error);
        this.$message.error(error.response?.data?.message || (this.isEdit ? '更新失败' : '创建失败'));
      } finally {
        this.submitting = false;
      }
    },
    
    goBack() {
      this.$router.back();
    }
  }
};
</script>

<style scoped>
.carrier-create {
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

.form-container {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 32px;
}

.form-section:last-of-type {
  margin-bottom: 24px;
}

.form-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item.full-width {
  grid-column: 1 / -1;
}

.form-item label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.form-item.required label::after {
  content: ' *';
  color: #f44336;
}

.form-item input,
.form-item select,
.form-item textarea {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-item input:focus,
.form-item select:focus,
.form-item textarea:focus {
  outline: none;
  border-color: #1976d2;
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
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.btn-primary,
.btn-secondary {
  padding: 10px 24px;
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

.btn-primary:hover:not(:disabled) {
  background: #1565c0;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.icon-back::before {
  content: '←';
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-item.full-width {
    grid-column: 1;
  }
}
</style>
