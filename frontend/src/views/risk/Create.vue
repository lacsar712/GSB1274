<template>
  <div class="risk-create-container">
    <div class="page-header">
      <h2>创建风险</h2>
      <el-button icon="el-icon-back" @click="handleBack">返回</el-button>
    </div>

    <el-card>
      <el-form
        ref="riskForm"
        :model="riskForm"
        :rules="riskRules"
        label-width="120px"
        class="risk-form"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="风险标题" prop="title">
              <el-input
                v-model="riskForm.title"
                placeholder="请输入风险标题"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="风险分类" prop="category">
              <el-select
                v-model="riskForm.category"
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
            <el-form-item label="风险等级" prop="level">
              <el-select
                v-model="riskForm.level"
                placeholder="请选择风险等级"
                style="width: 100%"
              >
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
                <el-option label="严重" value="critical" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发生概率" prop="probability">
              <el-select
                v-model="riskForm.probability"
                placeholder="请选择发生概率"
                style="width: 100%"
              >
                <el-option label="极低" value="very_low" />
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
                <el-option label="极高" value="very_high" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="风险状态" prop="status">
              <el-select
                v-model="riskForm.status"
                placeholder="请选择风险状态"
                style="width: 100%"
              >
                <el-option label="已识别" value="identified" />
                <el-option label="评估中" value="assessing" />
                <el-option label="应对中" value="mitigating" />
                <el-option label="监控中" value="monitoring" />
                <el-option label="已关闭" value="closed" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="责任人" prop="owner">
              <el-input
                v-model="riskForm.owner"
                placeholder="请输入责任人"
                maxlength="100"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联项目" prop="relatedProject">
              <el-input
                v-model="riskForm.relatedProject"
                placeholder="请输入关联项目"
                maxlength="100"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="识别日期" prop="identifiedDate">
              <el-date-picker
                v-model="riskForm.identifiedDate"
                type="datetime"
                placeholder="选择识别日期"
                style="width: 100%"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="截止日期" prop="dueDate">
              <el-date-picker
                v-model="riskForm.dueDate"
                type="datetime"
                placeholder="选择截止日期"
                style="width: 100%"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="风险描述" prop="description">
          <el-input
            v-model="riskForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入风险描述"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="影响范围" prop="impact">
          <el-input
            v-model="riskForm.impact"
            type="textarea"
            :rows="3"
            placeholder="请输入影响范围"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="应对措施" prop="mitigation">
          <el-input
            v-model="riskForm.mitigation"
            type="textarea"
            :rows="3"
            placeholder="请输入应对措施"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="标签" prop="tags">
          <el-select
            v-model="riskForm.tags"
            multiple
            filterable
            allow-create
            placeholder="请选择或输入标签"
            style="width: 100%"
          >
            <el-option
              v-for="tag in commonTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            创建风险
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="handleBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { createRisk, getRiskCategories } from '@/api/risk';

export default {
  name: 'RiskCreate',
  data() {
    return {
      categories: [],
      commonTags: ['紧急', '重要', '需关注', '待处理', '已通知'],
      submitLoading: false,
      riskForm: {
        title: '',
        category: '',
        level: 'medium',
        description: '',
        impact: '',
        probability: '',
        mitigation: '',
        status: 'identified',
        owner: '',
        identifiedDate: null,
        dueDate: null,
        relatedProject: '',
        tags: []
      },
      riskRules: {
        title: [
          { required: true, message: '请输入风险标题', trigger: 'blur' },
          { min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur' }
        ],
        level: [
          { required: true, message: '请选择风险等级', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择风险状态', trigger: 'change' }
        ]
      }
    };
  },
  mounted() {
    this.loadCategories();
    // 默认设置识别日期为当前时间
    this.riskForm.identifiedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  },
  methods: {
    // 加载风险分类
    async loadCategories() {
      try {
        const response = await getRiskCategories();
        if (response.code === 200) {
          this.categories = response.data;
        }
      } catch (error) {
        console.error('加载分类失败:', error);
      }
    },

    // 提交表单
    handleSubmit() {
      this.$refs.riskForm.validate(async (valid) => {
        if (!valid) {
          return false;
        }

        this.submitLoading = true;
        try {
          const response = await createRisk(this.riskForm);
          if (response.code === 201) {
            this.$message.success('创建风险成功');
            this.$router.push('/risks');
          }
        } catch (error) {
          if (error.response?.data?.message) {
            this.$message.error(error.response.data.message);
          } else {
            this.$message.error('创建风险失败');
          }
          console.error(error);
        } finally {
          this.submitLoading = false;
        }
      });
    },

    // 重置表单
    handleReset() {
      this.$refs.riskForm.resetFields();
      this.riskForm = {
        title: '',
        category: '',
        level: 'medium',
        description: '',
        impact: '',
        probability: '',
        mitigation: '',
        status: 'identified',
        owner: '',
        identifiedDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
        dueDate: null,
        relatedProject: '',
        tags: []
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
.risk-create-container {
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

.risk-form {
  max-width: 1200px;
}

.risk-form .el-form-item {
  margin-bottom: 22px;
}
</style>
