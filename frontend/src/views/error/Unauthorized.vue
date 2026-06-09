<template>
  <div class="error-page">
    <h1>未登录或会话已过期 (401)</h1>
    <p>请先登录以访问该页面。</p>
    <div class="actions">
      <el-button type="primary" @click="$router.push('/login')">前往登录</el-button>
      <el-button @click="$router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Unauthorized'
};
</script>

<style scoped>
.error-page {
  padding: 40px;
  text-align: center;
}
.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>
