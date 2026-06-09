<template>
  <div class="api-test-container">
    <div class="page-header">
      <h1>API对接测试</h1>
      <p class="subtitle">测试API接口调用，验证对接是否正常</p>
    </div>

    <el-row :gutter="20">
      <!-- 左侧：测试配置 -->
      <el-col :span="12">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <span>测试配置</span>
            </div>
          </template>

          <el-form
            ref="testFormRef"
            :model="testForm"
            :rules="testRules"
            label-width="100px"
          >
            <el-form-item label="API Key" prop="apiKey">
              <el-input
                v-model="testForm.apiKey"
                placeholder="请输入API Key"
                clearable
              />
            </el-form-item>

            <el-form-item label="API Secret" prop="apiSecret">
              <el-input
                v-model="testForm.apiSecret"
                type="password"
                placeholder="请输入API Secret"
                show-password
                clearable
              />
            </el-form-item>

            <el-form-item label="接口端点" prop="endpoint">
              <el-select
                v-model="testForm.endpoint"
                placeholder="请选择接口端点"
                style="width: 100%"
                @change="handleEndpointChange"
              >
                <el-option
                  v-for="endpoint in endpoints"
                  :key="endpoint.path"
                  :label="endpoint.label"
                  :value="endpoint.path"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="请求方法" prop="method">
              <el-radio-group v-model="testForm.method">
                <el-radio label="GET">GET</el-radio>
                <el-radio label="POST">POST</el-radio>
                <el-radio label="PUT">PUT</el-radio>
                <el-radio label="DELETE">DELETE</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="请求参数">
              <el-input
                v-model="testForm.params"
                type="textarea"
                :rows="6"
                placeholder='请输入JSON格式的参数，例如：{"page": 1, "limit": 10}'
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="testing"
                @click="handleTest"
                style="width: 100%"
              >
                <el-icon><Connection /></el-icon>
                开始测试
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：测试结果 -->
      <el-col :span="12">
        <el-card class="result-card">
          <template #header>
            <div class="card-header">
              <span>测试结果</span>
              <el-button
                v-if="testResult"
                type="primary"
                size="small"
                text
                @click="copyResult"
              >
                复制结果
              </el-button>
            </div>
          </template>

          <div v-if="!testResult" class="empty-result">
            <el-empty description="暂无测试结果" />
          </div>

          <div v-else class="result-content">
            <!-- 测试状态 -->
            <div class="result-status">
              <el-alert
                :title="testResult.success ? '测试成功' : '测试失败'"
                :type="testResult.success ? 'success' : 'error'"
                :closable="false"
                show-icon
              />
            </div>

            <!-- 请求信息 -->
            <div class="result-section">
              <h3>请求信息</h3>
              <el-descriptions :column="1" border size="small">
                <el-descriptions-item label="端点">
                  {{ testResult.endpoint }}
                </el-descriptions-item>
                <el-descriptions-item label="方法">
                  <el-tag :type="getMethodType(testResult.method)">
                    {{ testResult.method }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="时间">
                  {{ formatTimestamp(testResult.timestamp) }}
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 响应数据 -->
            <div class="result-section">
              <h3>响应数据</h3>
              <div class="response-data">
                <pre><code>{{ formatJson(testResult.response) }}</code></pre>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 测试历史 -->
        <el-card v-if="testHistory.length > 0" class="history-card">
          <template #header>
            <div class="card-header">
              <span>测试历史</span>
              <el-button
                type="danger"
                size="small"
                text
                @click="clearHistory"
              >
                清空历史
              </el-button>
            </div>
          </template>

          <el-timeline>
            <el-timeline-item
              v-for="(item, index) in testHistory"
              :key="index"
              :timestamp="formatTimestamp(item.timestamp)"
              :type="item.success ? 'success' : 'danger'"
            >
              <div class="history-item">
                <el-tag :type="getMethodType(item.method)" size="small">
                  {{ item.method }}
                </el-tag>
                <span class="history-endpoint">{{ item.endpoint }}</span>
                <el-button
                  type="primary"
                  size="small"
                  text
                  @click="loadHistoryItem(item)"
                >
                  查看
                </el-button>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { Connection } from '@element-plus/icons-vue';
import { testApi } from '@/api/api';

const testing = ref(false);
const testFormRef = ref(null);
const testResult = ref(null);
const testHistory = ref([]);

const testForm = reactive({
  apiKey: '',
  apiSecret: '',
  endpoint: '',
  method: 'GET',
  params: ''
});

const testRules = {
  apiKey: [
    { required: true, message: '请输入API Key', trigger: 'blur' }
  ],
  apiSecret: [
    { required: true, message: '请输入API Secret', trigger: 'blur' }
  ],
  endpoint: [
    { required: true, message: '请选择接口端点', trigger: 'change' }
  ],
  method: [
    { required: true, message: '请选择请求方法', trigger: 'change' }
  ]
};

// 可用的端点列表
const endpoints = [
  {
    path: '/api/v1/company/info',
    label: '获取企业信息',
    method: 'GET'
  },
  {
    path: '/api/v1/company/info',
    label: '更新企业信息',
    method: 'PUT'
  },
  {
    path: '/api/v1/qualifications',
    label: '获取资质列表',
    method: 'GET'
  },
  {
    path: '/api/v1/qualifications',
    label: '添加资质',
    method: 'POST'
  },
  {
    path: '/api/v1/statistics',
    label: '获取数据统计',
    method: 'GET'
  }
];

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

// 格式化时间戳
const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN');
};

