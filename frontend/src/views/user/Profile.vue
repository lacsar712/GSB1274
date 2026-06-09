<template>
  <div class="user-profile">
    <div class="page-header">
      <h2>个人信息</h2>
      <p class="subtitle">查看和编辑您的个人信息</p>
    </div>

    <el-card class="profile-card" v-loading="loading">
      <el-form
        ref="profileForm"
        :model="profileData"
        :rules="rules"
        label-width="120px"
        label-position="left"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          
          <el-form-item label="用户名">
            <el-input
              v-model="profileData.username"
              :disabled="true"
            />
            <span class="form-tip">用户名不可修改</span>
          </el-form-item>

          <el-form-item label="真实姓名" prop="realName">
            <el-input
              v-model="profileData.realName"
              placeholder="请输入真实姓名"
              :disabled="!isEditing"
            />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="profileData.email"
              placeholder="请输入邮箱"
              type="email"
              :disabled="!isEditing"
            />
          </el-form-item>

          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="profileData.phone"
              placeholder="请输入手机号"
              :disabled="!isEditing"
            />
          </el-form-item>
        </div>

        <!-- 账户信息 -->
        <div class="form-section">
          <h3 class="section-title">账户信息</h3>
          
          <el-form-item label="角色">
            <el-tag :type="getRoleType(profileData.role)">
              {{ getRoleLabel(profileData.role) }}
            </el-tag>
          </el-form-item>

          <el-form-item label="账户状态">
            <el-tag :type="profileData.status === 'active' ? 'success' : 'info'">
              {{ profileData.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </el-form-item>

          <el-form-item label="最后登录时间">
            <span>{{ formatDate(profileData.lastLoginAt) }}</span>
          </el-form-item>

          <el-form-item label="注册时间">
            <span>{{ formatDate(profileData.createdAt) }}</span>
          </el-form-item>
        </div>

        <!-- 权限信息 -->
        <div class="form-section">
          <h3 class="section-title">我的权限</h3>
          
          <el-form-item label="权限列表">
            <div class="permissions-list">
              <el-tag
                v-for="perm in profileData.permissions"
                :key="perm"
                size="small"
                style="margin-right: 8px; margin-bottom: 8px"
              >
                {{ getPermissionLabel(perm) }}
              </el-tag>
              <span v-if="!profileData.permissions || profileData.permissions.length === 0" class="no-data">
                暂无权限
              </span>
            </div>
          </el-form-item>
        </div>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button
            v-if="!isEditing"
            type="primary"
            @click="handleEdit"
          >
            编辑信息
          </el-button>
          <template v-else>
            <el-button
              type="primary"
              @click="handleSave"
              :loading="saving"
            >
              保存
            </el-button>
            <el-button @click="handleCancel">
              取消
            </el-button>
          </template>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 快捷操作 -->
    <el-card class="actions-card">
      <h3 class="section-title">快捷操作</h3>
      <div class="action-buttons">
        <el-button
          type="warning"
          icon="el-icon-lock"
          @click="goToChangePassword"
        >
          修改密码
        </el-button>
        <el-button
          type="info"
          icon="el-icon-setting"
          @click="goToPreferences"
        >
          偏好设置
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getUserInfo, updateUserInfo } from '@/api/user'

export default {
  name: 'UserProfile',
  data() {
    return {
      loading: false,
      saving: false,
      isEditing: false,
      userId: null,
      profileData: {
        username: '',
        realName: '',
        email: '',
        phone: '',
        role: '',
        permissions: [],
        status: '',
        lastLoginAt: null,
        createdAt: null
      },
      originalData: null,
      rules: {
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' },
          { min: 2, max: 50, message: '姓名长度在2-50个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.userId = this.$route.params.id || localStorage.getItem('userId')
    this.loadUserInfo()
  },
  methods: {
    async loadUserInfo() {
      if (!this.userId) {
        this.$message.error('用户ID不存在')
        return
      }

      this.loading = true
      try {
        const response = await getUserInfo(this.userId)
        this.profileData = { ...this.profileData, ...response.data }
        this.originalData = JSON.parse(JSON.stringify(this.profileData))
      } catch (error) {
        this.$message.error(error.message || '加载用户信息失败')
      } finally {
        this.loading = false
      }
    },
    handleEdit() {
      this.isEditing = true
    },
    async handleSave() {
      try {
        await this.$refs.profileForm.validate()
      } catch (error) {
        return
      }

      this.saving = true
      try {
        await updateUserInfo(this.userId, {
          realName: this.profileData.realName,
          email: this.profileData.email,
          phone: this.profileData.phone
        })
        this.$message.success('个人信息更新成功')
        this.isEditing = false
        this.originalData = JSON.parse(JSON.stringify(this.profileData))
      } catch (error) {
        this.$message.error(error.message || '更新失败')
      } finally {
        this.saving = false
      }
    },
    handleCancel() {
      this.profileData = JSON.parse(JSON.stringify(this.originalData))
      this.isEditing = false
      this.$refs.profileForm.clearValidate()
    },
    goToChangePassword() {
      this.$router.push(`/user/${this.userId}/password`)
    },
    goToPreferences() {
      this.$router.push(`/user/${this.userId}/preferences`)
    },
    getRoleType(role) {
      const types = {
        admin: 'danger',
        operator: 'primary',
        viewer: 'info'
      }
      return types[role] || 'info'
    },
    getRoleLabel(role) {
      const labels = {
        admin: '管理员',
        operator: '操作员',
        viewer: '查看者'
      }
      return labels[role] || role
    },
    getPermissionLabel(perm) {
      const labels = {
        'waybill.view': '查看运单',
        'waybill.create': '创建运单',
        'waybill.edit': '编辑运单',
        'waybill.delete': '删除运单',
        'message.view': '查看消息',
        'message.send': '发送消息',
        'statistics.view': '查看统计',
        'api.manage': '管理API',
        'user.manage': '管理用户',
        'config.manage': '管理配置'
      }
      return labels[perm] || perm
    },
    formatDate(date) {
      if (!date) return '从未登录'
      return new Date(date).toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.user-profile {
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

.profile-card {
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

.permissions-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.no-data {
  color: #909399;
  font-size: 14px;
}

.actions-card {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

:deep(.el-input),
:deep(.el-select) {
  width: 400px;
}

:deep(.el-form-item__content) {
  display: flex;
  align-items: center;
}
</style>
