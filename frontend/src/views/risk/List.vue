<template>
  <div class="risk-list-container">
    <div class="page-header">
      <h2>风险库</h2>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索风险标题、描述或责任人"
          prefix-icon="el-icon-search"
          clearable
          style="width: 300px; margin-right: 10px"
          @input="handleSearch"
        />
        <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
          创建风险
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="分类">
          <el-select
            v-model="filterForm.category"
            placeholder="全部分类"
            clearable
            style="width: 150px"
            @change="handleFilter"
          >
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序字段">
          <el-select
            v-model="filterForm.sortBy"
            placeholder="选择排序字段"
            style="width: 160px"
            @change="handleFilter"
          >
            <el-option label="更新时间" value="updatedAt" />
            <el-option label="创建时间" value="createdAt" />
            <el-option label="标题" value="title" />
            <el-option label="等级" value="level" />
            <el-option label="截止日期" value="dueDate" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序方向">
          <el-select
            v-model="filterForm.sortOrder"
            placeholder="方向"
            style="width: 120px"
            @change="handleFilter"
          >
            <el-option label="升序" value="asc" />
            <el-option label="降序" value="desc" />
          </el-select>
        </el-form-item>
        <el-form-item label="风险等级">
          <el-select
            v-model="filterForm.level"
            placeholder="全部等级"
            clearable
            style="width: 120px"
            @change="handleFilter"
          >
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
            <el-option label="严重" value="critical" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部状态"
            clearable
            style="width: 120px"
            @change="handleFilter"
          >
            <el-option label="已识别" value="identified" />
            <el-option label="评估中" value="assessing" />
            <el-option label="应对中" value="mitigating" />
            <el-option label="监控中" value="monitoring" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleFilter">
            查询
          </el-button>
          <el-button icon="el-icon-refresh" @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 时间线展示 -->
    <el-card v-loading="loading" class="timeline-card">
      <el-empty v-if="risks.length === 0" description="暂无风险数据" />
      <el-timeline v-else>
        <el-timeline-item
          v-for="risk in risks"
          :key="risk.id"
          :timestamp="formatDate(risk.identifiedDate)"
          placement="top"
          :color="getLevelColor(risk.level)"
        >
          <el-card class="risk-item" shadow="hover">
            <div class="risk-header">
              <div class="risk-title-section">
                <h3 class="risk-title">{{ risk.title }}</h3>
                <div class="risk-badges">
                  <el-tag
                    :type="getLevelType(risk.level)"
                    size="small"
                  >
                    {{ getLevelLabel(risk.level) }}
                  </el-tag>
                  <el-tag
                    :type="getStatusType(risk.status)"
                    size="small"
                  >
                    {{ getStatusLabel(risk.status) }}
                  </el-tag>
                  <el-tag
                    v-if="risk.category"
                    type="info"
                    size="small"
                  >
                    {{ risk.category }}
                  </el-tag>
                </div>
              </div>
              <div class="risk-actions">
                <el-button
                  type="text"
                  icon="el-icon-view"
                  @click="handleView(risk)"
                >
                  查看
                </el-button>
                <el-button
                  type="text"
                  icon="el-icon-edit"
                  @click="handleEdit(risk)"
                >
                  编辑
                </el-button>
                <el-button
                  type="text"
                  icon="el-icon-delete"
                  style="color: #f56c6c"
                  @click="handleDelete(risk)"
                >
                  删除
                </el-button>
              </div>
            </div>

            <div v-if="risk.description" class="risk-description">
              {{ risk.description }}
            </div>

            <div class="risk-info">
              <div v-if="risk.owner" class="info-item">
                <i class="el-icon-user"></i>
                <span>责任人：{{ risk.owner }}</span>
              </div>
              <div v-if="risk.probability" class="info-item">
                <i class="el-icon-data-analysis"></i>
                <span>发生概率：{{ getProbabilityLabel(risk.probability) }}</span>
              </div>
              <div v-if="risk.dueDate" class="info-item">
                <i class="el-icon-time"></i>
                <span>截止日期：{{ formatDate(risk.dueDate) }}</span>
              </div>
              <div v-if="risk.relatedProject" class="info-item">
                <i class="el-icon-folder"></i>
                <span>关联项目：{{ risk.relatedProject }}</span>
              </div>
            </div>

            <div v-if="risk.tags && risk.tags.length > 0" class="risk-tags">
              <el-tag
                v-for="(tag, index) in risk.tags"
                :key="index"
                size="mini"
                style="margin-right: 5px"
              >
                {{ tag }}
              </el-tag>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination-container">
      <el-pagination
        :current-page="pagination.page"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script>
