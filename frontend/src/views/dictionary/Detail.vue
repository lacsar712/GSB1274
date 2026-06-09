<template>
  <div class="dictionary-detail">
    <el-page-header content="字典详情" />
    <el-card class="detail-card">
      <el-descriptions title="字典项" :column="2" border>
        <el-descriptions-item label="名称">示例字典</el-descriptions-item>
        <el-descriptions-item label="编码">sample_code</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag type="success">启用</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">2024-01-01</el-descriptions-item>
      </el-descriptions>
      <div class="actions">
        <el-button type="primary" @click="$router.push('/dictionary/list')">返回列表</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
</script>

<style scoped>
.dictionary-detail { padding: 20px; }
.detail-card { margin-top: 12px; }
.actions { margin-top: 12px; }
</style>
