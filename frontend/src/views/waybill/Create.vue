<template>
  <div class="waybill-create">
    <div class="page-header">
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2>创建运单</h2>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="waybill-form"
    >
      <!-- 发货信息 -->
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <el-icon><LocationFilled /></el-icon>
            <span>发货信息</span>
          </div>
        </template>
        <el-form-item label="发货人" prop="sender.name">
          <el-input v-model="form.sender.name" placeholder="请输入发货人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="sender.phone">
          <el-input v-model="form.sender.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="省份" prop="sender.address.province">
          <el-input v-model="form.sender.address.province" placeholder="请输入省份" />
        </el-form-item>
        <el-form-item label="城市" prop="sender.address.city">
          <el-input v-model="form.sender.address.city" placeholder="请输入城市" />
        </el-form-item>
        <el-form-item label="区县" prop="sender.address.district">
          <el-input v-model="form.sender.address.district" placeholder="请输入区县" />
        </el-form-item>
        <el-form-item label="详细地址" prop="sender.address.detail">
          <el-input
            v-model="form.sender.address.detail"
            type="textarea"
            :rows="2"
            placeholder="请输入详细地址"
          />
        </el-form-item>
      </el-card>

      <!-- 收货信息 -->
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <el-icon><LocationFilled /></el-icon>
            <span>收货信息</span>
          </div>
        </template>
        <el-form-item label="收货人" prop="receiver.name">
          <el-input v-model="form.receiver.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="receiver.phone">
          <el-input v-model="form.receiver.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="省份" prop="receiver.address.province">
          <el-input v-model="form.receiver.address.province" placeholder="请输入省份" />
        </el-form-item>
        <el-form-item label="城市" prop="receiver.address.city">
          <el-input v-model="form.receiver.address.city" placeholder="请输入城市" />
        </el-form-item>
        <el-form-item label="区县" prop="receiver.address.district">
          <el-input v-model="form.receiver.address.district" placeholder="请输入区县" />
        </el-form-item>
        <el-form-item label="详细地址" prop="receiver.address.detail">
          <el-input
            v-model="form.receiver.address.detail"
            type="textarea"
            :rows="2"
            placeholder="请输入详细地址"
          />
        </el-form-item>
      </el-card>

      <!-- 货物信息 -->
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <el-icon><Box /></el-icon>
            <span>货物信息</span>
          </div>
        </template>
        <el-form-item label="货物名称" prop="cargo.name">
          <el-input v-model="form.cargo.name" placeholder="请输入货物名称" />
        </el-form-item>
        <el-form-item label="货物类型" prop="cargo.type">
          <el-select v-model="form.cargo.type" placeholder="请选择货物类型">
            <el-option label="普货" value="普货" />
            <el-option label="危险品" value="危险品" />
            <el-option label="冷链" value="冷链" />
            <el-option label="贵重物品" value="贵重物品" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="重量(kg)" prop="cargo.weight">
          <el-input-number
            v-model="form.cargo.weight"
            :min="0"
            :precision="2"
            placeholder="请输入重量"
          />
        </el-form-item>
        <el-form-item label="体积(m³)" prop="cargo.volume">
          <el-input-number
            v-model="form.cargo.volume"
            :min="0"
            :precision="2"
            placeholder="请输入体积"
          />
        </el-form-item>
        <el-form-item label="数量" prop="cargo.quantity">
          <el-input-number
            v-model="form.cargo.quantity"
            :min="1"
            placeholder="请输入数量"
          />
        </el-form-item>
        <el-form-item label="货值(元)" prop="cargo.value">
          <el-input-number
            v-model="form.cargo.value"
            :min="0"
            :precision="2"
            placeholder="请输入货值"
          />
        </el-form-item>
        <el-form-item label="货物描述" prop="cargo.description">
          <el-input
            v-model="form.cargo.description"
            type="textarea"
            :rows="3"
            placeholder="请输入货物描述"
          />
        </el-form-item>
      </el-card>

      <!-- 运输信息 -->
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <el-icon><Van /></el-icon>
            <span>运输信息</span>
          </div>
        </template>
        <el-form-item label="运输方式" prop="transport.type">
          <el-select v-model="form.transport.type" placeholder="请选择运输方式">
            <el-option label="公路" value="公路" />
            <el-option label="铁路" value="铁路" />
            <el-option label="航空" value="航空" />
            <el-option label="水运" value="水运" />
            <el-option label="多式联运" value="多式联运" />
          </el-select>
        </el-form-item>
        <el-form-item label="车牌号" prop="transport.vehicleNo">
          <el-input v-model="form.transport.vehicleNo" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label="司机姓名" prop="transport.driverName">
          <el-input v-model="form.transport.driverName" placeholder="请输入司机姓名" />
        </el-form-item>
        <el-form-item label="司机电话" prop="transport.driverPhone">
          <el-input v-model="form.transport.driverPhone" placeholder="请输入司机电话" />
        </el-form-item>
        <el-form-item label="预计发车时间" prop="transport.estimatedDepartureTime">
          <el-date-picker
            v-model="form.transport.estimatedDepartureTime"
            type="datetime"
            placeholder="请选择预计发车时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="预计到达时间" prop="transport.estimatedArrivalTime">
          <el-date-picker
            v-model="form.transport.estimatedArrivalTime"
            type="datetime"
            placeholder="请选择预计到达时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-card>

      <!-- 费用信息 -->
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <el-icon><Money /></el-icon>
            <span>费用信息</span>
          </div>
        </template>
        <el-form-item label="运费(元)" prop="fee.freight">
          <el-input-number
            v-model="form.fee.freight"
            :min="0"
            :precision="2"
            placeholder="请输入运费"
          />
        </el-form-item>
        <el-form-item label="保险费(元)" prop="fee.insurance">
          <el-input-number
            v-model="form.fee.insurance"
            :min="0"
            :precision="2"
            placeholder="请输入保险费"
          />
        </el-form-item>
        <el-form-item label="其他费用(元)" prop="fee.other">
          <el-input-number
            v-model="form.fee.other"
            :min="0"
            :precision="2"
            placeholder="请输入其他费用"
          />
        </el-form-item>
        <el-form-item label="总费用(元)">
          <el-input :value="totalFee" disabled />
        </el-form-item>
        <el-form-item label="支付方式" prop="fee.paymentMethod">
          <el-select v-model="form.fee.paymentMethod" placeholder="请选择支付方式">
            <el-option label="现金" value="现金" />
            <el-option label="转账" value="转账" />
            <el-option label="月结" value="月结" />
            <el-option label="到付" value="到付" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付状态" prop="fee.paid">
          <el-switch v-model="form.fee.paid" />
        </el-form-item>
      </el-card>

      <!-- 备注 -->
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <el-icon><Document /></el-icon>
            <span>备注信息</span>
          </div>
        </template>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-card>

      <!-- 提交按钮 -->
      <div class="form-actions">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          创建运单
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import {
  ArrowLeft,
  LocationFilled,
  Box,
  Van,
  Money,
  Document
} from '@element-plus/icons-vue';
import { createWaybill } from '@/api/waybill';