// 格式化JSON
const formatJson = (data) => {
  return JSON.stringify(data, null, 2);
};

// 端点变化处理
const handleEndpointChange = (path) => {
  const endpoint = endpoints.find(e => e.path === path);
  if (endpoint) {
    testForm.method = endpoint.method;
  }
};

// 执行测试
const handleTest = async () => {
  try {
    await testFormRef.value.validate();

    // 验证参数格式
    let params = null;
    if (testForm.params.trim()) {
      try {
        params = JSON.parse(testForm.params);
      } catch (error) {
        ElMessage.error('请求参数格式错误，请输入有效的JSON');
        return;
      }
    }

    testing.value = true;
    const response = await testApi({
      apiKey: testForm.apiKey,
      apiSecret: testForm.apiSecret,
      endpoint: testForm.endpoint,
      method: testForm.method,
      params
    });

    if (response.code === 200) {
      testResult.value = response.data;
      
      // 添加到历史记录
      testHistory.value.unshift({
        ...response.data,
        params
      });
      
      // 限制历史记录数量
      if (testHistory.value.length > 10) {
        testHistory.value = testHistory.value.slice(0, 10);
      }

      if (response.data.success) {
        ElMessage.success('测试成功');
      } else {
        ElMessage.warning('测试完成，但接口返回失败');
      }
    } else {
      ElMessage.error(response.message || '测试失败');
    }
  } catch (error) {
    if (error !== false) {
      console.error('测试失败:', error);
      ElMessage.error('测试失败');
    }
  } finally {
    testing.value = false;
  }
};

// 复制结果
const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(formatJson(testResult.value));
    ElMessage.success('已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};

// 清空历史
const clearHistory = () => {
  testHistory.value = [];
  ElMessage.success('已清空历史记录');
};

// 加载历史项
const loadHistoryItem = (item) => {
  testResult.value = item;
};
</script>

<style scoped>
.api-test-container {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-card,
.result-card,
.history-card {
  margin-bottom: 20px;
}

.empty-result {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-status {
  margin-bottom: 10px;
}

.result-section h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #303133;
  font-weight: 600;
}

.response-data {
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  overflow-x: auto;
}

.response-data pre {
  margin: 0;
}

.response-data code {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  color: #303133;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.history-endpoint {
  flex: 1;
  color: #606266;
  font-size: 14px;
}
</style>
