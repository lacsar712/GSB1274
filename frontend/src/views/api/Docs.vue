<template>
  <div class="api-docs-container">
    <div class="page-header">
      <h1>API文档</h1>
      <p class="subtitle">查看系统提供的API接口文档</p>
    </div>

    <el-card v-loading="loading" class="docs-card">
      <template v-if="apiDocs">
        <!-- API基本信息 -->
        <div class="docs-section">
          <h2>基本信息</h2>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="版本">{{ apiDocs.version }}</el-descriptions-item>
            <el-descriptions-item label="基础URL">{{ apiDocs.baseUrl }}</el-descriptions-item>
            <el-descriptions-item label="认证方式" :span="2">
              {{ apiDocs.authentication.type }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 认证说明 -->
        <div class="docs-section">
          <h2>认证说明</h2>
          <el-alert
            :title="apiDocs.authentication.description"
            type="info"
            :closable="false"
            show-icon
          />
          <div class="auth-headers">
            <h3>请求头参数</h3>
            <el-table :data="authHeadersData" border>
              <el-table-column prop="key" label="参数名" width="200" />
              <el-table-column prop="value" label="说明" />
            </el-table>
          </div>
        </div>

        <!-- API端点列表 -->
        <div class="docs-section">
          <h2>API端点</h2>
          <el-collapse v-model="activeCategories" accordion>
            <el-collapse-item
              v-for="(category, index) in apiDocs.endpoints"
              :key="index"
              :name="index"
            >
              <template #title>
                <h3 class="category-title">{{ category.category }}</h3>
              </template>
              
              <div v-for="(api, apiIndex) in category.apis" :key="apiIndex" class="api-item">
                <div class="api-header">
                  <el-tag :type="getMethodType(api.method)" size="large">
                    {{ api.method }}
                  </el-tag>
                  <code class="api-path">{{ api.path }}</code>
                </div>
                
                <div class="api-description">{{ api.description }}</div>
                
                <!-- 请求参数 -->
                <div v-if="api.parameters && api.parameters.length > 0" class="api-params">
                  <h4>请求参数</h4>
                  <el-table :data="api.parameters" border size="small">
                    <el-table-column prop="name" label="参数名" width="150" />
                    <el-table-column prop="type" label="类型" width="100" />
                    <el-table-column label="必填" width="80">
                      <template #default="{ row }">
                        <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                          {{ row.required ? '是' : '否' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="description" label="说明" />
                  </el-table>
                </div>
                
                <!-- 响应示例 -->
                <div class="api-response">
                  <h4>响应示例</h4>
                  <pre><code>{{ JSON.stringify(api.response, null, 2) }}</code></pre>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>

        <!-- 错误码说明 -->
        <div class="docs-section">
          <h2>错误码说明</h2>
          <el-table :data="apiDocs.errorCodes" border>
            <el-table-column prop="code" label="错误码" width="120" />
            <el-table-column prop="message" label="说明" />
          </el-table>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getApiDocs } from '@/api/api';

const loading = ref(false);
const apiDocs = ref(null);
const activeCategories = ref(0);

// 认证头部数据
const authHeadersData = computed(() => {
  if (!apiDocs.value) return [];
  return Object.entries(apiDocs.value.authentication.headers).map(([key, value]) => ({
    key,
    value
  }));
});

// 获取请求方法类型
const getMethodType = (method) => {
  const types = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    DELETE: 'danger'
  };
  return types[method] || 'info';
};

// 加载API文档
const loadApiDocs = async () => {
  loading.value = true;
  try {
    const response = await getApiDocs();
    if (response.code === 200) {
      apiDocs.value = response.data;
    } else {
      ElMessage.error(response.message || '获取API文档失败');
    }
  } catch (error) {
    console.error('获取API文档失败:', error);
    ElMessage.error('获取API文档失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadApiDocs();
});
</script>

<style scoped>
.api-docs-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
  color: #303133;
}

.subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.docs-card {
  margin-bottom: 20px;
}

.docs-section {
  margin-bottom: 40px;
}

.docs-section:last-child {
  margin-bottom: 0;
}

.docs-section h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #303133;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

.auth-headers {
  margin-top: 20px;
}

.auth-headers h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #606266;
}

.category-title {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.api-item {
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  margin-bottom: 20px;
  background-color: #fafafa;
}

.api-item:last-child {
  margin-bottom: 0;
}

.api-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.api-path {
  font-size: 16px;
  font-weight: 500;
  color: #409eff;
  background-color: #ecf5ff;
  padding: 5px 10px;
  border-radius: 4px;
}

.api-description {
  margin-bottom: 20px;
  color: #606266;
  font-size: 14px;
}

.api-params,
.api-response {
  margin-top: 20px;
}

.api-params h4,
.api-response h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #606266;
  font-weight: 600;
}

.api-response pre {
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  overflow-x: auto;
  margin: 0;
}

.api-response code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  color: #303133;
}
</style>
