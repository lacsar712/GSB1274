<template>
  <div class="system-config">
    <div class="page-header">
      <h2>系统配置</h2>
      <p class="subtitle">配置企业系统参数和功能设置</p>
    </div>

    <el-card class="config-card" v-loading="loading">
      <el-form
        ref="configForm"
        :model="configData"
        :rules="rules"
        label-width="150px"
        label-position="left"
      >
        <!-- 基础配置 -->
        <div class="config-section">
          <h3 class="section-title">基础配置</h3>
          <el-form-item label="企业名称" prop="companyName">
            <el-input
              v-model="configData.companyName"
              placeholder="请输入企业名称"
              :disabled="true"
            />
          </el-form-item>

          <el-form-item label="系统语言" prop="language">
            <el-select v-model="configData.language" placeholder="请选择系统语言">
              <el-option label="简体中文" value="zh-CN" />
              <el-option label="English" value="en-US" />
            </el-select>
          </el-form-item>

          <el-form-item label="时区设置" prop="timezone">
            <el-select v-model="configData.timezone" placeholder="请选择时区">
              <el-option label="北京时间 (UTC+8)" value="Asia/Shanghai" />
              <el-option label="东京时间 (UTC+9)" value="Asia/Tokyo" />
              <el-option label="纽约时间 (UTC-5)" value="America/New_York" />
              <el-option label="伦敦时间 (UTC+0)" value="Europe/London" />
            </el-select>
          </el-form-item>
        </div>

        <!-- 运单配置 -->
        <div class="config-section">
          <h3 class="section-title">运单配置</h3>
          <el-form-item label="运单号前缀" prop="waybillPrefix">
            <el-input
              v-model="configData.waybillPrefix"
              placeholder="请输入运单号前缀"
              maxlength="10"
            />
          </el-form-item>

          <el-form-item label="自动审核" prop="autoAudit">
            <el-switch
              v-model="configData.autoAudit"
              active-text="开启"
              inactive-text="关闭"
            />
            <span class="form-tip">开启后运单将自动通过审核</span>
          </el-form-item>

          <el-form-item label="运单保留天数" prop="waybillRetentionDays">
            <el-input-number
              v-model="configData.waybillRetentionDays"
              :min="30"
              :max="3650"
              :step="30"
            />
            <span class="form-tip">天</span>
          </el-form-item>
        </div>

        <!-- 消息配置 -->
        <div class="config-section">
          <h3 class="section-title">消息配置</h3>
          <el-form-item label="消息推送" prop="messagePushEnabled">
            <el-switch
              v-model="configData.messagePushEnabled"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>

          <el-form-item label="邮件通知" prop="emailNotificationEnabled">
            <el-switch
              v-model="configData.emailNotificationEnabled"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>

          <el-form-item
            label="通知邮箱"
            prop="notificationEmail"
            v-if="configData.emailNotificationEnabled"
          >
            <el-input
              v-model="configData.notificationEmail"
              placeholder="请输入通知邮箱"
              type="email"
            />
          </el-form-item>
        </div>

        <!-- API配置 -->
        <div class="config-section">
          <h3 class="section-title">API配置</h3>
          <el-form-item label="API调用限制" prop="apiRateLimit">
            <el-input-number
              v-model="configData.apiRateLimit"
              :min="100"
              :max="10000"
              :step="100"
            />
            <span class="form-tip">次/小时</span>
          </el-form-item>

          <el-form-item label="IP白名单" prop="ipWhitelist">
            <el-input
              v-model="configData.ipWhitelist"
              type="textarea"
              :rows="3"
              placeholder="每行一个IP地址，留空表示不限制"
            />
          </el-form-item>
        </div>

        <!-- 安全配置 -->
        <div class="config-section">
          <h3 class="section-title">安全配置</h3>
          <el-form-item label="密码强度要求" prop="passwordStrength">
            <el-select v-model="configData.passwordStrength" placeholder="请选择密码强度">
              <el-option label="低（6位以上）" value="low" />
              <el-option label="中（8位以上，包含字母和数字）" value="medium" />
              <el-option label="高（10位以上，包含大小写字母、数字和特殊字符）" value="high" />
            </el-select>
          </el-form-item>

          <el-form-item label="会话超时时间" prop="sessionTimeout">
            <el-input-number
              v-model="configData.sessionTimeout"
              :min="30"
              :max="1440"
              :step="30"
            />
            <span class="form-tip">分钟</span>
          </el-form-item>

          <el-form-item label="登录失败锁定" prop="loginLockEnabled">
            <el-switch
              v-model="configData.loginLockEnabled"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>

          <el-form-item
            label="失败次数限制"
            prop="maxLoginAttempts"
            v-if="configData.loginLockEnabled"
          >
            <el-input-number
              v-model="configData.maxLoginAttempts"
              :min="3"
              :max="10"
            />
            <span class="form-tip">次</span>
          </el-form-item>
        </div>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存配置
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getCompanyConfig, updateCompanyConfig } from '@/api/company'

