<template>
  <div class="regulation-business-detail">
    <el-card class="mb12" shadow="hover">
      <div class="page-header">
        <h2>业务详情</h2>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-card>

    <el-card v-if="business" shadow="never">
      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="业务编号">{{ business.business_code }}</el-descriptions-item>
        <el-descriptions-item label="业务名称">{{ business.business_name }}</el-descriptions-item>
        <el-descriptions-item label="业务类型">{{ getBusinessTypeLabel(business.business_type) }}</el-descriptions-item>
        <el-descriptions-item label="企业名称">{{ business.company_name }}</el-descriptions-item>
        <el-descriptions-item label="风险等级">
          <el-tag :type="riskTagType(business.risk_level)">{{ getRiskLevelLabel(business.risk_level) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="business.status === 'active' ? 'success' : 'info'">
            {{ business.status === 'active' ? '活跃' : '停用' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="联系信息" :column="2" border class="mt16">
        <el-descriptions-item label="联系人">{{ business.contact_person || '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ business.contact_phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系邮箱">{{ business.contact_email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ business.address || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-descriptions title="其他信息" :column="2" border class="mt16">
        <el-descriptions-item label="描述" :span="2">
          <div class="desc-text">{{ business.description || '-' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(business.created_at) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(business.updated_at) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <div v-else class="loading">加载中...</div>
  </div>
</template>

<script>
import { getBusinessById } from '@/api/regulationBusiness';

export default {
  name: 'RegulationBusinessDetail',
  data() {
    return {
      business: null
    };
  },
  mounted() {
    this.loadBusiness();
  },
  methods: {
    async loadBusiness() {
      try {
        const id = this.$route.params.id;
        const response = await getBusinessById(id);
        if (response.success) {
          this.business = response.data;
        } else {
          this.$notifyError('加载业务详情', new Error(response.message || '请求失败'));
        }
      } catch (error) {
        this.$notifyError('加载业务详情', error);
      }
    },
    goBack() {
      this.$router.back();
    },
    getBusinessTypeLabel(type) {
      const labels = {
        transport: '运输业务',
        storage: '仓储业务',
        distribution: '配送业务'
      };
      return labels[type] || type;
    },
    getRiskLevelLabel(level) {
      const labels = {
        low: '低风险',
        medium: '中风险',
        high: '高风险'
      };
      return labels[level] || level;
    },
    formatDate(date) {
      if (!date) return '-';
      return new Date(date).toLocaleString('zh-CN');
    },
    riskTagType(r) {
      if (r === 'high') return 'danger';
      if (r === 'medium') return 'warning';
      return 'success';
    }
  }
};
</script>

<style scoped>
.mb12 { margin-bottom: 12px; }
.mt16 { margin-top: 16px; }
.desc-text { white-space: pre-wrap; }
.regulation-business-detail { padding: 0; }

.page-header { display: flex; justify-content: space-between; align-items: center; margin: 0; }

.loading {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>
