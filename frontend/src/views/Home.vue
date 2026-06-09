<template>
  <div class="home-container">
    <h1 class="title">智运服务系统</h1>
    <p class="subtitle">请选择需要进入的子系统或功能窗口</p>

    <div class="section">
      <h2>依托综合枢纽的网络货运智能服务子系统</h2>
      <div class="grid">
        <router-link to="/company/register" class="card">企业接入</router-link>
        <router-link to="/company/status" class="card">企业信息维护</router-link>
        <router-link to="/api/docs" class="card">API数据对接</router-link>
        <router-link to="/waybill/list" class="card">企业运单管理</router-link>
        <router-link to="/statistics/overview" class="card">企业统计分析</router-link>
        <router-link to="/companies/1/messages" class="card">企业消息中心</router-link>
        <router-link to="/company/1/config" class="card">企业系统管理</router-link>
        <router-link to="/user/1/profile" class="card">企业用户个人管理</router-link>
      </div>
    </div>

    <div class="section">
      <h2>电子运单管理与运营中心</h2>
      <div class="grid">
        <router-link to="/waybill/list" class="card">运单库</router-link>
        <router-link to="/carriers" class="card">实际承运人库</router-link>
        <router-link to="/vehicles" class="card">车辆库</router-link>
        <router-link to="/drivers" class="card">驾驶员库</router-link>
        <router-link to="/tags" class="card">标签库</router-link>
        <router-link to="/indicators" class="card">指标库</router-link>
        <router-link to="/risks" class="card">风险库</router-link>
        <router-link to="/graph/visualization" class="card">图数据库</router-link>
        <router-link to="/dictionary/list" class="card">字典库</router-link>
        <router-link to="/company-configs" class="card">企业配置库</router-link>
        <router-link to="/operations/dashboard" class="card">运营统计分析</router-link>
        <router-link to="/operations/messages" class="card">运营消息中心</router-link>
        <router-link to="/operations/monitoring" class="card">运维监控</router-link>
        <router-link to="/operations/system/config" class="card">运营系统管理</router-link>
        <router-link to="/operations/user/center" class="card">运营用户个人管理中心</router-link>
      </div>
    </div>

    <div class="section">
      <h2>监管服务窗口</h2>
      <div class="grid">
        <router-link to="/regulation/business" class="card">业务管理</router-link>
        <router-link to="/regulation/inspections" class="card">抽检管理</router-link>
        <router-link to="/regulation/waybills" class="card">监管运单管理</router-link>
        <router-link to="/regulation/statistics" class="card">监管统计分析</router-link>
        <router-link to="/regulation/dashboard" class="card accent">监管大屏</router-link>
        <router-link to="/regulation/messages" class="card">监管消息中心</router-link>
        <router-link to="/regulation/system/config" class="card">监管系统管理</router-link>
        <router-link to="/regulation/user/center" class="card">监管用户个人管理中心</router-link>
      </div>
    </div>

    <div class="section">
      <h2>城市末端配送服务子系统</h2>
      <div class="grid">
        <router-link to="/delivery/dashboard" class="card">末端配送仪表板</router-link>
        <router-link to="/delivery/list" class="card">配送订单管理</router-link>
      </div>
    </div>

    <div class="section">
      <h2>企业营运车辆安全服务子系统</h2>
      <div class="grid">
        <router-link to="/vehicle-safety/dashboard" class="card">车辆安全监控</router-link>
        <router-link to="/vehicle-safety/list" class="card">安全事件管理</router-link>
      </div>
    </div>
  </div>
  </template>

<script setup>
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
.title {
  font-size: 28px;
  font-weight: 700;
  color: #0f3460;
}
.subtitle {
  color: #666;
  margin-top: 6px;
  margin-bottom: 18px;
}
.section {
  margin-top: 24px;
}
.section h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 12px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
.card {
  display: block;
  background: #fff;
  color: #0f3460;
  text-decoration: none;
  border: 1px solid #e6e8ee;
  border-radius: 8px;
  padding: 14px 16px;
  text-align: center;
  transition: all 0.2s ease;
}
.card:hover {
  border-color: #00d4ff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}
.card.accent {
  border-color: #00d4ff;
  background: linear-gradient(135deg, #e6f7ff 0%, #f0fbff 100%);
}
</style>
