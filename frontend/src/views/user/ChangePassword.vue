<template>
  <div class="change-password">
    <div class="page-header">
      <h2>修改密码</h2>
      <p class="subtitle">定期修改密码可以提高账户安全性</p>
    </div>

    <el-card class="password-card">
      <el-form
        ref="passwordForm"
        :model="passwordData"
        :rules="rules"
        label-width="120px"
        label-position="left"
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input
            v-model="passwordData.oldPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
            autocomplete="off"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordData.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
            autocomplete="off"
          />
          <div class="password-strength">
            <span class="strength-label">密码强度：</span>
            <div class="strength-bar">
              <div
                class="strength-fill"
                :class="strengthClass"
                :style="{ width: strengthWidth }"
              ></div>
            </div>
            <span class="strength-text" :class="strengthClass">
              {{ strengthText }}
            </span>
          </div>
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordData.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            autocomplete="off"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="submitting"
          >
            确认修改
          </el-button>
          <el-button @click="handleCancel">
            取消
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 密码要求提示 -->
      <el-alert
        title="密码要求"
        type="info"
        :closable="false"
        show-icon
      >
        <ul class="password-requirements">
          <li>密码长度至少8个字符</li>
          <li>包含大写字母、小写字母</li>
          <li>包含数字</li>
          <li>建议包含特殊字符（如 !@#$%^&*）</li>
          <li>不要使用过于简单的密码</li>
        </ul>
      </el-alert>
    </el-card>

    <!-- 安全提示 -->
    <el-card class="tips-card">
      <h3 class="section-title">安全提示</h3>
      <ul class="security-tips">
        <li>
          <el-icon><el-icon-warning /></el-icon>
          定期更换密码，建议每3个月更换一次
        </li>
        <li>
          <el-icon><el-icon-warning /></el-icon>
          不要在多个网站使用相同的密码
        </li>
        <li>
          <el-icon><el-icon-warning /></el-icon>
          不要将密码告诉他人或写在容易被看到的地方
        </li>
        <li>
          <el-icon><el-icon-warning /></el-icon>
          如果发现账户异常，请立即修改密码并联系管理员
        </li>
      </ul>
    </el-card>
  </div>
</template>

<script>
import { changePassword } from '@/api/user'

export default {
  name: 'ChangePassword',
  data() {
    const validateOldPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入当前密码'))
      } else {
        callback()
      }
    }

    const validateNewPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入新密码'))
      } else if (value.length < 8) {
        callback(new Error('密码长度至少8个字符'))
      } else if (value === this.passwordData.oldPassword) {
        callback(new Error('新密码不能与当前密码相同'))
      } else {
        // 检查密码强度
        const hasUpperCase = /[A-Z]/.test(value)
        const hasLowerCase = /[a-z]/.test(value)
        const hasNumber = /\d/.test(value)
        
        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
          callback(new Error('密码必须包含大写字母、小写字母和数字'))
        } else {
          if (this.passwordData.confirmPassword) {
            this.$refs.passwordForm.validateField('confirmPassword')
          }
          callback()
        }
      }
    }

    const validateConfirmPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请再次输入新密码'))
      } else if (value !== this.passwordData.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }

    return {
      submitting: false,
      userId: null,
      passwordData: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      rules: {
        oldPassword: [
          { required: true, validator: validateOldPassword, trigger: 'blur' }
        ],
        newPassword: [
          { required: true, validator: validateNewPassword, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    passwordStrength() {
      const password = this.passwordData.newPassword
      if (!password) return 0

      let strength = 0
      
      // 长度
      if (password.length >= 8) strength += 1
      if (password.length >= 12) strength += 1
      
      // 包含小写字母
      if (/[a-z]/.test(password)) strength += 1
      
      // 包含大写字母
      if (/[A-Z]/.test(password)) strength += 1
      
      // 包含数字
      if (/\d/.test(password)) strength += 1
      
      // 包含特殊字符
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1

      return strength
    },
    strengthWidth() {
      return `${(this.passwordStrength / 6) * 100}%`
    },
    strengthClass() {
      if (this.passwordStrength <= 2) return 'weak'
      if (this.passwordStrength <= 4) return 'medium'
      return 'strong'
    },
    strengthText() {
      if (this.passwordStrength <= 2) return '弱'
      if (this.passwordStrength <= 4) return '中'
      return '强'
    }
  },
  created() {
    this.userId = this.$route.params.id || localStorage.getItem('userId')
  },
  methods: {
    async handleSubmit() {
      try {
        await this.$refs.passwordForm.validate()
      } catch (error) {
        return
      }

      this.submitting = true
      try {
        await changePassword(this.userId, {
          oldPassword: this.passwordData.oldPassword,
          newPassword: this.passwordData.newPassword
        })
        
        this.$message.success('密码修改成功，请重新登录')
        
        // 清空表单
        this.passwordData = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
        this.$refs.passwordForm.resetFields()
        
        // 跳转到登录页或个人信息页
        setTimeout(() => {
          this.$router.push(`/user/${this.userId}/profile`)
        }, 1500)
      } catch (error) {
        this.$message.error(error.message || '密码修改失败')
      } finally {
        this.submitting = false
      }
    },
    handleCancel() {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.change-password {
  padding: 20px;
  max-width: 700px;
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

.password-card {
  margin-bottom: 20px;
}

.password-strength {
  display: flex;
  align-items: center;
  margin-top: 8px;
  width: 100%;
}

.strength-label {
  font-size: 12px;
  color: #606266;
  margin-right: 8px;
  white-space: nowrap;
}

.strength-bar {
  flex: 1;
  height: 6px;
  background-color: #ebeef5;
  border-radius: 3px;
  overflow: hidden;
  margin-right: 8px;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s;
  border-radius: 3px;
}

.strength-fill.weak {
  background-color: #f56c6c;
}

.strength-fill.medium {
  background-color: #e6a23c;
}

.strength-fill.strong {
  background-color: #67c23a;
}

.strength-text {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.strength-text.weak {
  color: #f56c6c;
}

.strength-text.medium {
  color: #e6a23c;
}

.strength-text.strong {
  color: #67c23a;
}

.password-requirements {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  font-size: 14px;
  line-height: 1.8;
}

.tips-card {
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.security-tips {
  margin: 0;
  padding: 0;
  list-style: none;
}

.security-tips li {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.security-tips li:last-child {
  margin-bottom: 0;
}

.security-tips li .el-icon {
  color: #e6a23c;
  margin-right: 8px;
  margin-top: 2px;
  flex-shrink: 0;
}

:deep(.el-input) {
  width: 400px;
}

:deep(.el-alert) {
  margin-top: 20px;
}
</style>
