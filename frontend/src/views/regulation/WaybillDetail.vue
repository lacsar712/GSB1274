<template>
  <div class="regulation-waybill-detail">
    <el-card class="mb12" shadow="hover">
      <div class="page-header">
        <h2>监管运单详情</h2>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-card>

    <el-card v-if="waybill" shadow="never">
      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="运单号">{{ waybill.waybill_number }}</el-descriptions-item>
        <el-descriptions-item label="企业名称">{{ waybill.company_name }}</el-descriptions-item>
        <el-descriptions-item label="货物名称">{{ waybill.cargo_name }}</el-descriptions-item>
        <el-descriptions-item label="司机">{{ waybill.driver_name }}</el-descriptions-item>
        <el-descriptions-item label="车牌号">{{ waybill.vehicle_plate }}</el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="监管信息" :column="2" border class="mt16">
        <el-descriptions-item label="监管状态">
          <el-tag :type="statusTagType(waybill.regulation_status)">{{ getRegulationStatusLabel(waybill.regulation_status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="风险等级">
          <el-tag :type="riskTagType(waybill.risk_level)">{{ getRiskLevelLabel(waybill.risk_level) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="监管备注" :span="2">
          <div class="desc-text">{{ waybill.regulation_notes || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="监管结果" :span="2">
          <div class="desc-text">{{ waybill.regulation_result || '-' }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="其他信息" :column="2" border class="mt16">
        <el-descriptions-item label="创建时间">{{ formatDate(waybill.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(waybill.updated_at) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <div v-else class="loading">加载中...</div>
  </div>
  </template>

<script>
import { getRegulationWaybillById } from '@/api/regulationWaybill';

export default {
  name: 'RegulationWaybillDetail',
  data() {
    return {
      waybill: null
    };
  },
  mounted() {
    this.loadWaybill();
  },
  methods: {
    async loadWaybill() {
      try {
        const id = this.$route.params.id;
        const response = await getRegulationWaybillById(id);
        if (response.success) {
          this.waybill = response.data;
        } else {
          this.$notifyError('加载监管运单详情', new Error(response.message || '请求失败'));
        }
      } catch (error) {
        this.$notifyError('加载监管运单详情', error);
      }
    },
    goBack() {
      this.$router.back();
    },
    getRegulationStatusLabel(status) {
      const labels = {
        pending: '待审核',
        approved: '已批准',
        rejected: '已拒绝'
      };
      return labels[status] || status || '-';
    },
    getRiskLevelLabel(level) {
      const labels = {
        low: '低风险',
        medium: '中风险',
        high: '高风险'
      };
      return labels[level] || level || '-';
    },
    statusTagType(s) {
      if (s === 'approved') return 'success';
      if (s === 'rejected') return 'danger';
      return 'warning';
    },
    riskTagType(r) {
      if (r === 'high') return 'danger';
      if (r === 'medium') return 'warning';
      return 'success';
    },
    formatDate(date) {
      if (!date) return '-';
      return new Date(date).toLocaleString('zh-CN');
    }
  }
};
</script>

<style scoped>
.mb12 { margin-bottom: 12px; }
.mt16 { margin-top: 16px; }
.desc-text { white-space: pre-wrap; }
.regulation-waybill-detail { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin: 0; }
.loading { text-align: center; padding: 40px; color: #999; }
</style>
