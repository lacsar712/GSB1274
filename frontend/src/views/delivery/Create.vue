<template>
  <div class="delivery-create">
    <el-card>
      <div class="card-header">新建配送订单</div>
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef">
        <el-form-item label="枢纽ID" prop="hub_id">
          <el-input v-model="form.hub_id" placeholder="如 HZ-003" />
        </el-form-item>
        <el-form-item label="枢纽名称" prop="hub_name">
          <el-input v-model="form.hub_name" placeholder="如 苏州吴中区集散中心" />
        </el-form-item>
        <el-divider />
        <el-form-item label="寄件人姓名" prop="sender_name">
          <el-input v-model="form.sender_name" />
        </el-form-item>
        <el-form-item label="寄件人电话" prop="sender_phone">
          <el-input v-model="form.sender_phone" />
        </el-form-item>
        <el-form-item label="寄件地址" prop="sender_address">
          <el-input v-model="form.sender_address" />
        </el-form-item>
        <el-divider />
        <el-form-item label="收件人姓名" prop="receiver_name">
          <el-input v-model="form.receiver_name" />
        </el-form-item>
        <el-form-item label="收件人电话" prop="receiver_phone">
          <el-input v-model="form.receiver_phone" />
        </el-form-item>
        <el-form-item label="收件地址" prop="receiver_address">
          <el-input v-model="form.receiver_address" />
        </el-form-item>
        <el-form-item label="收件纬度" prop="receiver_lat">
          <el-input v-model="form.receiver_lat" placeholder="31.165000" />
        </el-form-item>
        <el-form-item label="收件经度" prop="receiver_lng">
          <el-input v-model="form.receiver_lng" placeholder="120.625000" />
        </el-form-item>
        <el-divider />
        <el-form-item label="货物类型" prop="goods_type">
          <el-input v-model="form.goods_type" placeholder="生鲜/文件/电器" />
        </el-form-item>
        <el-form-item label="货物重量(kg)" prop="goods_weight">
          <el-input v-model="form.goods_weight" type="number" />
        </el-form-item>
        <el-form-item label="货物体积(m³)" prop="goods_volume">
          <el-input v-model="form.goods_volume" type="number" />
        </el-form-item>
        <el-form-item label="配送类型" prop="delivery_type">
          <el-select v-model="form.delivery_type" placeholder="请选择">
            <el-option label="即时配送" value="instant" />
            <el-option label="预约配送" value="scheduled" />
          </el-select>
        </el-form-item>
        <el-form-item label="预约时间">
          <el-date-picker v-model="form.scheduled_time" type="datetime" placeholder="选择时间" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可填入图片URL等" />
        </el-form-item>
        <div class="form-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { createDelivery } from '@/api/delivery';

const router = useRouter();
const formRef = ref(null);
const form = reactive({
  hub_id: '',
  hub_name: '',
  sender_name: '',
  sender_phone: '',
  sender_address: '',
  receiver_name: '',
  receiver_phone: '',
  receiver_address: '',
  receiver_lat: '',
  receiver_lng: '',
  goods_type: '',
  goods_weight: '',
  goods_volume: '',
  delivery_type: '',
  scheduled_time: '',
  remark: ''
});

const rules = {
  hub_id: [{ required: true, message: '请输入枢纽ID', trigger: 'blur' }],
  hub_name: [{ required: true, message: '请输入枢纽名称', trigger: 'blur' }],
  sender_name: [{ required: true, message: '请输入寄件人姓名', trigger: 'blur' }],
  sender_phone: [
    { required: true, message: '请输入寄件人电话', trigger: 'blur' },
    { validator: (_r, v, cb) => (/^1\d{10}$/.test(v) ? cb() : cb(new Error('请输入正确的手机号'))), trigger: 'blur' }
  ],
  receiver_name: [{ required: true, message: '请输入收件人姓名', trigger: 'blur' }],
  receiver_phone: [
    { required: true, message: '请输入收件人电话', trigger: 'blur' },
    { validator: (_r, v, cb) => (/^1\d{10}$/.test(v) ? cb() : cb(new Error('请输入正确的手机号'))), trigger: 'blur' }
  ],
  receiver_address: [{ required: true, message: '请输入收件地址', trigger: 'blur' }],
  delivery_type: [{ required: true, message: '请选择配送类型', trigger: 'change' }]
};

const handleCancel = () => {
  router.push('/delivery/list');
};

const handleSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    try {
      const payload = { ...form };
      if (!payload.scheduled_time || form.delivery_type === 'instant') {
        delete payload.scheduled_time;
      }
      const resp = await createDelivery(payload);
      if (resp.data.success) {
        ElMessage.success('创建成功');
        router.push('/delivery/list');
      }
    } catch (e) {
      ElMessage.error('创建失败');
    }
  });
};
</script>

<style scoped>
.delivery-create {
  padding: 20px;
}
.card-header {
  font-weight: 600;
  margin-bottom: 12px;
}
.form-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
