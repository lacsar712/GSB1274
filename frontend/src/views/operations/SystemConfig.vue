<template>
  <div class="system-config">
    <div class="page-header">
      <h2>系统配置管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="saveAllConfigs">保存所有配置</el-button>
      </div>
    </div>

    <el-card v-loading="loading" shadow="never">
      <el-tabs v-model="activeCategory" type="border-card">
        <el-tab-pane
          v-for="(configs, category) in configsByCategory"
          :key="category"
          :label="getCategoryName(category)"
          :name="category"
        >
          <el-form :model="formData" label-width="200px" class="config-form">
            <el-form-item
              v-for="config in configs"
              :key="config.id"
              :label="config.description || config.config_key"
            >
              <template v-if="config.config_type === 'boolean'">
                <el-switch
                  v-model="formData[config.config_key]"
                  :active-value="true"
                  :inactive-value="false"
                />
              </template>
              <template v-else-if="config.config_type === 'number'">
                <el-input-number
                  v-model="formData[config.config_key]"
                  :min="0"
                  style="width: 200px;"
                />
              </template>
              <template v-else-if="config.config_type === 'select'">
                <el-select
                  v-model="formData[config.config_key]"
                  style="width: 200px;"
                >
                  <el-option
                    v-for="option in getSelectOptions(config.config_key)"
                    :key="option.value"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </template>
              <template v-else-if="config.config_type === 'textarea'">
                <el-input
                  v-model="formData[config.config_key]"
                  type="textarea"
                  :rows="4"
                  style="width: 400px;"
                />
              </template>
              <template v-else>
                <el-input
                  v-model="formData[config.config_key]"
                  style="width: 400px;"
                />
              </template>
              <div class="config-meta">
                <el-tag v-if="!config.is_public" type="warning" size="small">
                  私有配置
                </el-tag>
                <span class="config-key">{{ config.config_key }}</span>
                <span class="config-updated">
                  更新时间: {{ formatDate(config.updated_at) }}
                </span>
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getSystemConfig, updateSystemConfig } from '@/api/operations';

const loading = ref(false);
const activeCategory = ref('');
const configsByCategory = ref({});
const formData = reactive({});
const originalConfigs = ref([]);

const fetchSystemConfig = async () => {
  loading.value = true;
  try {
    const response = await getSystemConfig();
    if (response.success) {
      originalConfigs.value = response.data.configs;
      configsByCategory.value = response.data.byCategory;
      
      // 设置默认激活的分类
      const categories = Object.keys(configsByCategory.value);
      if (categories.length > 0) {
        activeCategory.value = categories[0];
      }
      
      // 初始化表单数据
      response.data.configs.forEach(config => {
        let value = config.config_value;
        // 根据类型转换值
        if (config.config_type === 'boolean') {
          value = value === 'true' || value === true;
        } else if (config.config_type === 'number') {
          value = Number(value);
        }
        formData[config.config_key] = value;
      });
    }
  } catch (error) {
    ElMessage.error('获取系统配置失败');
  } finally {
    loading.value = false;
  }
};

const saveAllConfigs = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要保存所有配置更改吗？',
      '确认保存',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    // 构建更新数据
    const configs = originalConfigs.value.map(config => ({
      key: config.config_key,
      value: String(formData[config.config_key])
    }));

    const response = await updateSystemConfig({ configs });
    if (response.success) {
      ElMessage.success('配置保存成功');
      fetchSystemConfig();
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('保存配置失败');
    }
  }
};

const getCategoryName = (category) => {
  const nameMap = {
    system: '系统设置',
    database: '数据库配置',
    security: '安全设置',
    notification: '通知配置',
    performance: '性能优化',
    feature: '功能开关',
    integration: '第三方集成'
  };
  return nameMap[category] || category;
};

const getSelectOptions = (configKey) => {
  // 根据配置项返回选项
  const optionsMap = {
    log_level: [
      { label: '调试', value: 'debug' },
      { label: '信息', value: 'info' },
      { label: '警告', value: 'warning' },
      { label: '错误', value: 'error' }
    ],
    theme: [
      { label: '浅色', value: 'light' },
      { label: '深色', value: 'dark' },
      { label: '自动', value: 'auto' }
    ]
  };
  return optionsMap[configKey] || [];
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
};

onMounted(() => {
  fetchSystemConfig();
});
</script>

<style scoped>
.system-config {
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
  font-weight: 600;
}

.config-form {
  padding: 20px 0;
}

.config-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.config-key {
  font-family: 'Courier New', monospace;
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
}

.config-updated {
  margin-left: auto;
}
</style>
