<template>
  <div class="ops-user-center">
    <div class="ops-banner">
      <span class="ops-badge">运营中心</span>
      <h1>运营用户个人管理中心</h1>
      <p class="ops-desc">此页面为平台运营侧用户中心，区别于企业侧个人中心。</p>
    </div>
    <el-card>
      <el-descriptions title="个人信息" :column="2" border>
        <el-descriptions-item label="用户名">{{ user.username }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ user.realName }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ user.email }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ user.phone }}</el-descriptions-item>
        <el-descriptions-item label="角色" :span="2">{{ user.role }}</el-descriptions-item>
      </el-descriptions>
      <div class="actions">
        <el-button type="primary" @click="showPwd = true">修改密码</el-button>
        <el-button @click="showPrefs = true">偏好设置</el-button>
      </div>
      <el-dialog v-model="showPwd" title="修改密码" width="420px">
        <el-form :model="pwdForm" label-width="100px">
          <el-form-item label="当前密码">
            <el-input v-model="pwdForm.current" type="password" />
          </el-form-item>
          <el-form-item label="新密码">
            <el-input v-model="pwdForm.new" type="password" />
          </el-form-item>
          <el-form-item label="确认新密码">
            <el-input v-model="pwdForm.confirm" type="password" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showPwd=false">取消</el-button>
          <el-button type="primary" @click="savePwd">保存</el-button>
        </template>
      </el-dialog>
      <el-drawer v-model="showPrefs" title="偏好设置" direction="rtl" size="30%">
        <el-form :model="prefs" label-width="100px">
          <el-form-item label="主题色">
            <el-select v-model="prefs.theme">
              <el-option label="蓝色" value="blue" />
              <el-option label="绿色" value="green" />
              <el-option label="红色" value="red" />
            </el-select>
          </el-form-item>
          <el-form-item label="语言">
            <el-select v-model="prefs.lang">
              <el-option label="中文" value="zh-CN" />
              <el-option label="英文" value="en-US" />
            </el-select>
          </el-form-item>
          <el-form-item label="通知方式">
            <el-checkbox-group v-model="prefs.notify">
              <el-checkbox label="邮件" />
              <el-checkbox label="短信" />
              <el-checkbox label="站内信" />
            </el-checkbox-group>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="savePrefs">保存</el-button>
            <el-button @click="resetPrefs">重置</el-button>
          </el-form-item>
        </el-form>
      </el-drawer>
    </el-card>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue';
const { proxy } = getCurrentInstance();
const user = ref({
  username: 'ops_admin',
  realName: '运营管理员',
  email: 'ops@example.com',
  phone: '13900000000',
  role: '运营管理员'
});
const showPwd = ref(false);
const showPrefs = ref(false);
const pwdForm = ref({ current: '', new: '', confirm: '' });
const prefs = ref({ theme: 'blue', lang: 'zh-CN', notify: ['邮件', '站内信'] });
const savePwd = () => {
  showPwd.value = false;
  proxy.$notifySuccess('密码已更新');
};
const savePrefs = () => {
  showPrefs.value = false;
  proxy.$notifySuccess('偏好设置已保存');
};
const resetPrefs = () => {
  prefs.value = { theme: 'blue', lang: 'zh-CN', notify: ['邮件', '站内信'] };
  proxy.$notifySuccess('已重置偏好设置');
};
</script>

<style scoped>
.ops-user-center { padding: 16px; }
.ops-banner { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.ops-badge { display: inline-block; background: #ecf5ff; color: #409eff; border: 1px solid #d9ecff; border-radius: 12px; padding: 4px 10px; font-size: 12px; width: fit-content; }
.ops-desc { color: #909399; font-size: 12px; }
.actions { margin: 12px 0; }
</style>
