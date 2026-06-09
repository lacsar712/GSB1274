<template>
  <div class="delivery-detail">
    <div class="page-header">
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2>配送订单详情</h2>
      <div class="header-actions">
        <CompanySelect v-model="selectedCompanyId" />
        <el-tag :type="getStatusType(delivery?.status)" size="large">
          {{ getStatusText(delivery?.status) }}
        </el-tag>
      </div>
    </div>

    <div v-if="delivery" class="detail-content">
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
          </div>
        </template>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">订单号：</span>
            <span class="value">{{ delivery.order_no }}</span>
          </div>
          <div class="info-item">
            <span class="label">枢纽：</span>
            <span class="value">{{ delivery.hub_name }} ({{ delivery.hub_id }})</span>
          </div>
          <div class="info-item">
            <span class="label">配送类型：</span>
            <span class="value">{{ delivery.delivery_type === 'instant' ? '即时' : '预约' }}</span>
          </div>
          <div class="info-item">
            <span class="label">创建时间：</span>
            <span class="value">{{ formatDate(delivery.created_at) }}</span>
          </div>
          <div v-if="delivery.remark" class="info-item full-width">
            <span class="label">备注：</span>
            <span class="value">{{ delivery.remark }}</span>
          </div>
          <div v-if="imageUrls.length" class="info-item full-width">
            <span class="label">现场图片：</span>
            <div class="image-list">
              <el-image
                v-for="url in imageUrls"
                :key="url"
                :src="url"
                :preview-src-list="imageUrls"
                fit="cover"
                style="width: 120px; height: 90px; margin-right: 8px; border-radius: 6px; overflow: hidden;"
              />
            </div>
          </div>
        </div>
      </el-card>

      <div class="address-cards">
        <el-card class="address-card">
          <template #header>
            <div class="card-header">
              <el-icon><LocationFilled /></el-icon>
              <span>发件信息</span>
            </div>
          </template>
          <div class="address-info">
            <div class="info-row">
              <span class="label">姓名：</span>
              <span class="value">{{ delivery.sender_name }}</span>
            </div>
            <div class="info-row">
              <span class="label">电话：</span>
              <span class="value">{{ delivery.sender_phone }}</span>
            </div>
            <div class="info-row">
              <span class="label">地址：</span>
              <span class="value">{{ delivery.sender_address }}</span>
            </div>
          </div>
        </el-card>

        <el-card class="address-card">
          <template #header>
            <div class="card-header">
              <el-icon><LocationFilled /></el-icon>
              <span>收件信息</span>
            </div>
          </template>
          <div class="address-info">
            <div class="info-row">
              <span class="label">姓名：</span>
              <span class="value">{{ delivery.receiver_name }}</span>
            </div>
            <div class="info-row">
              <span class="label">电话：</span>
              <span class="value">{{ delivery.receiver_phone }}</span>
            </div>
            <div class="info-row">
              <span class="label">地址：</span>
              <span class="value">{{ delivery.receiver_address }}</span>
            </div>
          </div>
        </el-card>
      </div>

      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <el-icon><Box /></el-icon>
            <span>货物信息</span>
          </div>
        </template>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">类型：</span>
            <span class="value">{{ delivery.goods_type }}</span>
          </div>
          <div class="info-item">
            <span class="label">重量：</span>
            <span class="value">{{ delivery.goods_weight }} kg</span>
          </div>
          <div class="info-item">
            <span class="label">体积：</span>
            <span class="value">{{ delivery.goods_volume }} m³</span>
          </div>
        </div>
      </el-card>

      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <el-icon><User /></el-icon>
            <span>配送员</span>
          </div>
        </template>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">配送员：</span>
            <span class="value">{{ delivery.driver_name || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">分配时间：</span>
            <span class="value">{{ formatDate(delivery.assigned_at) }}</span>
          </div>
          <div class="info-item">
            <span class="label">取货时间：</span>
            <span class="value">{{ formatDate(delivery.picked_at) }}</span>
          </div>
          <div class="info-item">
            <span class="label">完成时间：</span>
            <span class="value">{{ formatDate(delivery.completed_at) }}</span>
          </div>
        </div>
      </el-card>

      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <el-icon><Memo /></el-icon>
            <span>轨迹与评价</span>
          </div>
        </template>

        <el-tabs v-model="activeTab">
          <el-tab-pane label="配送轨迹" name="tracks">
            <div class="tab-actions">
              <el-button type="primary" :disabled="!selectedCompanyId" @click="showTrackDialog">新增轨迹</el-button>
              <el-select v-model="selectedTrackId" placeholder="选择轨迹查看地图" style="margin-left:8px; width: 240px;">
                <el-option
                  v-for="t in tracks"
                  :key="t.id"
                  :label="`${formatDate(t.created_at)} ${t.location || ''}`"
                  :value="t.id"
                />
              </el-select>
              <el-button 
                v-if="selectedTrack" 
                style="margin-left:8px" 
                @click="copySelectedCoordsToForm"
              >
                复制坐标到新增表单
              </el-button>
            </div>
            <div v-if="selectedTrack" class="embed-map">
              <iframe
                :src="embedMapUrl(selectedTrack.latitude, selectedTrack.longitude)"
                style="width: 100%; height: 300px; border: 0; border-radius: 6px;"
                referrerpolicy="no-referrer"
              />
            </div>
            <div class="sketch">
              <div class="sketch-header">轨迹示意图</div>
              <canvas ref="sketchCanvas" width="800" height="240" @click="handleSketchClick" style="width: 100%; border-radius: 6px; background: #fafafa; border: 1px solid #ebeef5;"></canvas>
            </div>
            <el-timeline>
              <el-timeline-item
                v-for="track in tracks"
                :key="track.id"
                :timestamp="formatDate(track.created_at)"
                type="primary"
              >
                <div class="track-content">
                  <div class="track-status">状态：{{ track.status || '-' }}</div>
                  <div class="track-location">位置：{{ track.location || '-' }}（{{ track.latitude }}, {{ track.longitude }}）</div>
                  <div class="track-remark">备注：{{ track.remark || '-' }}</div>
                  <div class="track-map">
                    <el-link v-if="track.latitude && track.longitude" :href="mapLink(track.latitude, track.longitude)" target="_blank" type="primary">打开地图</el-link>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-tab-pane>

          <el-tab-pane label="配送评价" name="ratings">
            <div class="tab-actions">
              <el-button type="primary" :disabled="!selectedCompanyId" @click="showRatingDialog">新增评价</el-button>
            </div>
            <el-table :data="ratings" border stripe>
              <el-table-column label="综合评分" width="180">
                <template #default="{ row }">
                  <el-rate v-model="row.rating" :max="5" disabled />
                </template>
              </el-table-column>
              <el-table-column label="服务" width="160">
                <template #default="{ row }">
                  <el-rate v-model="row.service_rating" :max="5" disabled />
                </template>
              </el-table-column>
              <el-table-column label="速度" width="160">
                <template #default="{ row }">
                  <el-rate v-model="row.speed_rating" :max="5" disabled />
                </template>
              </el-table-column>
              <el-table-column label="态度" width="160">
                <template #default="{ row }">
                  <el-rate v-model="row.attitude_rating" :max="5" disabled />
                </template>
              </el-table-column>
              <el-table-column prop="comment" label="评价内容" min-width="200" />
              <el-table-column prop="created_at" label="时间" width="180" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>

    <el-dialog v-model="trackDialogVisible" title="新增配送轨迹" width="500px">
      <el-form :model="trackForm" label-width="100px">
        <el-form-item label="纬度">
          <el-input v-model="trackForm.latitude" type="number" placeholder="请输入纬度" />
        </el-form-item>
        <el-form-item label="经度">
          <el-input v-model="trackForm.longitude" type="number" placeholder="请输入经度" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="trackForm.location" placeholder="请输入位置描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-input v-model="trackForm.status" placeholder="请输入状态" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="trackForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="trackDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddTrack">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="ratingDialogVisible" title="新增配送评价" width="500px">
      <el-form :model="ratingForm" label-width="100px">
        <el-form-item label="综合评分">
          <el-rate v-model="ratingForm.rating" :max="5" />
        </el-form-item>
        <el-form-item label="服务">
          <el-rate v-model="ratingForm.service_rating" :max="5" />
        </el-form-item>
        <el-form-item label="速度">
          <el-rate v-model="ratingForm.speed_rating" :max="5" />
        </el-form-item>
        <el-form-item label="态度">
          <el-rate v-model="ratingForm.attitude_rating" :max="5" />
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input v-model="ratingForm.comment" type="textarea" :rows="3" placeholder="请输入评价内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ratingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddRating">确定</el-button>
      </template>
    </el-dialog>

    <el-loading v-if="loading" fullscreen />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, LocationFilled, Box, User, Memo } from '@element-plus/icons-vue';
import { 
  getDeliveryById, 
  getDeliveryTracks, 
  addDeliveryTrack, 
  getDeliveryRatings, 
  addDeliveryRating 
} from '@/api/delivery';
import CompanySelect from '@/components/CompanySelect.vue';

const router = useRouter();
const route = useRoute();
const deliveryId = ref(route.params.id);

const loading = ref(false);
const selectedCompanyId = ref('');
const delivery = ref(null);
const tracks = ref([]);
const ratings = ref([]);
const activeTab = ref('tracks');

const trackDialogVisible = ref(false);
const ratingDialogVisible = ref(false);
const selectedTrackId = ref(null);
const selectedTrack = computed(() => tracks.value.find(t => t.id === selectedTrackId.value));
const sketchCanvas = ref(null);

const trackForm = reactive({
  latitude: '',
  longitude: '',
  location: '',
  status: '',
  remark: ''
});

const ratingForm = reactive({
  rating: '',
  service_rating: '',
  speed_rating: '',
  attitude_rating: '',
  comment: ''
});

const fetchDelivery = async () => {
  try {
    loading.value = true;
    const res = await getDeliveryById(deliveryId.value);
    if (res.success) {
      delivery.value = res.data;
    }
  } catch (e) {
    ElMessage.error('获取配送订单详情失败');
  } finally {
    loading.value = false;
  }
};

const fetchTracks = async () => {
  try {
    const res = await getDeliveryTracks(deliveryId.value);
    if (res.success) {
      tracks.value = res.data;
    }
  } catch (e) {
    ElMessage.error('获取配送轨迹失败');
  }
};

const fetchRatings = async () => {
  try {
    const res = await getDeliveryRatings(deliveryId.value);
    if (res.success) {
      ratings.value = res.data;
    }
  } catch (e) {
    ElMessage.error('获取配送评价失败');
  }
};

const showTrackDialog = () => {
  if (!selectedCompanyId.value) {
    ElMessage.warning('请选择企业后再新增轨迹');
    return;
  }
  Object.keys(trackForm).forEach(k => trackForm[k] = '');
  trackDialogVisible.value = true;
};

const showRatingDialog = () => {
  if (!selectedCompanyId.value) {
    ElMessage.warning('请选择企业后再新增评价');
    return;
  }
  Object.keys(ratingForm).forEach(k => ratingForm[k] = '');
  ratingDialogVisible.value = true;
};

const handleAddTrack = async () => {
  if (trackForm.latitude === '' || trackForm.longitude === '') {
    ElMessage.warning('请填写经纬度');
    return;
  }
  try {
    const res = await addDeliveryTrack(deliveryId.value, trackForm);
    if (res.success) {
      ElMessage.success('新增轨迹成功');
      trackDialogVisible.value = false;
      await fetchTracks();
    }
  } catch (e) {
    ElMessage.error('新增轨迹失败');
  }
};

const handleAddRating = async () => {
  if (ratingForm.rating === '') {
    ElMessage.warning('请填写综合评分');
    return;
  }
  try {
    const res = await addDeliveryRating(deliveryId.value, ratingForm);
    if (res.success) {
      ElMessage.success('新增评价成功');
      ratingDialogVisible.value = false;
      await fetchRatings();
    }
  } catch (e) {
    ElMessage.error('新增评价失败');
  }
};

const getStatusType = (status) => {
  const typeMap = {
    pending: 'info',
    assigned: 'warning',
    picking: 'primary',
    delivering: 'primary',
    completed: 'success',
    cancelled: 'danger'
  };
  return typeMap[status] || 'info';
};

const getStatusText = (status) => {
  const textMap = {
    pending: '待分配',
    assigned: '已分配',
    picking: '取货中',
    delivering: '配送中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return textMap[status] || status;
};

const formatDate = (s) => {
  if (!s) return '-';
  try {
    const d = new Date(s);
    return d.toLocaleString();
  } catch {
    return s;
  }
};

const goBack = () => router.back();

const imageUrls = ref([]);
const extractImageUrls = (text) => {
  if (!text) return [];
  const regex = /(https?:\/\/[^\s)]+)/g;
  const matches = text.match(regex) || [];
  return matches;
};

const mapLink = (lat, lng) => {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
};

const embedMapUrl = (lat, lng) => {
  const delta = 0.01;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
};

const copySelectedCoordsToForm = () => {
  if (!selectedTrack.value) return;
  trackForm.latitude = selectedTrack.value.latitude;
  trackForm.longitude = selectedTrack.value.longitude;
};

const drawSketch = () => {
  const c = sketchCanvas.value;
  if (!c) return;
  const ctx = c.getContext('2d');
  const W = c.width;
  const H = c.height;
  ctx.clearRect(0, 0, W, H);
  if (!tracks.value || tracks.value.length === 0) return;
  const lats = tracks.value.map(t => parseFloat(t.latitude)).filter(v => Number.isFinite(v));
  const lngs = tracks.value.map(t => parseFloat(t.longitude)).filter(v => Number.isFinite(v));
  if (lats.length === 0 || lngs.length === 0) return;
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const rangeLat = Math.max(maxLat - minLat, 0.0001);
  const rangeLng = Math.max(maxLng - minLng, 0.0001);
  const mg = 20;
  const mapX = (lng) => mg + ((lng - minLng) / rangeLng) * (W - 2 * mg);
  const mapY = (lat) => mg + ((maxLat - lat) / rangeLat) * (H - 2 * mg);
  ctx.strokeStyle = '#e5e7eb';
  ctx.strokeRect(mg, mg, W - 2 * mg, H - 2 * mg);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#409EFF';
  ctx.beginPath();
  tracks.value.forEach((t, i) => {
    const x = mapX(parseFloat(t.longitude));
    const y = mapY(parseFloat(t.latitude));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.fillStyle = '#67C23A';
  tracks.value.forEach((t, i) => {
    const x = mapX(parseFloat(t.longitude));
    const y = mapY(parseFloat(t.latitude));
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
};

const handleSketchClick = (e) => {
  const c = sketchCanvas.value;
  if (!c || !tracks.value || tracks.value.length === 0) return;
  const rect = c.getBoundingClientRect();
  const scaleX = c.width / rect.width;
  const scaleY = c.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  const lats = tracks.value.map(t => parseFloat(t.latitude)).filter(v => Number.isFinite(v));
  const lngs = tracks.value.map(t => parseFloat(t.longitude)).filter(v => Number.isFinite(v));
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const rangeLat = Math.max(maxLat - minLat, 0.0001);
  const rangeLng = Math.max(maxLng - minLng, 0.0001);
  const mg = 20;
  const lng = minLng + ((x - mg) / Math.max(1, (c.width - 2 * mg))) * rangeLng;
  const lat = maxLat - ((y - mg) / Math.max(1, (c.height - 2 * mg))) * rangeLat;
  trackForm.latitude = Number(lat.toFixed(6));
  trackForm.longitude = Number(lng.toFixed(6));
  ElMessage.success('已从示意图拾取坐标');
};

onMounted(async () => {
  await fetchDelivery();
  await fetchTracks();
  await fetchRatings();
  imageUrls.value = extractImageUrls(delivery.value?.remark);
  if (tracks.value.length) {
    selectedTrackId.value = tracks.value[0].id;
  }
  drawSketch();
});
</script>

<style scoped>
.delivery-detail {
  padding: 20px;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.header-actions {
  margin-left: auto;
}
.info-card {
  margin-bottom: 16px;
}
.address-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 12px;
}
.info-item .label {
  color: #909399;
  margin-right: 6px;
}
.info-item.full-width {
  grid-column: 1 / -1;
}
.image-list {
  display: flex;
  gap: 8px;
}
.address-card .address-info .info-row {
  display: flex;
  margin: 6px 0;
}
.tab-actions {
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-end;
}
.track-content {
  display: grid;
  gap: 4px;
}
.embed-map {
  margin: 8px 0 16px;
}
.sketch {
  margin: 8px 0 16px;
}
.sketch-header {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}
</style>