export default {
  name: 'SystemConfig',
  data() {
    return {
      loading: false,
      saving: false,
      companyId: null,
      configData: {
        companyName: '',
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        waybillPrefix: '',
        autoAudit: false,
        waybillRetentionDays: 365,
        messagePushEnabled: true,
        emailNotificationEnabled: false,
        notificationEmail: '',
        apiRateLimit: 1000,
        ipWhitelist: '',
        passwordStrength: 'medium',
        sessionTimeout: 120,
        loginLockEnabled: true,
        maxLoginAttempts: 5
      },
      rules: {
        language: [
          { required: true, message: '请选择系统语言', trigger: 'change' }
        ],
        timezone: [
          { required: true, message: '请选择时区', trigger: 'change' }
        ],
        waybillPrefix: [
          { max: 10, message: '前缀长度不能超过10个字符', trigger: 'blur' }
        ],
        waybillRetentionDays: [
          { required: true, message: '请设置运单保留天数', trigger: 'blur' }
        ],
        notificationEmail: [
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        apiRateLimit: [
          { required: true, message: '请设置API调用限制', trigger: 'blur' }
        ],
        passwordStrength: [
          { required: true, message: '请选择密码强度要求', trigger: 'change' }
        ],
        sessionTimeout: [
          { required: true, message: '请设置会话超时时间', trigger: 'blur' }
        ],
        maxLoginAttempts: [
          { required: true, message: '请设置失败次数限制', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.companyId = this.$route.params.id || localStorage.getItem('companyId')
    this.loadConfig()
  },
  methods: {
    async loadConfig() {
      if (!this.companyId) {
        this.$message.error('企业ID不存在')
        return
      }

      this.loading = true
      try {
        const response = await getCompanyConfig(this.companyId)
        if (response.data) {
          this.configData = { ...this.configData, ...response.data }
          try {
            localStorage.setItem(`companyConfig:${this.companyId}`, JSON.stringify(response.data || {}))
          } catch (e) {}
        }
      } catch (error) {
        this.$message.warning((error && error.message) ? `${error.message}（将使用本地缓存）` : '加载配置失败（将使用本地缓存）')
        try {
          const cached = localStorage.getItem(`companyConfig:${this.companyId}`)
          if (cached) {
            const parsed = JSON.parse(cached)
            this.configData = { ...this.configData, ...parsed }
          }
        } catch (e) {}
      } finally {
        this.loading = false
      }
    },
    async handleSave() {
      try {
        await this.$refs.configForm.validate()
      } catch (error) {
        return
      }

      this.saving = true
      try {
        await updateCompanyConfig(this.companyId, this.configData)
        this.$message.success('配置保存成功')
      } catch (error) {
        this.$message.error(error.message || '保存配置失败')
      } finally {
        this.saving = false
      }
    },
    handleReset() {
      this.$refs.configForm.resetFields()
      this.loadConfig()
    }
  }
}
</script>

<style scoped>
.system-config {
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

.config-card {
  max-width: 900px;
}

.config-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.config-section:last-of-type {
  border-bottom: none;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.form-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

.el-form-item {
  margin-bottom: 22px;
}

:deep(.el-input),
:deep(.el-select) {
  width: 400px;
}

:deep(.el-textarea) {
  width: 400px;
}
</style>
