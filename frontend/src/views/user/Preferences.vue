<template>
  <div class="user-preferences">
    <div class="page-header">
      <h2>偏好设置</h2>
      <p class="subtitle">自定义您的界面和使用习惯</p>
    </div>

    <el-card class="preferences-card" v-loading="loading">
      <el-form
        ref="preferencesForm"
        :model="preferencesData"
        label-width="150px"
        label-position="left"
      >
        <!-- 界面设置 -->
        <div class="form-section">
          <h3 class="section-title">界面设置</h3>
          
          <el-form-item label="主题模式">
            <el-radio-group v-model="preferencesData.theme">
              <el-radio label="light">浅色模式</el-radio>
              <el-radio label="dark">深色模式</el-radio>
              <el-radio label="auto">跟随系统</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="语言">
            <el-select v-model="preferencesData.language" placeholder="请选择语言">
              <el-option label="简体中文" value="zh-CN" />
              <el-option label="English" value="en-US" />
            </el-select>
          </el-form-item>

          <el-form-item label="时区">
            <el-select v-model="preferencesData.timezone" placeholder="请选择时区">
              <el-option label="北京时间 (UTC+8)" value="Asia/Shanghai" />
              <el-option label="东京时间 (UTC+9)" value="Asia/Tokyo" />
              <el-option label="纽约时间 (UTC-5)" value="America/New_York" />
              <el-option label="伦敦时间 (UTC+0)" value="Europe/London" />
            </el-select>
          </el-form-item>

          <el-form-item label="日期格式">
            <el-select v-model="preferencesData.dateFormat" placeholder="请选择日期格式">
              <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
              <el-option label="DD/MM/YYYY" value="DD/MM/YYYY" />
              <el-option label="MM/DD/YYYY" value="MM/DD/YYYY" />
            </el-select>
          </el-form-item>

          <el-form-item label="时间格式">
            <el-radio-group v-model="preferencesData.timeFormat">
              <el-radio label="24">24小时制</el-radio>
              <el-radio label="12">12小时制</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <!-- 通知设置 -->
        <div class="form-section">
          <h3 class="section-title">通知设置</h3>
          
          <el-form-item label="桌面通知">
            <el-switch
              v-model="preferencesData.desktopNotification"
              active-text="开启"
              inactive-text="关闭"
            />
            <span class="form-tip">允许浏览器显示桌面通知</span>
          </el-form-item>

          <el-form-item label="声音提示">
            <el-switch
              v-model="preferencesData.soundNotification"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>

          <el-form-item label="邮件通知">
            <el-switch
              v-model="preferencesData.emailNotification"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>

          <el-form-item label="通知类型">
            <el-checkbox-group v-model="preferencesData.notificationTypes">
              <el-checkbox label="waybill">运单更新</el-checkbox>
              <el-checkbox label="message">新消息</el-checkbox>
              <el-checkbox label="system">系统通知</el-checkbox>
              <el-checkbox label="audit">审核通知</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>

        <!-- 显示设置 -->
        <div class="form-section">
          <h3 class="section-title">显示设置</h3>
          
          <el-form-item label="每页显示条数">
            <el-select v-model="preferencesData.pageSize" placeholder="请选择">
              <el-option label="10条/页" :value="10" />
              <el-option label="20条/页" :value="20" />
              <el-option label="50条/页" :value="50" />
              <el-option label="100条/页" :value="100" />
            </el-select>
          </el-form-item>

          <el-form-item label="表格密度">
            <el-radio-group v-model="preferencesData.tableDensity">
              <el-radio label="default">默认</el-radio>
              <el-radio label="medium">中等</el-radio>
              <el-radio label="small">紧凑</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="侧边栏折叠">
            <el-switch
              v-model="preferencesData.sidebarCollapsed"
              active-text="折叠"
              inactive-text="展开"
            />
          </el-form-item>
        </div>

        <!-- 快捷键设置 -->
        <div class="form-section">
          <h3 class="section-title">快捷键设置</h3>
          
          <el-form-item label="启用快捷键">
            <el-switch
              v-model="preferencesData.enableShortcuts"
              active-text="开启"
              inactive-text="关闭"
            />
          </el-form-item>

          <div v-if="preferencesData.enableShortcuts" class="shortcuts-list">
            <div class="shortcut-item">
              <span class="shortcut-label">搜索：</span>
              <el-tag size="small">Ctrl + K</el-tag>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-label">新建运单：</span>
              <el-tag size="small">Ctrl + N</el-tag>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-label">保存：</span>
              <el-tag size="small">Ctrl + S</el-tag>
            </div>
            <div class="shortcut-item">
              <span class="shortcut-label">刷新：</span>
              <el-tag size="small">Ctrl + R</el-tag>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存设置
          </el-button>
          <el-button @click="handleReset">
            恢复默认
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { getUserPreferences, updateUserPreferences } from '@/api/user'

