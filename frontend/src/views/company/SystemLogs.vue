<template>
  <div class="system-logs">
    <div class="page-header">
      <h2>系统日志</h2>
      <p class="subtitle">查看系统操作日志和审计记录</p>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="操作类型">
          <el-select
            v-model="searchForm.action"
            placeholder="请选择操作类型"
            clearable
            @clear="handleSearch"
          >
            <el-option label="登录" value="login" />
            <el-option label="登出" value="logout" />
            <el-option label="创建" value="create" />
            <el-option label="更新" value="update" />
            <el-option label="删除" value="delete" />
            <el-option label="查看" value="view" />
            <el-option label="导出" value="export" />
          </el-select>
        </el-form-item>
        <el-form-item label="模块">
          <el-select
            v-model="searchForm.module"
            placeholder="请选择模块"
            clearable
            @clear="handleSearch"
          >
            <el-option label="运单管理" value="waybill" />
            <el-option label="消息中心" value="message" />
            <el-option label="统计分析" value="statistics" />
            <el-option label="API管理" value="api" />
            <el-option label="用户管理" value="user" />
            <el-option label="系统配置" value="config" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入操作人"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="IP地址">
          <el-input
            v-model="searchForm.ip"
            placeholder="请输入IP地址"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="handleExport" :loading="exporting">导出日志</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 日志列表 -->
    <el-card class="table-card">
      <el-table
        :data="logList"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getActionType(row.action)">
              {{ getActionLabel(row.action) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="模块" width="120">
          <template #default="{ row }">
            {{ getModuleLabel(row.module) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="操作描述" min-width="200" />
        <el-table-column prop="username" label="操作人" width="120" />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="userAgent" label="用户代理" width="150" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              type="text"
              size="small"
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 日志详情对话框 -->
    <el-dialog
      title="日志详情"
      v-model="detailVisible"
      width="700px"
    >
      <div class="log-detail" v-if="currentLog">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="日志ID">
            {{ currentLog.id }}
          </el-descriptions-item>
          <el-descriptions-item label="操作类型">
            <el-tag :type="getActionType(currentLog.action)">
              {{ getActionLabel(currentLog.action) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="模块">
            {{ getModuleLabel(currentLog.module) }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentLog.status === 'success' ? 'success' : 'danger'">
              {{ currentLog.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作人" :span="2">
            {{ currentLog.username }} ({{ currentLog.userId }})
          </el-descriptions-item>
          <el-descriptions-item label="操作描述" :span="2">
            {{ currentLog.description }}
          </el-descriptions-item>
          <el-descriptions-item label="IP地址">
            {{ currentLog.ip }}
          </el-descriptions-item>
          <el-descriptions-item label="操作时间">
            {{ formatDate(currentLog.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="用户代理" :span="2">
            {{ currentLog.userAgent }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 请求参数 -->
        <div class="detail-section" v-if="currentLog.requestData">
          <h4>请求参数</h4>
          <pre class="json-content">{{ formatJson(currentLog.requestData) }}</pre>
        </div>

        <!-- 响应数据 -->
        <div class="detail-section" v-if="currentLog.responseData">
          <h4>响应数据</h4>
          <pre class="json-content">{{ formatJson(currentLog.responseData) }}</pre>
        </div>

        <!-- 错误信息 -->
        <div class="detail-section" v-if="currentLog.error">
          <h4>错误信息</h4>
          <el-alert
            :title="currentLog.error"
            type="error"
            :closable="false"
            show-icon
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getCompanyLogs, exportCompanyLogs } from '@/api/company'

export default {
  name: 'SystemLogs',
  data() {
    return {
      loading: false,
      exporting: false,
      companyId: null,
      searchForm: {
        action: '',
        module: '',
        username: '',
        ip: '',
        dateRange: null
      },
      logList: [],
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0
      },
      detailVisible: false,
      currentLog: null
    }
  },
  created() {
    this.companyId = this.$route.params.id || localStorage.getItem('companyId')
    this.loadLogs()
  },
  methods: {
    async loadLogs() {
      if (!this.companyId) {
        this.$message.error('企业ID不存在')
        return
      }

      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          ...this.searchForm
        }
        
        // 处理日期范围
        if (params.dateRange && params.dateRange.length === 2) {
          params.startTime = params.dateRange[0]
          params.endTime = params.dateRange[1]
          delete params.dateRange
        }

        const response = await getCompanyLogs(this.companyId, params)
        this.logList = response.data.logs || []
        this.pagination.total = response.data.total || 0
      } catch (error) {
        this.$message.error(error.message || '加载日志失败')
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.pagination.page = 1
      this.loadLogs()
    },
    handleReset() {
      this.searchForm = {
        action: '',
        module: '',
        username: '',
        ip: '',
        dateRange: null
      }
      this.handleSearch()
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.loadLogs()
    },
    handleCurrentChange(val) {
      this.pagination.page = val
      this.loadLogs()
    },
    handleViewDetail(row) {
      this.currentLog = row
      this.detailVisible = true
    },
    async handleExport() {
      this.exporting = true
      try {
        const params = { ...this.searchForm }
        
        // 处理日期范围
        if (params.dateRange && params.dateRange.length === 2) {
          params.startTime = params.dateRange[0]
          params.endTime = params.dateRange[1]
          delete params.dateRange
        }

        const response = await exportCompanyLogs(this.companyId, params)
        
        // 创建下载链接
        const blob = new Blob([response.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `logs_${Date.now()}.csv`
        link.click()
        window.URL.revokeObjectURL(url)
        
        this.$message.success('导出成功')
      } catch (error) {
        this.$message.error(error.message || '导出失败')
      } finally {
        this.exporting = false
      }
    },
    getActionType(action) {
      const types = {
        login: 'success',
        logout: 'info',
        create: 'primary',
        update: 'warning',
        delete: 'danger',
        view: 'info',
        export: 'warning'
      }
      return types[action] || 'info'
    },
    getActionLabel(action) {
      const labels = {
        login: '登录',
        logout: '登出',
        create: '创建',
        update: '更新',
        delete: '删除',
        view: '查看',
        export: '导出'
      }
      return labels[action] || action
    },
    getModuleLabel(module) {
      const labels = {
        waybill: '运单管理',
        message: '消息中心',
        statistics: '统计分析',
        api: 'API管理',
        user: '用户管理',
        config: '系统配置'
      }
      return labels[module] || module
    },
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleString('zh-CN')
    },
    formatJson(data) {
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch (e) {
          return data
        }
      }
      return JSON.stringify(data, null, 2)
    }
  }
}
</script>

<style scoped>
.system-logs {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.log-detail {
  max-height: 600px;
  overflow-y: auto;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.json-content {
  padding: 12px;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

:deep(.el-date-editor) {
  width: 360px;
}
</style>
