<template>
  <div class="tag-list-container">
    <div class="page-header">
      <h2>标签库</h2>
      <div class="header-actions">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索标签"
          prefix-icon="el-icon-search"
          clearable
          style="width: 300px; margin-right: 10px"
          @input="handleSearch"
        />
        <el-button type="primary" icon="el-icon-plus" @click="handleCreate">
          创建标签
        </el-button>
      </div>
    </div>

    <el-card class="tag-cloud-card">
      <div slot="header" class="card-header">
        <span>标签云</span>
        <div class="view-options">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button label="cloud">标签云</el-radio-button>
            <el-radio-button label="list">列表</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 标签云视图 -->
      <div v-if="viewMode === 'cloud'" class="tag-cloud">
        <el-empty v-if="filteredTags.length === 0" description="暂无标签" />
        <div v-else class="tag-cloud-content">
          <el-tag
            v-for="tag in filteredTags"
            :key="tag.id"
            :color="tag.color"
            :style="getTagStyle(tag)"
            class="tag-item"
            effect="plain"
            @click="handleTagClick(tag)"
          >
            <span class="tag-name">{{ tag.name }}</span>
            <span class="tag-count">({{ tag.usageCount }})</span>
          </el-tag>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else>
        <el-table
          :data="filteredTags"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="标签名称" min-width="150">
            <template slot-scope="scope">
              <el-tag :color="scope.row.color" effect="plain">
                {{ scope.row.name }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="200" />
          <el-table-column prop="usageCount" label="使用次数" width="120" align="center" />
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template slot-scope="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template slot-scope="scope">
              <el-button
                type="text"
                icon="el-icon-edit"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                type="text"
                icon="el-icon-delete"
                style="color: #f56c6c"
                :disabled="scope.row.usageCount > 0"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="selectedTags.length > 0" class="batch-actions">
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="small"
            @click="handleBatchDelete"
          >
            批量删除 ({{ selectedTags.length }})
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 创建/编辑标签对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="tagForm"
        :model="tagForm"
        :rules="tagRules"
        label-width="100px"
      >
        <el-form-item label="标签名称" prop="name">
          <el-input
            v-model="tagForm.name"
            placeholder="请输入标签名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="标签颜色" prop="color">
          <el-color-picker v-model="tagForm.color" show-alpha />
          <span style="margin-left: 10px">{{ tagForm.color }}</span>
        </el-form-item>
        <el-form-item label="标签描述" prop="description">
          <el-input
            v-model="tagForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入标签描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAllTags, createTag, updateTag, deleteTag, batchDeleteTags } from '@/api/tag';

export default {
  name: 'TagList',
  data() {
    return {
      tags: [],
      filteredTags: [],
      searchKeyword: '',
      viewMode: 'cloud',
      selectedTags: [],
      dialogVisible: false,
      dialogMode: 'create',
      submitLoading: false,
      tagForm: {
        id: null,
        name: '',
        color: '#1890ff',
        description: ''
      },
      tagRules: {
        name: [
          { required: true, message: '请输入标签名称', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        color: [
          { required: true, message: '请选择标签颜色', trigger: 'change' }
        ]
      }
    };
  },
  computed: {
    dialogTitle() {
      return this.dialogMode === 'create' ? '创建标签' : '编辑标签';
    }
  },
  mounted() {
    this.loadTags();
  },
  methods: {
    // 加载标签列表
    async loadTags() {
      try {
        const response = await getAllTags();
        if (response.code === 200) {
          this.tags = response.data;
          this.filteredTags = this.tags;
        }
      } catch (error) {
        this.$message.error('加载标签列表失败');
        console.error(error);
      }
    },

    // 搜索标签
    handleSearch() {
      if (!this.searchKeyword) {
        this.filteredTags = this.tags;
      } else {
        const keyword = this.searchKeyword.toLowerCase();
        this.filteredTags = this.tags.filter(tag => 
          tag.name.toLowerCase().includes(keyword) ||
          (tag.description && tag.description.toLowerCase().includes(keyword))
        );
      }
    },

    // 获取标签样式（根据使用次数调整大小）
    getTagStyle(tag) {
      const maxUsage = Math.max(...this.tags.map(t => t.usageCount), 1);
      const minSize = 14;
      const maxSize = 32;
      const size = minSize + (tag.usageCount / maxUsage) * (maxSize - minSize);
      
      return {
        fontSize: `${size}px`,
        margin: '8px',
        padding: '8px 16px',
        cursor: 'pointer',
        borderColor: tag.color,
        color: tag.color
      };
    },

    // 点击标签
    handleTagClick(tag) {
      this.handleEdit(tag);
    },

    // 创建标签
    handleCreate() {
      this.dialogMode = 'create';
      this.dialogVisible = true;
    },

    // 编辑标签
    handleEdit(tag) {
      this.dialogMode = 'edit';
      this.tagForm = {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        description: tag.description || ''
      };
      this.dialogVisible = true;
    },

    // 删除标签
    handleDelete(tag) {
      if (tag.usageCount > 0) {
        this.$message.warning('该标签正在使用中，无法删除');
        return;
      }

      this.$confirm(`确定要删除标签"${tag.name}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await deleteTag(tag.id);
          if (response.code === 200) {
            this.$message.success('删除成功');
            this.loadTags();
          }
        } catch (error) {
          this.$message.error('删除失败');
          console.error(error);
        }
      }).catch(() => {});
    },

    // 批量删除
    handleBatchDelete() {
      const tagsInUse = this.selectedTags.filter(tag => tag.usageCount > 0);
      if (tagsInUse.length > 0) {
        this.$message.warning('选中的标签中有正在使用的标签，无法删除');
        return;
      }

      this.$confirm(`确定要删除选中的 ${this.selectedTags.length} 个标签吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const tagIds = this.selectedTags.map(tag => tag.id);
          const response = await batchDeleteTags(tagIds);
          if (response.code === 200) {
            this.$message.success('批量删除成功');
            this.loadTags();
            this.selectedTags = [];
          }
        } catch (error) {
          this.$message.error('批量删除失败');
          console.error(error);
        }
      }).catch(() => {});
    },

    // 表格选择变化
    handleSelectionChange(selection) {
      this.selectedTags = selection;
    },

    // 提交表单
    handleSubmit() {
      this.$refs.tagForm.validate(async (valid) => {
        if (!valid) return;

        this.submitLoading = true;
        try {
          let response;
          if (this.dialogMode === 'create') {
            response = await createTag(this.tagForm);
          } else {
            response = await updateTag(this.tagForm.id, this.tagForm);
          }

          if (response.code === 200 || response.code === 201) {
            this.$message.success(this.dialogMode === 'create' ? '创建成功' : '更新成功');
            this.dialogVisible = false;
            this.loadTags();
          }
        } catch (error) {
          this.$message.error(this.dialogMode === 'create' ? '创建失败' : '更新失败');
          console.error(error);
        } finally {
          this.submitLoading = false;
        }
      });
    },

    // 关闭对话框
    handleDialogClose() {
      this.$refs.tagForm.resetFields();
      this.tagForm = {
        id: null,
        name: '',
        color: '#1890ff',
        description: ''
      };
    },

    // 格式化日期
    formatDate(date) {
      if (!date) return '-';
      return new Date(date).toLocaleString('zh-CN');
    }
  }
};
</script>

<style scoped>
.tag-list-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
}

.tag-cloud-card {
  min-height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tag-cloud {
  min-height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-cloud-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.tag-item {
  transition: all 0.3s;
  font-weight: 500;
}

.tag-item:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.tag-name {
  margin-right: 4px;
}

.tag-count {
  font-size: 0.85em;
  opacity: 0.7;
}

.batch-actions {
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.dialog-footer {
  text-align: right;
}
</style>
