import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus, { locale: zhCn })

app.config.errorHandler = (err, instance, info) => {
  console.error('前端错误:', err, info)
  ElMessage.error('发生错误，请稍后重试')
}

app.config.globalProperties.$hasPerm = (perm) => {
  if (!perm) return true
  const role = localStorage.getItem('role')
  if (role === 'admin') return true
  try {
    const raw = localStorage.getItem('permissions') || '[]'
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.includes(perm) : false
  } catch {
    return false
  }
}

app.config.globalProperties.$notifyError = (action, error) => {
  const reason =
    error?.response?.data?.message ||
    error?.message ||
    (typeof error === 'string' ? error : '')
  const msg = reason ? `${action}失败：${reason}` : `${action}失败`
  ElMessage.error(msg)
}

app.config.globalProperties.$notifySuccess = (action, detail) => {
  const msg = detail ? `${action}成功：${detail}` : `${action}成功`
  ElMessage.success(msg)
}

app.config.globalProperties.$notifyWarning = (message, detail) => {
  const msg = detail ? `${message}（原因：${detail}）` : message
  ElMessage.warning(msg)
}

// 全局替换原生 alert/confirm，统一使用 Element Plus
import { ElMessageBox } from 'element-plus'
window.alert = (message) => {
  try {
    ElMessageBox.alert(String(message ?? ''), '提示', {
      confirmButtonText: '知道了',
      type: 'info',
      center: true
    })
  } catch (_) {
    ElMessage.info(String(message ?? ''))
  }
}
window.confirm = (message) => {
  return new Promise((resolve) => {
    try {
      ElMessageBox.confirm(String(message ?? ''), '确认操作', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        distinguishCancelAndClose: true
      }).then(() => resolve(true)).catch(() => resolve(false))
    } catch (_) {
      resolve(window.prompt(String(message ?? '') + ' (输入Y确认)') === 'Y')
    }
  })
}

app.mount('#app')