const router = useRouter();
const { proxy } = getCurrentInstance();

// 假设从路由或store获取企业ID
const companyId = ref('');

// 表单引用
const formRef = ref(null);
const submitting = ref(false);

// 表单数据
const form = reactive({
  sender: {
    name: '',
    phone: '',
    address: {
      province: '',
      city: '',
      district: '',
      detail: ''
    }
  },
  receiver: {
    name: '',
    phone: '',
    address: {
      province: '',
      city: '',
      district: '',
      detail: ''
    }
  },
  cargo: {
    name: '',
    type: '普货',
    weight: 0,
    volume: 0,
    quantity: 1,
    value: 0,
    description: ''
  },
  transport: {
    type: '公路',
    vehicleNo: '',
    driverName: '',
    driverPhone: '',
    estimatedDepartureTime: '',
    estimatedArrivalTime: ''
  },
  fee: {
    freight: 0,
    insurance: 0,
    other: 0,
    paymentMethod: '到付',
    paid: false
  },
  remark: ''
});

// 验证规则
const rules = {
  'sender.name': [
    { required: true, message: '请输入发货人姓名', trigger: 'blur' }
  ],
  'sender.phone': [
    { required: true, message: '请输入发货人电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  'receiver.name': [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' }
  ],
  'receiver.phone': [
    { required: true, message: '请输入收货人电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  'cargo.name': [
    { required: true, message: '请输入货物名称', trigger: 'blur' }
  ],
  'cargo.type': [
    { required: true, message: '请选择货物类型', trigger: 'change' }
  ],
  'cargo.weight': [
    { required: true, message: '请输入货物重量', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '重量必须大于0', trigger: 'blur' }
  ],
  'transport.type': [
    { required: true, message: '请选择运输方式', trigger: 'change' }
  ]
};

// 计算总费用
const totalFee = computed(() => {
  return (
    (form.fee.freight || 0) +
    (form.fee.insurance || 0) +
    (form.fee.other || 0)
  ).toFixed(2);
});

// 提交表单
const handleSubmit = async () => {
  try {
    // 验证表单
    await formRef.value.validate();

    submitting.value = true;

    // 提交数据
    const response = await createWaybill(companyId.value, form);
    if (response.success) {
      proxy.$notifySuccess('创建运单');
      router.push('/waybill/list');
    }
  } catch (error) {
    if (error !== false) {
      proxy.$notifyError('创建运单', error);
    }
  } finally {
    submitting.value = false;
  }
};

// 返回
const goBack = () => {
  router.back();
};
</script>

<style scoped>
.waybill-create {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.waybill-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-date-picker) {
  width: 100%;
}

:deep(.el-select) {
  width: 100%;
}
</style>
