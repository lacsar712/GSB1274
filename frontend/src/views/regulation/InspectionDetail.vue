<template>
  <div class="regulation-inspection-detail">
    <el-card class="mb12" shadow="hover">
      <div class="page-header">
        <h2>抽检详情</h2>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-card>

    <el-card v-if="inspection" shadow="never">
      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="抽检编号">{{ inspection.inspection_code }}</el-descriptions-item>
        <el-descriptions-item label="抽检标题">{{ inspection.inspection_title }}</el-descriptions-item>
        <el-descriptions-item label="抽检类型">{{ getInspectionTypeLabel(inspection.inspection_type) }}</el-descriptions-item>
        <el-descriptions-item label="企业名称">{{ inspection.company_name }}</el-descriptions-item>
        <el-descriptions-item label="检查员">{{ inspection.inspector_name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="计划日期">{{ formatDate(inspection.scheduled_date) }}</el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="结果信息" :column="2" border class="mt16">
        <el-descriptions-item label="抽检结果">
          <el-tag :type="resultTagType(inspection.result)">{{ getResultLabel(inspection.result) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="评分">
          <span class="score">{{ inspection.score ?? '-' }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="备注信息" :column="2" border class="mt16">
        <el-descriptions-item label="描述" :span="2">
          <div class="desc-text">{{ inspection.description || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(inspection.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(inspection.updated_at) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <div v-else class="loading">加载中...</div>
  </div>
  </template>

<script>
import { getInspectionById } from '@/api/regulationInspection';

export default {
  name: 'RegulationInspectionDetail',
  data() {
    return {
      inspection: null
    };
  },
  mounted() {
    this.loadInspection();
  },
  methods: {
    async loadInspection() {
      try {
        const id = this.$route.params.id;
        const response = await getInspectionById(id);
        if (response.success) {
          this.inspection = response.data;
        } else {
          this.$notifyError('加载抽检详情', new Error(response.message || '请求失败'));
        }
      } catch (error) {
        this.$notifyError('加载抽检详情', error);
      }
    },
    goBack() {
      this.$router.back();
    },
    getInspectionTypeLabel(type) {
      const labels = {
        routine: '常规抽检',
        special: '专项抽检',
        random: '随机抽检'
      };
      return labels[type] || type || '-';
    },
    getResultLabel(result) {
      const labels = {
        passed: '通过',
        failed: '未通过'
      };
      return labels[result] || result || '-';
    },
    resultTagType(r) {
      if (r === 'passed') return 'success';
      if (r === 'failed') return 'danger';
      return 'info';
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
.regulation-inspection-detail { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin: 0; }
.score { font-weight: 600; color: #409eff; }
.loading { text-align: center; padding: 40px; color: #999; }
</style>
