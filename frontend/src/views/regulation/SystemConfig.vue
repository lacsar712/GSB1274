<template>
  <div class="reg-system-config">
    <h1>监管系统管理</h1>
    <el-card>
      <el-form :model="form" label-width="120px">
        <el-form-item label="主题风格">
          <el-select v-model="form.theme">
            <el-option label="深色" value="dark" />
            <el-option label="浅色" value="light" />
          </el-select>
        </el-form-item>
        <el-form-item label="刷新间隔">
          <el-input-number v-model="form.refreshInterval" :min="10" :max="300" />
          <span class="ml8">秒</span>
        </el-form-item>
        <el-form-item label="启用模块">
          <el-checkbox-group v-model="form.widgets">
            <el-checkbox label="监管大屏" />
            <el-checkbox label="抽检管理" />
            <el-checkbox label="运单监管" />
            <el-checkbox label="统计分析" />
            <el-checkbox label="消息中心" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">保存配置</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue';
const { proxy } = getCurrentInstance();

const form = ref({
  theme: 'dark',
  refreshInterval: 30,
  widgets: ['监管大屏', '统计分析', '消息中心']
});

const save = () => {
  proxy.$notifySuccess('配置已保存');
};

const reset = () => {
  form.value = { theme: 'dark', refreshInterval: 30, widgets: ['监管大屏', '统计分析', '消息中心'] };
  proxy.$notifySuccess('已重置配置');
};
</script>

<style scoped>
.reg-system-config { padding: 16px; }
.ml8 { margin-left: 8px; }
</style>
