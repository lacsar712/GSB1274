<template>
  <el-container class="app-container">
    <el-aside width="220px" class="app-aside">
      <div class="brand">智运服务系统</div>
      <el-menu
        router
        :default-active="$route.path"
        class="app-menu"
        background-color="#0f3460"
        text-color="#dbe8ff"
        active-text-color="#00d4ff"
      >
        <el-menu-item index="/">首页</el-menu-item>
        <el-sub-menu index="1">
          <template #title>监管服务</template>
          <el-menu-item index="/regulation/dashboard">监管大屏</el-menu-item>
          <el-menu-item index="/regulation/business">监管业务</el-menu-item>
          <el-menu-item index="/regulation/waybills">监管运单</el-menu-item>
          <el-menu-item index="/regulation/statistics">监管统计</el-menu-item>
          <el-menu-item index="/regulation/messages">监管消息</el-menu-item>
          <el-menu-item index="/regulation/system/config">监管系统管理</el-menu-item>
          <el-menu-item index="/regulation/user/center">监管用户中心</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title>企业中心</template>
          <el-menu-item index="/company/register">企业接入</el-menu-item>
          <el-menu-item index="/company/1/edit">企业信息维护</el-menu-item>
          <el-menu-item index="/statistics/overview">企业统计</el-menu-item>
          <el-menu-item index="/waybill/list">企业运单</el-menu-item>
          <el-menu-item index="/company-configs">企业配置</el-menu-item>
          <el-menu-item index="/companies/1/messages">企业消息中心</el-menu-item>
          <el-menu-item index="/api/docs">API文档</el-menu-item>
          <el-menu-item index="/api/keys">API密钥</el-menu-item>
          <el-menu-item index="/api/test">API对接测试</el-menu-item>
          <el-menu-item index="/company/1/users">管理员账号分配</el-menu-item>
          <el-menu-item index="/company/1/config">企业系统管理</el-menu-item>
          <el-menu-item index="/user/1/profile">企业用户中心</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="3">
          <template #title>运营分析</template>
          <el-menu-item index="/operations/dashboard">运营分析</el-menu-item>
          <el-menu-item index="/operations/messages">消息中心</el-menu-item>
          <el-menu-item index="/operations/monitoring">运维监控</el-menu-item>
          <el-menu-item index="/operations/performance">性能监控</el-menu-item>
          <el-menu-item index="/operations/system/config">系统管理</el-menu-item>
          <el-menu-item index="/operations/user/center">运营用户中心</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="4">
          <template #title>资源管理</template>
          <el-menu-item index="/carriers">承运人</el-menu-item>
          <el-menu-item index="/vehicles">车辆库</el-menu-item>
          <el-menu-item index="/drivers">驾驶员</el-menu-item>
          <el-menu-item index="/tags">标签库</el-menu-item>
          <el-menu-item index="/indicators">指标库</el-menu-item>
          <el-menu-item index="/dictionary/list">字典库</el-menu-item>
          <el-menu-item index="/risks">风险库</el-menu-item>
          <el-menu-item index="/graph/visualization">图数据库</el-menu-item>
          <el-menu-item index="/company-configs">企业配置库</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="5">
          <template #title>其他</template>
          <el-menu-item index="/vehicle-safety/dashboard">车辆安全</el-menu-item>
          <el-menu-item index="/delivery/dashboard">末端配送</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="app-header-bar">
        <div class="header-actions">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ $route.meta?.title || '页面' }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-user">
          <el-dropdown>
            <span class="el-dropdown-link">{{ userLabel }}</span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goProfile">个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="app-main">
        <ErrorBoundary>
          <router-view />
        </ErrorBoundary>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed, ref, watch } from 'vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
const router = useRouter()
const route = useRoute()
const roleRef = ref(localStorage.getItem('role') || '')
const usernameRef = ref(localStorage.getItem('username') || '')
const userLabel = computed(() => {
  const roleText = (() => {
    if (roleRef.value === 'admin') return '管理员'
    if (roleRef.value === 'operator') return '操作员'
    if (roleRef.value === 'regulator') return '监管用户'
    if (roleRef.value === 'company') return '企业用户'
    return '未登录'
  })()
  const uname = usernameRef.value || ''
  return uname ? `${uname}（${roleText}）` : roleText
})
watch(() => route.fullPath, () => {
  roleRef.value = localStorage.getItem('role') || ''
  usernameRef.value = localStorage.getItem('username') || ''
})
const goProfile = () => {
  router.push('/user/1/profile')
}
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('username')
  roleRef.value = ''
  usernameRef.value = ''
  router.replace('/login')
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.app-container {
  height: 100vh;
}

.app-aside {
  background: #0f3460;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding-top: 12px;
}

.brand {
  font-weight: 600;
  font-size: 16px;
  padding: 0 16px 12px 16px;
}

.app-menu {
  border-right: none;
  background: transparent;
  color: #d6e4ff;
}

.app-menu .el-sub-menu__title,
.app-menu .el-menu-item {
  color: #dbe8ff;
  font-weight: 500;
}

.app-menu .el-sub-menu__title:hover,
.app-menu .el-menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.app-menu .is-active,
.app-menu .el-menu-item.is-active {
  background: rgba(0, 212, 255, 0.16);
  color: #00d4ff !important;
}

.app-menu .el-sub-menu__icon-arrow {
  color: #bcd3ff;
}

.app-header-bar {
  background: #fff;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.header-user {
  display: flex;
  align-items: center;
}

.app-main {
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
}
</style>
