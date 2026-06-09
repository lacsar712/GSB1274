<template>
  <div class="indicator-list-container">
    <div class="page-header">
      <h2>指标库</h2>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索指标名称、编码或描述"
          prefix-icon="el-icon-search"
          clearable
          style="width: 300px; margin-right: 10px"
          @input="handleSearch"
        />
        <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
          创建指标
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
            <el-option label="名称" value="name" />
            <el-option label="编码" value="code" />
            <el-option label="目标值" value="targetValue" />
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
        <el-form-item label="状态">
          <el-select
            v-model="filterForm.status"
            placeholder="全部状态"
            clearable
            style="width: 120px"
            @change="handleFilter"
          >
            <el-option label="启用" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="统计频率">
          <el-select
            v-model="filterForm.frequency"
            placeholder="全部频率"
            clearable
            style="width: 120px"
            @change="handleFilter"
          >
            <el-option label="每日" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
            <el-option label="每季度" value="quarterly" />
            <el-option label="每年" value="yearly" />
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

    <!-- 指标卡片列表 -->
    <div v-loading="loading" class="indicator-cards">
      <el-empty v-if="indicators.length === 0" description="暂无指标数据" />
      <div v-else class="cards-grid">
        <el-card
          v-for="indicator in indicators"
          :key="indicator.id"
          class="indicator-card"
          shadow="hover"
        >
          <div class="card-header">
            <div class="card-title">
              <h3>{{ indicator.name }}</h3>
              <el-tag
                :type="indicator.status === 'active' ? 'success' : 'info'"
                size="small"
              >
                {{ indicator.status === 'active' ? '启用' : '停用' }}
              </el-tag>
            </div>
            <div class="card-actions">
              <el-button
                type="text"
                icon="el-icon-edit"
                @click="handleEdit(indicator)"
              >
                编辑
              </el-button>
              <el-button
                type="text"
                icon="el-icon-delete"
                style="color: #f56c6c"
                @click="handleDelete(indicator)"
              >
                删除
              </el-button>
            </div>
          </div>

          <div class="card-content">
            <div class="info-row">
              <span class="label">指标编码：</span>
              <span class="value">{{ indicator.code }}</span>
            </div>
            <div v-if="indicator.category" class="info-row">
              <span class="label">分类：</span>
              <el-tag size="small" type="primary">{{ indicator.category }}</el-tag>
            </div>
            <div v-if="indicator.unit" class="info-row">
              <span class="label">单位：</span>
              <span class="value">{{ indicator.unit }}</span>
            </div>
            <div v-if="indicator.frequency" class="info-row">
              <span class="label">统计频率：</span>
              <span class="value">{{ getFrequencyLabel(indicator.frequency) }}</span>
            </div>
            <div v-if="indicator.targetValue" class="info-row">
              <span class="label">目标值：</span>
              <span class="value highlight">{{ indicator.targetValue }}</span>
            </div>
            <div v-if="indicator.description" class="info-row description">
              <span class="label">描述：</span>
              <span class="value">{{ indicator.description }}</span>
            </div>
            <div v-if="indicator.dataSource" class="info-row">
              <span class="label">数据来源：</span>
              <span class="value">{{ indicator.dataSource }}</span>
            </div>
          </div>

          <div class="card-footer">
            <span class="time">创建时间：{{ formatDate(indicator.createdAt) }}</span>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="pagination-container">
      <el-pagination
        :current-page="pagination.page"
        :page-sizes="[12, 24, 48, 96]"
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
import { getIndicators, deleteIndicator, getIndicatorCategories } from '@/api/indicator';

export default {
  name: 'IndicatorList',
  data() {
    return {
      indicators: [],
      categories: [],
      loading: false,
      searchKeyword: '',
      filterForm: {
        category: '',
        status: '',
        frequency: '',
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      },
      pagination: {
        page: 1,
        pageSize: 12
      },
      total: 0
    };
  },
  mounted() {
    this.loadCategories();
    this.loadIndicators();
  },
  methods: {
    // 加载指标分类
    async loadCategories() {
      try {
        const response = await getIndicatorCategories();
        if (response.code === 200) {
          this.categories = response.data;
        }
      } catch (error) {
        console.error('加载分类失败:', error);
      }
    },

    // 加载指标列表
    async loadIndicators() {
      this.loading = true;
      try {
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          keyword: this.searchKeyword,
          ...this.filterForm
        };

        const response = await getIndicators(params);
        if (response.code === 200) {
          this.indicators = response.data.indicators;
          this.total = response.data.total;
        }
      } catch (error) {
        this.$message.error('加载指标列表失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    // 搜索
    handleSearch() {
      this.pagination.page = 1;
      this.loadIndicators();
    },

    // 筛选
    handleFilter() {
      this.pagination.page = 1;
      this.loadIndicators();
    },

    // 重置
    handleReset() {
      this.searchKeyword = '';
      this.filterForm = {
        category: '',
        status: '',
          frequency: '',
          sortBy: 'updatedAt',
          sortOrder: 'desc'
      };
      this.pagination.page = 1;
      this.loadIndicators();
    },

    // 创建指标
    handleCreate() {
      this.$router.push('/indicators/create');
    },

    // 编辑指标
    handleEdit(indicator) {
      this.$router.push(`/indicators/edit/${indicator.id}`);
    },

    // 删除指标
    handleDelete(indicator) {
      this.$confirm(`确定要删除指标"${indicator.name}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await deleteIndicator(indicator.id);
          if (response.code === 200) {
            this.$message.success('删除成功');
            this.loadIndicators();
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
      this.loadIndicators();
    },

    // 页码改变
    handlePageChange(page) {
      this.pagination.page = page;
      this.loadIndicators();
    },

    // 获取频率标签
    getFrequencyLabel(frequency) {
      const labels = {
        daily: '每日',
        weekly: '每周',
        monthly: '每月',
        quarterly: '每季度',
        yearly: '每年'
      };
      return labels[frequency] || frequency;
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
.indicator-list-container {
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

.indicator-cards {
  min-height: 400px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.indicator-card {
  transition: all 0.3s;
}

.indicator-card:hover {
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.card-title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-title h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-content {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  font-size: 14px;
}

.info-row .label {
  color: #909399;
  min-width: 80px;
  flex-shrink: 0;
}

.info-row .value {
  color: #606266;
  flex: 1;
  word-break: break-all;
}

.info-row .value.highlight {
  color: #409eff;
  font-weight: 600;
  font-size: 16px;
}

.info-row.description {
  flex-direction: column;
}

.info-row.description .value {
  margin-top: 4px;
  line-height: 1.6;
}

.card-footer {
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.card-footer .time {
  font-size: 12px;
  color: #909399;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
