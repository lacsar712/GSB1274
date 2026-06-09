<template>
  <div class="risk-detail-container">
    <div class="page-header">
      <h2>风险详情</h2>
      <div class="header-actions">
        <el-button icon="el-icon-edit" @click="handleEdit">编辑</el-button>
        <el-button icon="el-icon-back" @click="handleBack">返回</el-button>
      </div>
    </div>

    <el-card v-loading="loading">
      <div v-if="risk" class="risk-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h3 class="section-title">基本信息</h3>
          <div class="detail-content">
            <div class="detail-row">
              <span class="label">风险标题：</span>
              <span class="value">{{ risk.title }}</span>
            </div>
            <div class="detail-row">
              <span class="label">风险分类：</span>
              <span class="value">
                <el-tag v-if="risk.category" type="info">{{ risk.category }}</el-tag>
                <span v-else>-</span>
              </span>
            </div>
            <div class="detail-row">
              <span class="label">风险等级：</span>
              <span class="value">
                <el-tag :type="getLevelType(risk.level)">
                  {{ getLevelLabel(risk.level) }}
                </el-tag>
              </span>
            </div>
            <div class="detail-row">
              <span class="label">风险状态：</span>
              <span class="value">
                <el-tag :type="getStatusType(risk.status)">
                  {{ getStatusLabel(risk.status) }}
                </el-tag>
              </span>
            </div>
            <div class="detail-row">
              <span class="label">发生概率：</span>
              <span class="value">
                {{ risk.probability ? getProbabilityLabel(risk.probability) : '-' }}
              </span>
            </div>
            <div class="detail-row">
              <span class="label">责任人：</span>
              <span class="value">{{ risk.owner || '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">关联项目：</span>
              <span class="value">{{ risk.relatedProject || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 风险描述 -->
        <div v-if="risk.description" class="detail-section">
          <h3 class="section-title">风险描述</h3>
          <div class="detail-content">
            <p class="text-content">{{ risk.description }}</p>
          </div>
        </div>

        <!-- 影响范围 -->
        <div v-if="risk.impact" class="detail-section">
          <h3 class="section-title">影响范围</h3>
          <div class="detail-content">
            <p class="text-content">{{ risk.impact }}</p>
          </div>
        </div>

        <!-- 应对措施 -->
        <div v-if="risk.mitigation" class="detail-section">
          <h3 class="section-title">应对措施</h3>
          <div class="detail-content">
            <p class="text-content">{{ risk.mitigation }}</p>
          </div>
        </div>

        <!-- 时间信息 -->
        <div class="detail-section">
          <h3 class="section-title">时间信息</h3>
          <div class="detail-content">
            <div class="detail-row">
              <span class="label">识别日期：</span>
              <span class="value">{{ formatDate(risk.identifiedDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">截止日期：</span>
              <span class="value">{{ formatDate(risk.dueDate) }}</span>
            </div>
            <div v-if="risk.closedDate" class="detail-row">
              <span class="label">关闭日期：</span>
              <span class="value">{{ formatDate(risk.closedDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">创建时间：</span>
              <span class="value">{{ formatDate(risk.createdAt) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">更新时间：</span>
              <span class="value">{{ formatDate(risk.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 标签 -->
        <div v-if="risk.tags && risk.tags.length > 0" class="detail-section">
          <h3 class="section-title">标签</h3>
          <div class="detail-content">
            <el-tag
              v-for="(tag, index) in risk.tags"
              :key="index"
              style="margin-right: 8px; margin-bottom: 8px"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <!-- 附件 -->
        <div v-if="risk.attachments && risk.attachments.length > 0" class="detail-section">
          <h3 class="section-title">附件</h3>
          <div class="detail-content">
            <div
              v-for="(attachment, index) in risk.attachments"
              :key="index"
              class="attachment-item"
            >
              <i class="el-icon-document"></i>
              <a :href="attachment.url" target="_blank">{{ attachment.name }}</a>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getRiskById } from '@/api/risk';

export default {
  name: 'RiskDetail',
  data() {
    return {
      riskId: null,
      risk: null,
      loading: false
    };
  },
  mounted() {
    this.riskId = this.$route.params.id;
    if (this.riskId) {
      this.loadRisk();
    } else {
      this.$message.error('缺少风险ID');
      this.$router.back();
    }
  },
  methods: {
    // 加载风险详情
    async loadRisk() {
      this.loading = true;
      try {
        const response = await getRiskById(this.riskId);
        if (response.code === 200) {
          this.risk = response.data;
        }
      } catch (error) {
        this.$message.error('加载风险详情失败');
        console.error(error);
        this.$router.back();
      } finally {
        this.loading = false;
      }
    },

    // 编辑风险
    handleEdit() {
      this.$router.push(`/risks/edit/${this.riskId}`);
    },

    // 返回列表
    handleBack() {
      this.$router.back();
    },

    // 获取等级类型
    getLevelType(level) {
      const types = {
        low: 'success',
        medium: 'warning',
        high: 'danger',
        critical: 'info'
      };
      return types[level] || '';
    },

    // 获取等级标签
    getLevelLabel(level) {
      const labels = {
        low: '低',
        medium: '中',
        high: '高',
        critical: '严重'
      };
      return labels[level] || level;
    },

    // 获取状态类型
    getStatusType(status) {
      const types = {
        identified: 'info',
        assessing: 'warning',
        mitigating: 'primary',
        monitoring: 'success',
        closed: ''
      };
      return types[status] || '';
    },

    // 获取状态标签
    getStatusLabel(status) {
      const labels = {
        identified: '已识别',
        assessing: '评估中',
        mitigating: '应对中',
        monitoring: '监控中',
        closed: '已关闭'
      };
      return labels[status] || status;
    },

    // 获取概率标签
    getProbabilityLabel(probability) {
      const labels = {
        very_low: '极低',
        low: '低',
        medium: '中',
        high: '高',
        very_high: '极高'
      };
      return labels[probability] || probability;
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '-';
      return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
.risk-detail-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.risk-detail {
  max-width: 1200px;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  border-bottom: 2px solid #409eff;
}

.detail-content {
  padding-left: 12px;
}

.detail-row {
  display: flex;
  margin-bottom: 16px;
  font-size: 14px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-row .label {
  min-width: 120px;
  color: #909399;
  flex-shrink: 0;
}

.detail-row .value {
  color: #606266;
  flex: 1;
  word-break: break-all;
}

.text-content {
  margin: 0;
  line-height: 1.8;
  color: #606266;
  white-space: pre-wrap;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
}

.attachment-item i {
  font-size: 16px;
  color: #409eff;
}

.attachment-item a {
  color: #409eff;
  text-decoration: none;
}

.attachment-item a:hover {
  text-decoration: underline;
}
</style>
