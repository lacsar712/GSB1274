<template>
  <div class="message-settings-container">
    <div v-loading="loading" class="settings-content">
      <!-- 头部 -->
      <div class="header">
        <h2>消息设置</h2>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回消息列表
        </el-button>
      </div>

      <!-- 设置表单 -->
      <el-card class="settings-card" shadow="never">
        <el-form 
          ref="formRef"
          :model="settings" 
          label-width="150px"
          label-position="left"
        >
          <!-- 通知方式 -->
          <el-divider content-position="left">
            <h3>通知方式</h3>
          </el-divider>

          <el-form-item label="邮件通知">
            <el-switch 
              v-model="settings.emailNotification"
              active-text="开启"
              inactive-text="关闭"
            />
            <div class="form-item-tip">
              开启后，重要消息将通过邮件发送通知
            </div>
          </el-form-item>

          <el-form-item label="短信通知">
            <el-switch 
              v-model="settings.smsNotification"
              active-text="开启"
              inactive-text="关闭"
            />
            <div class="form-item-tip">
              开启后，紧急消息将通过短信发送通知
            </div>
          </el-form-item>

          <!-- 消息类型订阅 -->
          <el-divider content-position="left">
            <h3>消息类型订阅</h3>
          </el-divider>

          <el-form-item label="系统消息">
            <el-switch 
              v-model="settings.notificationTypes.system"
              active-text="订阅"
              inactive-text="取消订阅"
            />
            <div class="form-item-tip">
              系统维护、更新等通知
            </div>
          </el-form-item>

          <el-form-item label="审核消息">
            <el-switch 
              v-model="settings.notificationTypes.audit"
              active-text="订阅"
              inactive-text="取消订阅"
            />
            <div class="form-item-tip">
              企业资料审核结果通知
            </div>
          </el-form-item>

          <el-form-item label="运单消息">
            <el-switch 
              v-model="settings.notificationTypes.waybill"
              active-text="订阅"
              inactive-text="取消订阅"
            />
            <div class="form-item-tip">
              运单状态变更、完成等通知
            </div>
          </el-form-item>

          <el-form-item label="支付消息">
            <el-switch 
              v-model="settings.notificationTypes.payment"
              active-text="订阅"
              inactive-text="取消订阅"
            />
            <div class="form-item-tip">
              支付成功、退款等通知
            </div>
          </el-form-item>

          <el-form-item label="通知消息">
            <el-switch 
              v-model="settings.notificationTypes.notification"
              active-text="订阅"
              inactive-text="取消订阅"
            />
            <div class="form-item-tip">
              一般性通知和公告
            </div>
          </el-form-item>

          <!-- 免打扰时段 -->
          <el-divider content-position="left">
            <h3>免打扰时段</h3>
          </el-divider>

          <el-form-item label="启用免打扰">
            <el-switch 
              v-model="settings.quietHours.enabled"
              active-text="开启"
              inactive-text="关闭"
            />
            <div class="form-item-tip">
              在免打扰时段内，不会发送推送通知（紧急消息除外）
            </div>
          </el-form-item>

          <el-form-item 
            v-if="settings.quietHours.enabled" 
            label="开始时间"
          >
            <el-time-select
              v-model="settings.quietHours.start"
              start="00:00"
              step="00:30"
              end="23:30"
              placeholder="选择开始时间"
            />
          </el-form-item>

          <el-form-item 
            v-if="settings.quietHours.enabled" 
            label="结束时间"
          >
            <el-time-select
              v-model="settings.quietHours.end"
              start="00:00"
              step="00:30"
              end="23:30"
              placeholder="选择结束时间"
            />
          </el-form-item>

          <!-- 操作按钮 -->
          <el-form-item>
            <el-button 
              type="primary" 
              size="large"
              :loading="saving"
              @click="handleSave"
            >
              保存设置
            </el-button>
            <el-button 
              size="large"
              @click="handleReset"
            >
              重置为默认
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 说明信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <el-icon><InfoFilled /></el-icon>
            <span>设置说明</span>
          </div>
        </template>
        <ul class="info-list">
          <li>消息设置仅影响通知推送方式，不影响消息中心的消息接收</li>
          <li>紧急消息（如审核结果）将忽略免打扰设置</li>
          <li>取消订阅某类消息后，该类消息仍会在消息中心显示，但不会主动推送</li>
          <li>邮件和短信通知需要先在账户设置中配置联系方式</li>
          <li>设置修改后立即生效</li>
        </ul>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, InfoFilled } from '@element-plus/icons-vue';
import { getMessageSettings, updateMessageSettings } from '@/api/message';

const router = useRouter();
const route = useRoute();

const companyId = ref(route.params.id);
const loading = ref(false);
const saving = ref(false);
const formRef = ref(null);

// 默认设置
const defaultSettings = {
  emailNotification: true,
  smsNotification: false,
  notificationTypes: {
    system: true,
    audit: true,
    waybill: true,
    payment: true,
    notification: true
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  }
};

const settings = reactive({ ...defaultSettings });

// 加载设置
const loadSettings = async () => {
  loading.value = true;
  try {
    const response = await getMessageSettings(companyId.value);
    if (response.success) {
      Object.assign(settings, response.data);
    }
  } catch (error) {
    ElMessage.error('加载设置失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// 保存设置
const handleSave = async () => {
  // 验证免打扰时间
  if (settings.quietHours.enabled) {
    if (!settings.quietHours.start || !settings.quietHours.end) {
      ElMessage.warning('请设置完整的免打扰时段');
      return;
    }
  }

  saving.value = true;
  try {
    const response = await updateMessageSettings(companyId.value, settings);
    if (response.success) {
      ElMessage.success('设置已保存');
    }
  } catch (error) {
    ElMessage.error('保存失败: ' + error.message);
  } finally {
    saving.value = false;
  }
};

// 重置为默认
const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置为默认设置吗？',
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    Object.assign(settings, defaultSettings);
    await handleSave();
  } catch (error) {
    // 用户取消
  }
};

// 返回列表
const goBack = () => {
  router.push(`/companies/${companyId.value}/messages`);
};

onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
.message-settings-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.settings-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.settings-card :deep(.el-card__body) {
  padding: 30px;
}

.el-divider h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  font-weight: 600;
}

.form-item-tip {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}

.el-form-item {
  margin-bottom: 25px;
}

.info-card {
  border-radius: 8px;
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #409EFF;
}

.info-list {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  line-height: 2;
}

.info-list li {
  margin-bottom: 8px;
}

:deep(.el-switch) {
  --el-switch-on-color: #409EFF;
}

:deep(.el-time-select) {
  width: 200px;
}
</style>
