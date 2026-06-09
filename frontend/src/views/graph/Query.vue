<template>
  <div class="graph-query-container">
    <div class="page-header">
      <h2>图数据查询</h2>
    </div>

    <el-card>
      <el-form ref="queryForm" :model="queryForm" label-width="120px" class="query-form">
        <el-form-item label="节点ID">
          <el-select
            v-model="queryForm.nodeIds"
            multiple
            filterable
            allow-create
            placeholder="输入节点ID（支持多个）"
            style="width: 100%"
          >
          </el-select>
          <span class="form-tip">输入节点ID后按回车添加</span>
        </el-form-item>

        <el-form-item label="节点类型">
          <el-select
            v-model="queryForm.nodeTypes"
            multiple
            placeholder="选择节点类型（支持多个）"
            style="width: 100%"
          >
            <el-option
              v-for="type in nodeTypes"
              :key="type"
              :label="type"
              :value="type"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="边标签">
          <el-select
            v-model="queryForm.edgeLabels"
            multiple
            placeholder="选择边标签（支持多个）"
            style="width: 100%"
          >
            <el-option
              v-for="label in edgeLabels"
              :key="label"
              :label="label"
              :value="label"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="查询深度">
          <el-input-number
            v-model="queryForm.depth"
            :min="1"
            :max="5"
            placeholder="设置查询深度"
          />
          <span class="form-tip">从指定节点开始，向外扩展的层数</span>
        </el-form-item>

        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            placeholder="搜索节点标签"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleQuery">
            查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="handleVisualize" :disabled="!hasResult">
            可视化
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 查询结果 -->
    <el-card v-if="hasResult" class="result-card">
      <div slot="header" class="card-header">
        <span>查询结果</span>
        <el-tag type="info">节点：{{ queryResult.nodes.length }}</el-tag>
        <el-tag type="success" style="margin-left: 10px">边：{{ queryResult.edges.length }}</el-tag>
      </div>

      <el-tabs v-model="activeTab">
        <!-- 节点列表 -->
        <el-tab-pane label="节点" name="nodes">
          <el-table :data="queryResult.nodes" style="width: 100%">
            <el-table-column prop="id" label="节点ID" width="200" />
            <el-table-column prop="label" label="标签" width="200" />
            <el-table-column prop="type" label="类型" width="150">
              <template slot-scope="scope">
                <el-tag size="small">{{ scope.row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="properties" label="属性">
              <template slot-scope="scope">
                <span v-if="scope.row.properties">
                  {{ JSON.stringify(scope.row.properties) }}
                </span>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 边列表 -->
        <el-tab-pane label="边" name="edges">
          <el-table :data="queryResult.edges" style="width: 100%">
            <el-table-column prop="id" label="边ID" width="200" />
            <el-table-column prop="source" label="源节点" width="200" />
            <el-table-column prop="target" label="目标节点" width="200" />
            <el-table-column prop="label" label="关系类型" width="150">
              <template slot-scope="scope">
                <el-tag type="primary" size="small">{{ scope.row.label }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="weight" label="权重" width="100" />
            <el-table-column prop="properties" label="属性">
              <template slot-scope="scope">
                <span v-if="scope.row.properties">
                  {{ JSON.stringify(scope.row.properties) }}
                </span>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { queryGraphData, getNodeTypes, getEdgeLabels } from '@/api/graph';

export default {
  name: 'GraphQuery',
  data() {
    return {
      loading: false,
      nodeTypes: [],
      edgeLabels: [],
      queryForm: {
        nodeIds: [],
        nodeTypes: [],
        edgeLabels: [],
        depth: 1,
        keyword: ''
      },
      queryResult: {
        nodes: [],
        edges: []
      },
      activeTab: 'nodes'
    };
  },
  computed: {
    hasResult() {
      return this.queryResult.nodes.length > 0 || this.queryResult.edges.length > 0;
    }
  },
  mounted() {
    this.loadNodeTypes();
    this.loadEdgeLabels();
  },
  methods: {
    // 加载节点类型
    async loadNodeTypes() {
      try {
        const response = await getNodeTypes();
        if (response.code === 200) {
          this.nodeTypes = response.data;
        }
      } catch (error) {
        console.error('加载节点类型失败:', error);
      }
    },

    // 加载边标签
    async loadEdgeLabels() {
      try {
        const response = await getEdgeLabels();
        if (response.code === 200) {
          this.edgeLabels = response.data;
        }
      } catch (error) {
        console.error('加载边标签失败:', error);
      }
    },

    // 查询
    async handleQuery() {
      // 验证查询条件
      if (
        this.queryForm.nodeIds.length === 0 &&
        this.queryForm.nodeTypes.length === 0 &&
        !this.queryForm.keyword
      ) {
        this.$message.warning('请至少输入一个查询条件');
        return;
      }

      this.loading = true;
      try {
        const response = await queryGraphData(this.queryForm);
        if (response.code === 200) {
          this.queryResult = response.data;
          this.$message.success('查询成功');
        }
      } catch (error) {
        this.$message.error('查询失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    // 重置
    handleReset() {
      this.queryForm = {
        nodeIds: [],
        nodeTypes: [],
        edgeLabels: [],
        depth: 1,
        keyword: ''
      };
      this.queryResult = {
        nodes: [],
        edges: []
      };
    },

    // 可视化
    handleVisualize() {
      // 将查询结果传递到可视化页面
      this.$router.push({
        path: '/graph/visualization',
        query: {
          data: JSON.stringify(this.queryResult)
        }
      });
    }
  }
};
</script>

<style scoped>
.graph-query-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.query-form {
  max-width: 800px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 10px;
}

.result-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
