<template>
  <div class="login-page">
    <div class="login-container">
      <div class="left">
        <div class="brand">
          <div class="logo">智运服务系统</div>
          <div class="tagline">依托综合枢纽的网络货运智能服务平台</div>
        </div>
        <ul class="highlights">
          <li>统一运单管理与企业运营分析</li>
          <li>监管大屏与风险预警可视化</li>
          <li>城市末端配送与车辆安全监控</li>
        </ul>
      </div>
      <div class="right">
        <el-card class="card" shadow="hover">
          <h2 class="title">登录系统</h2>
          <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="请输入用户名" clearable />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="remember">记住我</el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="full" :loading="loading" @click="submit">登录</el-button>
            </el-form-item>
            <div class="tips">如无账户，请联系系统管理员开通</div>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { getCompanyUsers } from '@/api/company'
export default {
  name: 'Login',
  data() {
    return {
      form: { username: '', password: '' },
      remember: true,
      loading: false,
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    };
  },
  methods: {
    async submit() {
      try {
        this.loading = true;
        await this.$refs.formRef.validate();
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('username', String(this.form.username || 'user'));
        localStorage.setItem('companyId', localStorage.getItem('companyId') || '1');
        if (String(this.form.username).toLowerCase() === 'admin') {
          localStorage.setItem('role', 'admin');
          localStorage.removeItem('permissions');
        } else if (!localStorage.getItem('role')) {
          localStorage.setItem('role', 'company');
        }
        try {
          const companyId = localStorage.getItem('companyId') || '1';
          const resp = await getCompanyUsers(companyId, {
            page: 1,
            pageSize: 1,
            username: String(this.form.username || '').trim()
          });
          const list = resp?.data?.users || resp?.data?.list || [];
          if (Array.isArray(list) && list.length > 0) {
            const user = list[0];
            if (user?.id) localStorage.setItem('userId', String(user.id));
            // 角色以企业用户的角色为准，但路由守卫仍按company域
            if (user?.role && localStorage.getItem('role') !== 'admin') {
              localStorage.setItem('role', 'company');
              localStorage.setItem('subRole', String(user.role)); // 保存细分角色
            }
            const perms = Array.isArray(user?.permissions) ? user.permissions : [];
            localStorage.setItem('permissions', JSON.stringify(perms));
          } else {
            // 找不到用户时清理权限，避免错误放行
            localStorage.removeItem('permissions');
            localStorage.setItem('userId', localStorage.getItem('userId') || '1');
          }
        } catch (e) {
          // 用户接口不可用时保守处理：清理权限以避免越权
          localStorage.removeItem('permissions');
          this.$notifyWarning('登录', { message: '用户信息接口不可用，权限未加载' });
        }
        this.$notifySuccess('登录');
        const redirect = this.$route.query?.redirect || '/';
        this.$router.replace(String(redirect));
      } catch (e) {
        if (e && e.message) {
          this.$notifyError('登录', e);
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f3460 0%, #102a43 40%, #0b1f34 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dbe8ff;
}
.login-container {
  width: 100%;
  max-width: 980px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: center;
  padding: 24px;
}
.left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px;
}
.brand .logo {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
}
.brand .tagline {
  margin-top: 8px;
  color: #bcd3ff;
}
.highlights {
  margin-top: 16px;
  list-style: none;
  padding: 0;
}
.highlights li {
  margin: 6px 0;
  color: #d6e4ff;
}
.right .card {
  background: #ffffff;
  border-radius: 12px;
}
.title {
  margin: 0 0 12px 0;
  text-align: center;
  color: #0f3460;
}
.full { width: 100%; }
@media (max-width: 860px) {
  .login-container {
    grid-template-columns: 1fr;
  }
}
</style>