import { getRisks, deleteRisk, getRiskCategories } from '@/api/risk';

export default {
  name: 'RiskList',
  data() {
    return {
      risks: [],
      categories: [],
      loading: false,
      searchKeyword: '',
      filterForm: {
        category: '',
        level: '',
        status: '',
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      },
      pagination: {
        page: 1,
        pageSize: 20
      },
      total: 0
    };
  },
  mounted() {
    this.loadCategories();
    this.loadRisks();
  },
  methods: {
    // 加载风险分类
    async loadCategories() {
      try {
        const response = await getRiskCategories();
        if (response.code === 200) {
          this.categories = response.data;
        }
      } catch (error) {
        console.error('加载分类失败:', error);
      }
    },

    // 加载风险列表
    async loadRisks() {
      this.loading = true;
      try {
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          keyword: this.searchKeyword,
          ...this.filterForm
        };

        const response = await getRisks(params);
        if (response.code === 200) {
          this.risks = response.data.risks;
          this.total = response.data.total;
        }
      } catch (error) {
        this.$message.error('加载风险列表失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1;
      this.loadRisks();
    },

    // 筛选
    handleFilter() {
      this.pagination.page = 1;
      this.loadRisks();
    },

    // 重置
    handleReset() {
      this.searchKeyword = '';
      this.filterForm = {
        category: '',
        level: '',
          status: '',
          sortBy: 'updatedAt',
          sortOrder: 'desc'
      };
      this.pagination.page = 1;
      this.loadRisks();
    },

    // 创建风险
    handleCreate() {
      this.$router.push('/risks/create');
    },

    // 查看风险
    handleView(risk) {
      this.$router.push(`/risks/${risk.id}`);
    },

    // 编辑风险
    handleEdit(risk) {
      this.$router.push(`/risks/edit/${risk.id}`);
    },

    // 删除风险
    handleDelete(risk) {
      this.$confirm(`确定要删除风险"${risk.title}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await deleteRisk(risk.id);
          if (response.code === 200) {
            this.$message.success('删除成功');
            this.loadRisks();
          }
        } catch (error) {
          this.$message.error('删除失败');
          console.error(error);
        }
      }).catch(() => {});
    },

    // 分页大小改变
    handleSizeChange(size) {
      this.pagination.pageSize = size;
      this.pagination.page = 1;
      this.loadRisks();
    },

    // 页码改变
    handlePageChange(page) {
      this.pagination.page = page;
      this.loadRisks();
    },

    // 获取等级颜色
    getLevelColor(level) {
      const colors = {
        low: '#67c23a',
        medium: '#e6a23c',
        high: '#f56c6c',
        critical: '#909399'
      };
      return colors[level] || '#409eff';
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
.risk-list-container {
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
  align-items: center;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 0;
}

.timeline-card {
  min-height: 400px;
  margin-bottom: 20px;
}

.risk-item {
  margin-bottom: 0;
}

.risk-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.risk-title-section {
  flex: 1;
}

.risk-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.risk-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.risk-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.risk-description {
  margin-bottom: 12px;
  color: #606266;
  line-height: 1.6;
}

.risk-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #909399;
}

.info-item i {
  font-size: 16px;
}

.risk-tags {
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
