<template>
  <div class="error-page">
    <h1>无权限访问 (403)</h1>
    <p>当前账户角色无权访问该页面，请联系管理员为你开通权限。</p>
    <div class="actions">
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Forbidden'
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
