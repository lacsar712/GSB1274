<template>
  <div class="company-status">
    <el-page-header content="企业审核状态" />
    <el-card class="status-card">
      <el-result icon="success" title="企业信息已提交" sub-title="请等待审核人员处理" />
      <div class="actions">
        <el-button type="primary" @click="$router.push('/company/register')">返回注册</el-button>
        <el-button @click="$router.push('/company/audit')">查看审核列表</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
</script>

<style scoped>
.company-status {
  padding: 20px;
}
.status-card {
  margin-top: 12px;
}
.actions {
  margin-top: 12px;
  display: flex;
  gap: 12px;
}
</style>
