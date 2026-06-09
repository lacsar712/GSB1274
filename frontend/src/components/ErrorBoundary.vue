<template>
  <div class="error-boundary">
    <slot v-if="!hasError" />
    <div v-else class="fallback">
      <el-result icon="error" title="页面发生错误" sub-title="请稍后重试或刷新页面" />
    </div>
  </div>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
const hasError = ref(false)
onErrorCaptured(() => {
  hasError.value = true
  return false
})
</script>

<style scoped>
.fallback {
  padding: 40px;
}
</style>
