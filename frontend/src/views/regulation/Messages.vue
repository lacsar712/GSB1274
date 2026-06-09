<template>
  <div class="reg-messages">
    <div class="page-header">
      <div class="header-left">
        <h1>监管消息中心</h1>
        <div class="header-stats">
          <div class="chip">
            <span class="chip-label">总消息</span>
            <span class="chip-value">{{ stats.total }}</span>
          </div>
          <div class="chip danger">
            <span class="chip-label">未读</span>
            <span class="chip-value">{{ stats.unread }}</span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <el-button @click="markAllRead">全部标记已读</el-button>
        <el-button :disabled="selectedIds.length === 0" @click="batchMarkRead">批量标记已读</el-button>
        <el-button :disabled="selectedIds.length === 0" type="danger" @click="batchDelete">批量删除</el-button>
      </div>
    </div>

    <el-row :gutter="16">
      <el-col :xs="24" :md="8">
        <el-card :loading="loading" class="card-filters" shadow="never">
          <div class="filters-grid">
            <div class="filter-item">
              <div class="filter-label">消息类型</div>
              <el-select v-model="filters.type" placeholder="全部" clearable>
                <el-option label="系统" value="system" />
                <el-option label="抽检" value="inspection" />
                <el-option label="运单" value="waybill" />
                <el-option label="通知" value="notification" />
              </el-select>
            </div>
            <div class="filter-item">
              <div class="filter-label">状态</div>
              <el-select v-model="filters.status" placeholder="全部" clearable>
                <el-option label="未读" value="unread" />
                <el-option label="已读" value="read" />
              </el-select>
            </div>
            <div class="filter-item datepicker">
              <div class="filter-label">时间范围</div>
              <el-date-picker v-model="filters.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 100%" />
            </div>
          </div>
          <div class="filter-actions">
            <el-button type="primary" @click="fetchMessages">查询</el-button>
            <el-button @click="selectAll">全选当前页</el-button>
            <el-button @click="clearSelection">清空选择</el-button>
          </div>
          <div class="type-stats">
            <div class="type-item" v-for="t in stats.types" :key="t.type">
              <el-tag size="small">{{ formatType(t.type) }}</el-tag>
              <span class="type-count">{{ t.count }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="16">
        <el-card :loading="loading" class="card-list" shadow="never">
          <el-checkbox-group v-model="selectedIds">
            <div v-if="messages.length === 0" class="empty">
              <span class="empty-title">暂无消息</span>
              <span class="empty-sub">调整筛选条件或稍后重试</span>
            </div>
            <div v-for="msg in messages" :key="msg.id" class="msg-card" :class="[`msg-${msg.type}`, msg.status === 'unread' ? 'is-unread' : '']">
              <div class="msg-row">
                <div class="msg-left">
                  <el-checkbox :label="msg.id" />
                  <span class="msg-type">{{ formatType(msg.type) }}</span>
                  <el-tag :type="msg.status === 'unread' ? 'danger' : 'success'">{{ msg.status === 'unread' ? '未读' : '已读' }}</el-tag>
                </div>
                <div class="msg-right">
                  <span class="msg-time">{{ msg.time }}</span>
                </div>
              </div>
              <div class="msg-title">{{ msg.title }}</div>
              <div class="msg-content">{{ msg.content }}</div>
              <div class="msg-actions">
                <el-button size="small" type="success" @click="markRead(msg)">标记已读</el-button>
                <el-button size="small" type="danger" @click="remove(msg)">删除</el-button>
              </div>
            </div>
          </el-checkbox-group>
          <div class="pagination">
            <div class="total">总数：{{ total }}</div>
            <el-pagination
              background
              layout="prev, pager, next"
              :total="total"
              :page-size="pageSize"
              :current-page="page"
              @current-change="handlePageChange"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue';
import { ElMessageBox } from 'element-plus';
import apiClient from '@/utils/request';

const { proxy } = getCurrentInstance();
const norm = (text) => {
  if (typeof text !== 'string') return text;
  try {
    const chars = [...text];
    const bad = chars.filter(c => c === '\uFFFD').length;
    const ratio = bad / Math.max(1, chars.length);
    if (bad > 0 && ratio > 0.2) return '内容不可读（待清洗）';
    const suspicious = /[ÃÂÅÆÇãâåæçéèêëíïñóöúüœ�]/.test(text);
    if (!suspicious) return text;
    const bytes = new Uint8Array(chars.map(c => c.charCodeAt(0)));
    const decoder = new TextDecoder('utf-8');
    const decoded = decoder.decode(bytes);
    const dBad = [...decoded].filter(c => c === '\uFFFD').length;
    const dRatio = dBad / Math.max(1, decoded.length);
    return dBad > 0 && dRatio > 0.2 ? '内容不可读（待清洗）' : decoded;
  } catch (e) {
    try {
      return decodeURIComponent(escape(text));
    } catch (_) {
      return text;
    }
  }
};
const filters = ref({ type: '', status: '', dateRange: [] });
const messages = ref([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(20);
const total = ref(0);
const stats = ref({ total: 0, unread: 0, types: [] });
const selectedIds = ref([]);

const typeMap = {
  system: 'system_notice',
  inspection: 'inspection_result',
  waybill: 'waybill_status',
  notification: 'business_alert'
};

const formatTimestamp = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const pad = (n) => (n < 10 ? `0${n}` : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fetchMessages = async () => {
  try {
    loading.value = true;
    const params = {
      user_id: 1,
      limit: pageSize.value,
      offset: (page.value - 1) * pageSize.value
    };
    if (filters.value.type) {
      params.type = typeMap[filters.value.type];
    }
    if (filters.value.status) {
      params.is_read = filters.value.status === 'read';
    }
    if (filters.value.dateRange && filters.value.dateRange.length === 2) {
      const d0 = filters.value.dateRange[0];
      const d1 = filters.value.dateRange[1];
      const fmt = (d) => {
        const dd = new Date(d);
        const p = (n) => (n < 10 ? `0${n}` : n);
        return `${dd.getFullYear()}-${p(dd.getMonth() + 1)}-${p(dd.getDate())}`;
      };
      params.start_date = fmt(d0);
      params.end_date = fmt(d1);
    }
    const resp = await apiClient.get('/regulation/messages', { params });
    if (resp.success) {
      messages.value = (resp.data || []).map(m => ({
        ...m,
        status: m.is_read ? 'read' : 'unread',
        time: formatTimestamp(m.created_at),
        type: m.type,
        title: norm(m.title),
        content: norm(m.content)
      }));
      total.value = resp.pagination?.total ?? (messages.value?.length || 0);
      proxy.$notifySuccess('已刷新监管消息');
    }
    const statsParams = {
      user_id: 1
    };
    if (filters.value.dateRange && filters.value.dateRange.length === 2) {
      const d0 = filters.value.dateRange[0];
      const d1 = filters.value.dateRange[1];
      const fmt = (d) => {
        const dd = new Date(d);
        const p = (n) => (n < 10 ? `0${n}` : n);
        return `${dd.getFullYear()}-${p(dd.getMonth() + 1)}-${p(dd.getDate())}`;
      };
      statsParams.start_date = fmt(d0);
      statsParams.end_date = fmt(d1);
    }
    const statsResp = await apiClient.get('/regulation/messages/stats', { params: statsParams });
    if (statsResp.success) {
      stats.value = statsResp.data || { total: 0, unread: 0, types: [] };
    }
  } catch (e) {
    // 已由拦截器提示
  } finally {
    loading.value = false;
  }
};

const markAllRead = async () => {
  try {
    const resp = await apiClient.put('/regulation/messages/read/all', { user_id: 1 });
    const affected = resp?.data?.affected ?? 0;
    if (resp?.success && affected >= 0) {
      messages.value = messages.value.map(m => ({ ...m, status: 'read' }));
      proxy.$notifySuccess('已全部标记为已读');
      fetchMessages();
      return;
    }
    throw new Error('bulk all read not available');
  } catch (e) {
    const unread = messages.value.filter(m => m.status === 'unread');
    await Promise.all(unread.map(m => apiClient.put(`/regulation/messages/${m.id}/read`)));
    messages.value = messages.value.map(m => ({ ...m, status: 'read' }));
    ElMessage.success('已全部标记为已读');
    fetchMessages();
  }
};

const markRead = async (msg, silent = false) => {
  try {
    await apiClient.put(`/regulation/messages/${msg.id}/read`);
    msg.status = 'read';
    if (!silent) proxy.$notifySuccess('已标记为已读');
  } catch (e) {
    // 已由拦截器提示
  }
};

const batchMarkRead = async () => {
  if (selectedIds.value.length === 0) return;
  try {
    const resp = await apiClient.put('/regulation/messages/bulk/read', { ids: selectedIds.value });
    const effective = resp?.data?.affected ?? 0;
    if (resp?.success && effective > 0) {
      const set = new Set(selectedIds.value);
      messages.value = messages.value.map(m => (set.has(m.id) ? { ...m, status: 'read' } : m));
      proxy.$notifySuccess('批量标记已读成功');
      fetchMessages();
    } else {
      await Promise.all(
        selectedIds.value.map(id => apiClient.put(`/regulation/messages/${id}/read`))
      );
      const set = new Set(selectedIds.value);
      messages.value = messages.value.map(m => (set.has(m.id) ? { ...m, status: 'read' } : m));
      proxy.$notifySuccess('批量标记已读成功');
      fetchMessages();
    }
  } catch (e) {
    // 已由拦截器提示
  }
};

const remove = async (msg) => {
  await ElMessageBox.confirm('确认删除该消息？', '删除确认', { type: 'warning' });
  try {
    const resp = await apiClient.delete(`/regulation/messages/${msg.id}`);
    if (resp.success) {
      messages.value = messages.value.filter(m => m.id !== msg.id);
      total.value = Math.max(0, total.value - 1);
      proxy.$notifySuccess('已删除');
    }
  } catch (e) {
    // 已由拦截器提示
  }
};

const batchDelete = async () => {
  if (selectedIds.value.length === 0) return;
  await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 条消息？`, '批量删除确认', { type: 'warning' });
  try {
    const resp = await apiClient.post('/regulation/messages/bulk/delete', { ids: selectedIds.value });
    const effective = resp?.data?.affected ?? 0;
    if (resp?.success && effective > 0) {
      const set = new Set(selectedIds.value);
      messages.value = messages.value.filter(m => !set.has(m.id));
      total.value = Math.max(0, total.value - selectedIds.value.length);
      selectedIds.value = [];
      proxy.$notifySuccess('批量删除成功');
      fetchMessages();
    } else {
      await Promise.all(
        selectedIds.value.map(id => apiClient.delete(`/regulation/messages/${id}`))
      );
      const set = new Set(selectedIds.value);
      messages.value = messages.value.filter(m => !set.has(m.id));
      total.value = Math.max(0, total.value - selectedIds.value.length);
      selectedIds.value = [];
      proxy.$notifySuccess('批量删除成功');
      fetchMessages();
    }
  } catch (e) {
    // 已由拦截器提示
  }
};

const selectAll = () => {
  selectedIds.value = messages.value.map(m => m.id);
};
const clearSelection = () => {
  selectedIds.value = [];
};

const formatType = (t) => {
  const map = {
    system_notice: '系统',
    inspection_result: '抽检',
    waybill_status: '运单',
    business_alert: '通知'
  };
  return map[t] || '其他';
};

fetchMessages();
</script>

<style scoped>
.reg-messages { padding: 16px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.header-left { display: flex; align-items: center; gap: 16px; }
.header-stats { display: flex; gap: 10px; }
.chip { display: inline-flex; align-items: center; gap: 8px; padding: 6px 10px; background: #f5f7fa; border-radius: 20px; }
.chip.danger { background: #fdecec; }
.chip-label { font-size: 12px; color: #909399; }
.chip-value { font-size: 16px; font-weight: 600; color: #303133; }
.card-filters { margin-bottom: 16px; }
.filters-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
.filter-item { display: flex; flex-direction: column; gap: 6px; }
.filter-label { font-size: 12px; color: #606266; }
.filter-actions { display: flex; gap: 8px; margin-top: 8px; }
.type-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 12px; }
.type-item { display: flex; align-items: center; gap: 6px; background: #f8f9fb; padding: 6px 10px; border-radius: 6px; }
.type-count { color: #606266; }
.card-list { min-height: 400px; }
.empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; color: #909399; }
.empty-title { font-size: 16px; margin-bottom: 4px; }
.empty-sub { font-size: 12px; }
.msg-card { border: 1px solid #ebeef5; border-left: 4px solid #dcdfe6; border-radius: 8px; padding: 12px; margin-bottom: 10px; background: #fff; transition: box-shadow .2s ease; }
.msg-card:hover { box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
.msg-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.msg-left { display: flex; align-items: center; gap: 10px; }
.msg-type { font-size: 12px; color: #909399; }
.msg-right { color: #909399; font-size: 12px; }
.msg-title { font-weight: 600; margin: 4px 0; font-size: 14px; color: #303133; }
.msg-content { color: #606266; font-size: 13px; line-height: 1.6; }
.msg-actions { margin-top: 8px; display: flex; gap: 8px; }
.is-unread { background: #f8fbff; }
.msg-system { border-left-color: #409eff; }
.msg-inspection { border-left-color: #e6a23c; }
.msg-waybill { border-left-color: #67c23a; }
.msg-notification { border-left-color: #909399; }
.pagination { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
.total { color: #606266; }
@media (min-width: 768px) {
  .filters-grid { grid-template-columns: 1fr 1fr; }
}
</style>
