<template>
  <div class="dictionary-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>字典管理</h2>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新增字典
          </el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="字典类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择类型"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="type in typeList"
              :key="type"
              :label="type"
              :value="type"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="字典代码">
          <el-input
            v-model="searchForm.code"
            placeholder="请输入字典代码"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="字典名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入字典名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" />
        
        <el-table-column prop="type" label="字典类型" width="150" />
        
        <el-table-column prop="code" label="字典代码" width="150" />
        
        <el-table-column prop="name" label="字典名称" width="150" />
        
        <el-table-column prop="value" label="字典值" min-width="150" />
        
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        
        <el-table-column prop="sortOrder" label="排序" width="80" />
        
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              :disabled="deletingId === row.id || loading"
              :loading="deletingId === row.id"
              @click="handleDelete(row)"
            >
            {{ deletingId === row.id ? '删除中...' : '删除' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Search, Refresh } from '@element-plus/icons-vue';
import {
  getDictionaries,
  getDictionaryTypes,
  deleteDictionary
} from '@/api/dictionary';

const router = useRouter();

// 搜索表单
const searchForm = reactive({
  type: '',
  code: '',
  name: '',
  status: ''
});

// 表格数据
const tableData = ref([]);
const loading = ref(false);

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
});

// 字典类型列表
const typeList = ref([]);

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    };
    
    const response = await getDictionaries(params);
    if (response.data.success) {
      tableData.value = response.data.data.dictionaries;
      pagination.total = response.data.data.total;
    }
  } catch (error) {
    ElMessage.error('加载数据失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

// 加载字典类型列表
const loadTypes = async () => {
  try {
    const response = await getDictionaryTypes();
    if (response.data.success) {
      typeList.value = response.data.data;
    }
  } catch (error) {
    console.error('加载字典类型失败：', error);
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  loadData();
};

// 重置
const handleReset = () => {
  searchForm.type = '';
  searchForm.code = '';
  searchForm.name = '';
  searchForm.status = '';
  pagination.page = 1;
  loadData();
};

// 新增
const handleCreate = () => {
  router.push('/dictionary/create');
};

// 查看
const handleView = (row) => {
  router.push(`/dictionary/detail/${row.id}`);
};

// 编辑
const handleEdit = (row) => {
  router.push(`/dictionary/edit/${row.id}`);
};

// 删除
const deletingId = ref('');
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除字典"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    deletingId.value = row.id;
    const response = await deleteDictionary(row.id);
    if (response.data.success) {
      ElMessage.success('删除成功');
      loadData();
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message);
    }
  } finally {
    deletingId.value = '';
  }
};

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size;
  pagination.page = 1;
  loadData();
};

// 页码改变
const handlePageChange = (page) => {
  pagination.page = page;
  loadData();
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 初始化
onMounted(() => {
  loadData();
  loadTypes();
});
</script>

<style scoped>
.dictionary-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
}

.search-form {
  margin-bottom: 20px;
}
</style>
