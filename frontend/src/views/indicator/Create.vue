<template>
  <div class="indicator-create-container">
    <div class="page-header">
      <h2>创建指标</h2>
      <el-button icon="el-icon-back" @click="handleBack">返回</el-button>
    </div>

    <el-card>
      <el-form
        ref="indicatorForm"
        :model="indicatorForm"
        :rules="indicatorRules"
        label-width="120px"
        class="indicator-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="指标名称" prop="name">
              <el-input
                v-model="indicatorForm.name"
                placeholder="请输入指标名称"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="指标编码" prop="code">
              <el-input
                v-model="indicatorForm.code"
                placeholder="请输入指标编码（唯一）"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="指标分类" prop="category">
              <el-select
                v-model="indicatorForm.category"
                placeholder="请选择或输入分类"
                filterable
                allow-create
                style="width: 100%"
              >
                <el-option
                  v-for="category in categories"
                  :key="category"
                  :label="category"
                  :value="category"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计量单位" prop="unit">
              <el-input
                v-model="indicatorForm.unit"
                placeholder="如：元、件、%等"
                maxlength="20"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="统计频率" prop="frequency">
              <el-select
                v-model="indicatorForm.frequency"
                placeholder="请选择统计频率"
                style="width: 100%"
              >
                <el-option label="每日" value="daily" />
                <el-option label="每周" value="weekly" />
                <el-option label="每月" value="monthly" />
                <el-option label="每季度" value="quarterly" />
                <el-option label="每年" value="yearly" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标值" prop="targetValue">
              <el-input-number
                v-model="indicatorForm.targetValue"
                :precision="2"
                :min="0"
                :max="999999999999.99"
                placeholder="请输入目标值"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="数据来源" prop="dataSource">
              <el-input
                v-model="indicatorForm.dataSource"
                placeholder="请输入数据来源"
                maxlength="100"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="indicatorForm.status">
                <el-radio label="active">启用</el-radio>
                <el-radio label="inactive">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="指标描述" prop="description">
          <el-input
            v-model="indicatorForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入指标描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="计算公式" prop="formula">
          <el-input
            v-model="indicatorForm.formula"
            type="textarea"
            :rows="3"
            placeholder="请输入计算公式（可选）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            创建指标
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { createIndicator, getIndicatorCategories } from '@/api/indicator';

export default {
  name: 'IndicatorCreate',
  data() {
    return {
      categories: [],
      submitLoading: false,
      indicatorForm: {
        name: '',
        code: '',
        category: '',
        unit: '',
        description: '',
        formula: '',
        dataSource: '',
        frequency: 'monthly',
        targetValue: null,
        status: 'active'
      },
      indicatorRules: {
        name: [
          { required: true, message: '请输入指标名称', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入指标编码', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9_-]+$/, message: '编码只能包含字母、数字、下划线和横线', trigger: 'blur' }
        ],
        frequency: [
          { required: true, message: '请选择统计频率', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    };
  },
  mounted() {
    this.loadCategories();
  },
  methods: {
    // 加载指标分类
    async loadCategories() {
      try {
        const response = await getIndicatorCategories();
        if (response.code === 200) {
          this.categories = response.data;
        }
      } catch (error) {
        console.error('加载分类失败:', error);
      }
    },

    // 提交表单
    handleSubmit() {
      this.$refs.indicatorForm.validate(async (valid) => {
        if (!valid) {
          return false;
        }

        this.submitLoading = true;
        try {
          const response = await createIndicator(this.indicatorForm);
          if (response.code === 201) {
            this.$message.success('创建指标成功');
            this.$router.push('/indicators');
          }
        } catch (error) {
          if (error.response?.data?.message) {
            this.$message.error(error.response.data.message);
          } else {
            this.$message.error('创建指标失败');
          }
          console.error(error);
        } finally {
          this.submitLoading = false;
        }
      });
    },

    // 重置表单
    handleReset() {
      this.$refs.indicatorForm.resetFields();
      this.indicatorForm = {
        name: '',
        code: '',
        category: '',
        unit: '',
        description: '',
        formula: '',
        dataSource: '',
        frequency: 'monthly',
        targetValue: null,
        status: 'active'
      };
    },

    // 返回列表
    handleBack() {
      this.$router.back();
    }
  }
};
</script>

<style scoped>
.indicator-create-container {
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
  color: #303133;
}

.indicator-form {
  max-width: 1200px;
}

.indicator-form .el-form-item {
  margin-bottom: 22px;
}
</style>