export default {
  name: 'UserPreferences',
  data() {
    return {
      loading: false,
      saving: false,
      userId: null,
      preferencesData: {
        theme: 'light',
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24',
        desktopNotification: true,
        soundNotification: true,
        emailNotification: false,
        notificationTypes: ['waybill', 'message', 'system'],
        pageSize: 20,
        tableDensity: 'default',
        sidebarCollapsed: false,
        enableShortcuts: true
      },
      defaultPreferences: null
    }
  },
  created() {
    this.userId = this.$route.params.id || localStorage.getItem('userId') || '1'
    this.defaultPreferences = JSON.parse(JSON.stringify(this.preferencesData))
    this.loadPreferences()
  },
  methods: {
    async loadPreferences() {
      if (!this.userId) {
        return
      }
      this.loading = true
      try {
        const response = await getUserPreferences(this.userId)
        if (response.success === true || response.code === 200) {
          if (response.data) {
            this.preferencesData = { ...this.preferencesData, ...response.data }
            localStorage.setItem('userPreferences', JSON.stringify(this.preferencesData))
          }
        } else {
          const cached = localStorage.getItem('userPreferences')
          if (cached) {
            this.preferencesData = { ...this.preferencesData, ...JSON.parse(cached) }
          }
          this.$message.warning('偏好接口不可用，已使用本地设置')
        }
      } catch (_) {
        const cached = localStorage.getItem('userPreferences')
        if (cached) {
          this.preferencesData = { ...this.preferencesData, ...JSON.parse(cached) }
          this.$message.warning('网络异常，已使用本地设置')
        }
      } finally {
        this.loading = false
      }
    },
    async handleSave() {
      this.saving = true
      try {
        const resp = await updateUserPreferences(this.userId, this.preferencesData)
        if (resp.success === true || resp.code === 200) {
          this.$message.success('偏好设置保存成功')
        } else {
          localStorage.setItem('userPreferences', JSON.stringify(this.preferencesData))
          this.$message.success('偏好设置保存成功（本地缓存）')
        }
        this.applyPreferences()
      } catch (_) {
        localStorage.setItem('userPreferences', JSON.stringify(this.preferencesData))
        this.$message.success('偏好设置保存成功（本地缓存）')
      } finally {
        this.saving = false
      }
    },
    handleReset() {
      this.$confirm('确定要恢复默认设置吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.preferencesData = JSON.parse(JSON.stringify(this.defaultPreferences))
        this.$message.success('已恢复默认设置')
      }).catch(() => {})
    },
    applyPreferences() {
      // 应用主题
      if (this.preferencesData.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }

      // 应用语言
      // this.$i18n.locale = this.preferencesData.language

      // 保存到本地存储
      localStorage.setItem('userPreferences', JSON.stringify(this.preferencesData))

      // 可以触发全局事件通知其他组件更新
      window.dispatchEvent(new CustomEvent('preferences-updated', {
        detail: this.preferencesData
      }))
    }
  }
}
</script>

<style scoped>
.user-preferences {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
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

.preferences-card {
  margin-bottom: 20px;
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.form-section:last-of-type {
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

.shortcuts-list {
  margin-top: 12px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.shortcut-item:last-child {
  margin-bottom: 0;
}

.shortcut-label {
  min-width: 100px;
  font-size: 14px;
  color: #606266;
}

:deep(.el-input),
:deep(.el-select) {
  width: 300px;
}

:deep(.el-checkbox) {
  display: block;
  margin: 8px 0;
}

:deep(.el-form-item__content) {
  display: flex;
  align-items: center;
}
</style>
