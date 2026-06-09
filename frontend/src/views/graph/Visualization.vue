<template>
  <div class="graph-visualization-container">
    <div class="page-header">
      <h2>图数据可视化</h2>
      <div class="header-actions">
        <el-button icon="el-icon-refresh" @click="loadGraphData">刷新</el-button>
        <el-button icon="el-icon-search" @click="showQueryDialog">查询</el-button>
          <el-button type="primary" icon="el-icon-plus" @click="showNodeDialog">添加节点</el-button>
          <el-button type="warning" icon="el-icon-link" @click="showEdgeDialog">添加边</el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="节点类型">
          <el-select
            v-model="filterForm.nodeType"
            placeholder="全部类型"
            clearable
            style="width: 150px"
            @change="loadGraphData"
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
            v-model="filterForm.edgeLabel"
            placeholder="全部标签"
            clearable
            style="width: 150px"
            @change="loadGraphData"
          >
            <el-option
              v-for="label in edgeLabels"
              :key="label"
              :label="label"
              :value="label"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 图数据可视化区域 -->
    <el-card v-loading="loading" class="graph-card">
      <div id="graph-container" ref="graphContainer" class="graph-container"></div>
      <div class="graph-stats">
        <el-tag type="info">节点数：{{ graphData.nodes.length }}</el-tag>
        <el-tag type="success" style="margin-left: 10px">边数：{{ graphData.edges.length }}</el-tag>
      </div>
    </el-card>

    <!-- 数据列表 -->
    <el-card class="list-card">
      <h3>节点列表</h3>
      <el-table v-if="graphData.nodes.length" :data="graphData.nodes" border stripe>
        <el-table-column prop="id" label="节点ID" width="180" />
        <el-table-column prop="label" label="标签" />
        <el-table-column prop="type" label="类型" width="140" />
        <el-table-column label="属性">
          <template #default="{ row }">
            <span>{{ formatProps(row.properties) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="暂无节点数据" />
    </el-card>

    <el-card class="list-card">
      <h3>边列表</h3>
      <el-table v-if="graphData.edges.length" :data="graphData.edges" border stripe>
        <el-table-column prop="id" label="边ID" width="180" />
        <el-table-column prop="label" label="标签" width="140" />
        <el-table-column prop="source" label="源节点" width="180" />
        <el-table-column prop="target" label="目标节点" width="180" />
        <el-table-column prop="weight" label="权重" width="100" />
        <el-table-column label="属性">
          <template #default="{ row }">
            <span>{{ formatProps(row.properties) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="暂无边数据" />
    </el-card>

    <!-- 查询对话框 -->
    <el-dialog
      title="图数据查询"
      :visible.sync="queryDialogVisible"
      width="600px"
    >
      <el-form ref="queryForm" :model="queryForm" label-width="100px">
        <el-form-item label="节点ID">
          <el-select
            v-model="queryForm.nodeIds"
            multiple
            filterable
            allow-create
            placeholder="输入节点ID"
            style="width: 100%"
          >
          </el-select>
        </el-form-item>
        <el-form-item label="节点类型">
          <el-select
            v-model="queryForm.nodeTypes"
            multiple
            placeholder="选择节点类型"
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
            placeholder="选择边标签"
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
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            placeholder="搜索节点标签"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="queryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </div>
    </el-dialog>

    <!-- 创建节点对话框 -->
    <el-dialog
      title="创建节点"
      :visible.sync="nodeDialogVisible"
      width="600px"
    >
      <el-form ref="nodeFormRef" :model="nodeForm" :rules="nodeRules" label-width="110px">
        <el-form-item label="节点ID" prop="nodeId">
          <el-input v-model="nodeForm.nodeId" placeholder="唯一节点ID" />
        </el-form-item>
        <el-form-item label="标签" prop="label">
          <el-input v-model="nodeForm.label" placeholder="显示名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="nodeForm.type" placeholder="请选择类型" filterable>
            <el-option v-for="type in nodeTypes" :key="type" :label="type" :value="type" />
          </el-select>
        </el-form-item>
        <el-form-item label="属性(JSON)">
          <el-input v-model="nodeForm.propertiesText" type="textarea" :rows="4" placeholder='例如 {"region":"华东"}' />
        </el-form-item>
        <el-form-item label="元数据(JSON)">
          <el-input v-model="nodeForm.metadataText" type="textarea" :rows="3" placeholder='例如 {"source":"system"}' />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="nodeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitNodeLoading" @click="submitNode">创建</el-button>
      </div>
    </el-dialog>

    <!-- 创建边对话框 -->
    <el-dialog
      title="创建边"
      :visible.sync="edgeDialogVisible"
      width="600px"
    >
      <el-form ref="edgeFormRef" :model="edgeForm" :rules="edgeRules" label-width="110px">
        <el-form-item label="边ID" prop="edgeId">
          <el-input v-model="edgeForm.edgeId" placeholder="唯一边ID" />
        </el-form-item>
        <el-form-item label="源节点ID" prop="sourceNodeId">
          <el-input v-model="edgeForm.sourceNodeId" placeholder="GraphNode.nodeId" />
        </el-form-item>
        <el-form-item label="目标节点ID" prop="targetNodeId">
          <el-input v-model="edgeForm.targetNodeId" placeholder="GraphNode.nodeId" />
        </el-form-item>
        <el-form-item label="标签" prop="label">
          <el-input v-model="edgeForm.label" placeholder="关系标签" />
        </el-form-item>
        <el-form-item label="权重">
          <el-input-number v-model="edgeForm.weight" :min="0.1" :max="10" :step="0.1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="属性(JSON)">
          <el-input v-model="edgeForm.propertiesText" type="textarea" :rows="3" placeholder='例如 {"priority":"high"}' />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="edgeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitEdgeLoading" @click="submitEdge">创建</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { getGraphData, queryGraphData, getNodeTypes, getEdgeLabels, createNode, createEdge } from '@/api/graph';

export default {
  name: 'GraphVisualization',
  data() {
    return {
      loading: false,
      graphData: {
        nodes: [],
        edges: []
      },
      chart: null,
      nodeTypes: [],
      edgeLabels: [],
      filterForm: {
        nodeType: '',
        edgeLabel: ''
      },
      queryDialogVisible: false,
      queryForm: {
        nodeIds: [],
        nodeTypes: [],
        edgeLabels: [],
        depth: 1,
        keyword: ''
      },
      nodeDialogVisible: false,
      edgeDialogVisible: false,
      submitNodeLoading: false,
      submitEdgeLoading: false,
      nodeForm: {
        nodeId: '',
        label: '',
        type: '',
        propertiesText: '',
        metadataText: ''
      },
      nodeRules: {
        nodeId: [{ required: true, message: '请输入节点ID', trigger: 'blur' }],
        label: [{ required: true, message: '请输入标签', trigger: 'blur' }],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }]
      },
      edgeForm: {
        edgeId: '',
        sourceNodeId: '',
        targetNodeId: '',
        label: '',
        weight: 1.0,
        propertiesText: ''
      },
      edgeRules: {
        edgeId: [{ required: true, message: '请输入边ID', trigger: 'blur' }],
        sourceNodeId: [{ required: true, message: '请输入源节点ID', trigger: 'blur' }],
        targetNodeId: [{ required: true, message: '请输入目标节点ID', trigger: 'blur' }],
        label: [{ required: true, message: '请输入标签', trigger: 'blur' }]
      }
    };
  },
  mounted() {
    this.loadNodeTypes();
    this.loadEdgeLabels();
    this.loadGraphData();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
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

    // 加载图数据
    async loadGraphData() {
      this.loading = true;
      try {
        const params = {
          nodeType: this.filterForm.nodeType,
          edgeLabel: this.filterForm.edgeLabel,
          limit: 1000
        };

        const response = await getGraphData(params);
        if (response.code === 200) {
          this.graphData = response.data;
          this.$nextTick(() => {
            this.renderGraph();
          });
        }
      } catch (error) {
        this.$message.error('加载图数据失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    // 显示查询对话框
    showQueryDialog() {
      this.queryDialogVisible = true;
    },
    showNodeDialog() {
      this.nodeDialogVisible = true;
    },
    showEdgeDialog() {
      this.edgeDialogVisible = true;
    },

    // 查询图数据
    async handleQuery() {
      this.loading = true;
      this.queryDialogVisible = false;
      try {
        const response = await queryGraphData(this.queryForm);
        if (response.code === 200) {
          this.graphData = response.data;
          this.$nextTick(() => {
            this.renderGraph();
          });
        }
      } catch (error) {
        this.$message.error('查询图数据失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    // 提交创建节点
    submitNode() {
      this.$refs.nodeFormRef.validate(async (valid) => {
        if (!valid) return;
        this.submitNodeLoading = true;
        try {
          // 校验JSON字段（如果填写了）
          if (this.nodeForm.propertiesText && !this.nodeForm.propertiesText.trim()) {
            this.$message.error('属性JSON不可为空字符串');
            this.submitNodeLoading = false;
            return;
          }
          if (this.nodeForm.metadataText && !this.nodeForm.metadataText.trim()) {
            this.$message.error('元数据JSON不可为空字符串');
            this.submitNodeLoading = false;
            return;
          }
          const payload = {
            nodeId: this.nodeForm.nodeId,
            label: this.nodeForm.label,
            type: this.nodeForm.type,
            properties: this.safeParseJSON(this.nodeForm.propertiesText),
            metadata: this.safeParseJSON(this.nodeForm.metadataText)
          };
          const resp = await createNode(payload);
          if (resp.code === 201 || resp.code === 200) {
            this.$message.success('节点创建成功');
            this.nodeDialogVisible = false;
            this.loadGraphData();
            this.loadNodeTypes();
          }
        } catch (e) {
          this.$message.error('节点创建失败');
          console.error(e);
        } finally {
          this.submitNodeLoading = false;
        }
      });
    },

    // 提交创建边
    submitEdge() {
      this.$refs.edgeFormRef.validate(async (valid) => {
        if (!valid) return;
        this.submitEdgeLoading = true;
        try {
          if (this.edgeForm.propertiesText && !this.edgeForm.propertiesText.trim()) {
            this.$message.error('属性JSON不可为空字符串');
            this.submitEdgeLoading = false;
            return;
          }
          const payload = {
            edgeId: this.edgeForm.edgeId,
            sourceNodeId: this.edgeForm.sourceNodeId,
            targetNodeId: this.edgeForm.targetNodeId,
            label: this.edgeForm.label,
            weight: Number(this.edgeForm.weight || 1),
            properties: this.safeParseJSON(this.edgeForm.propertiesText)
          };
          const resp = await createEdge(payload);
          if (resp.code === 201 || resp.code === 200) {
            this.$message.success('边创建成功');
            this.edgeDialogVisible = false;
            this.loadGraphData();
            this.loadEdgeLabels();
          }
        } catch (e) {
          this.$message.error('边创建失败');
          console.error(e);
        } finally {
          this.submitEdgeLoading = false;
        }
      });
    },

    // 渲染图数据
    renderGraph() {
      const container = this.$refs.graphContainer;
      if (!container) return;
      if (this.chart) {
        this.chart.dispose();
      }
      this.chart = echarts.init(container);
      const categories = Array.from(new Set(this.graphData.nodes.map(n => n.type || '默认'))).map(name => ({ name }));
      const option = {
        tooltip: { show: true },
        legend: [{ data: categories.map(c => c.name) }],
        series: [{
          type: 'graph',
          layout: 'force',
          roam: true,
          draggable: true,
          data: this.graphData.nodes.map(node => ({
            id: node.id,
            name: node.label,
            category: categories.findIndex(c => c.name === (node.type || '默认')),
            value: node.properties,
            symbolSize: 40
          })),
          links: this.graphData.edges.map(edge => ({
            source: edge.source,
            target: edge.target,
            value: edge.label,
            lineStyle: { width: Math.max(1, Number(edge.weight || 1)) }
          })),
          categories,
          force: {
            repulsion: 200,
            edgeLength: 120
          },
          label: { show: true, position: 'inside', fontSize: 12 }
        }]
      };
      this.chart.setOption(option);
    },
    handleResize() {
      if (this.chart) {
        this.chart.resize();
      }
    },
    formatProps(obj) {
      if (!obj || typeof obj !== 'object') return '-';
      try {
        const entries = Object.entries(obj).slice(0, 4).map(([k, v]) => `${k}:${String(v).slice(0, 30)}`);
        return entries.join('，');
      } catch (_) {
        return '-';
      }
    },
    safeParseJSON(text) {
      if (!text || !text.trim()) return undefined;
      try {
        return JSON.parse(text);
      } catch (_) {
        this.$message.error('JSON字段格式错误，请检查后重新提交');
        throw new Error('INVALID_JSON');
      }
    }
  }
};
</script>

<style scoped>
.graph-visualization-container {
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

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 0;
}

.graph-card {
  min-height: 600px;
}

.graph-container {
  width: 100%;
  height: 500px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.graph-stats {
  margin-top: 20px;
  text-align: center;
}

.list-card {
  margin-top: 20px;
}
</style>
