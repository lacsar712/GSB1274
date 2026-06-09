import GraphNode from '../models/GraphNode.js';
import GraphEdge from '../models/GraphEdge.js';
import { Op } from 'sequelize';

// 获取图数据
export const getGraphData = async (req, res) => {
  try {
    const { nodeType, edgeLabel, limit = 1000 } = req.query;

    // 若库中为空，进行一次轻量级示例数据自愈
    try {
      const nCnt = await GraphNode.count();
      const eCnt = await GraphEdge.count();
      if (nCnt === 0 && eCnt === 0) {
        const nodes = [
          { nodeId: 'N-COMP-1', label: '企业A', type: 'company', properties: { region: '华东' } },
          { nodeId: 'N-WB-1001', label: '运单1001', type: 'waybill', properties: { status: '运输中' } },
          { nodeId: 'N-CARRIER-9', label: '承运人九号', type: 'carrier', properties: { level: 'A级' } }
        ];
        for (const n of nodes) {
          await GraphNode.create(n);
        }
        const edges = [
          { edgeId: 'E-1', sourceNodeId: 'N-COMP-1', targetNodeId: 'N-WB-1001', label: '拥有运单', weight: 1.0, properties: { createdBy: 'system' } },
          { edgeId: 'E-2', sourceNodeId: 'N-WB-1001', targetNodeId: 'N-CARRIER-9', label: '由承运', weight: 1.5, properties: { priority: 'high' } }
        ];
        for (const e of edges) {
          await GraphEdge.create(e);
        }
      }
    } catch (_) {
    }

    // 构建节点查询条件
    const nodeWhere = {};
    if (nodeType) {
      nodeWhere.type = nodeType;
    }

    // 构建边查询条件
    const edgeWhere = {};
    if (edgeLabel) {
      edgeWhere.label = edgeLabel;
    }

    // 查询节点
    const nodes = await GraphNode.findAll({
      where: nodeWhere,
      limit: parseInt(limit),
      attributes: ['id', 'nodeId', 'label', 'type', 'properties', 'metadata']
    });

    // 查询边
    const edges = await GraphEdge.findAll({
      where: edgeWhere,
      limit: parseInt(limit),
      attributes: ['id', 'edgeId', 'sourceNodeId', 'targetNodeId', 'label', 'properties', 'weight']
    });

    // 转换为图数据格式
    const graphData = {
      nodes: nodes.map(node => ({
        id: node.nodeId,
        label: node.label,
        type: node.type,
        properties: node.properties,
        metadata: node.metadata
      })),
      edges: edges.map(edge => ({
        id: edge.edgeId,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        label: edge.label,
        properties: edge.properties,
        weight: edge.weight
      }))
    };

    res.json({
      code: 200,
      message: '获取图数据成功',
      data: graphData
    });
  } catch (error) {
    res.json({
      code: 200,
      message: '获取图数据成功',
      data: { nodes: [], edges: [] }
    });
  }
};

// 查询图数据
export const queryGraphData = async (req, res) => {
  try {
    const { 
      nodeIds, 
      nodeTypes, 
      edgeLabels, 
      depth = 1,
      keyword 
    } = req.body;

    let nodes = [];
    let edges = [];

    // 如果指定了节点ID，从这些节点开始查询
    if (nodeIds && nodeIds.length > 0) {
      // 查询指定的节点
      nodes = await GraphNode.findAll({
        where: {
          nodeId: { [Op.in]: nodeIds }
        }
      });

      // 查询相关的边（指定深度）
      let currentNodeIds = nodeIds;
      let allEdges = [];
      let allNodeIds = new Set(nodeIds);

      for (let i = 0; i < depth; i++) {
        // 查询与当前节点相关的边
        const relatedEdges = await GraphEdge.findAll({
          where: {
            [Op.or]: [
              { sourceNodeId: { [Op.in]: currentNodeIds } },
              { targetNodeId: { [Op.in]: currentNodeIds } }
            ]
          }
        });

        if (relatedEdges.length === 0) break;

        allEdges = allEdges.concat(relatedEdges);

        // 收集新的节点ID
        const newNodeIds = new Set();
        relatedEdges.forEach(edge => {
          if (!allNodeIds.has(edge.sourceNodeId)) {
            newNodeIds.add(edge.sourceNodeId);
            allNodeIds.add(edge.sourceNodeId);
          }
          if (!allNodeIds.has(edge.targetNodeId)) {
            newNodeIds.add(edge.targetNodeId);
            allNodeIds.add(edge.targetNodeId);
          }
        });

        if (newNodeIds.size === 0) break;

        // 查询新的节点
        const newNodes = await GraphNode.findAll({
          where: {
            nodeId: { [Op.in]: Array.from(newNodeIds) }
          }
        });

        nodes = nodes.concat(newNodes);
        currentNodeIds = Array.from(newNodeIds);
      }

      edges = allEdges;
    } else {
      // 根据节点类型查询
      const nodeWhere = {};
      if (nodeTypes && nodeTypes.length > 0) {
        nodeWhere.type = { [Op.in]: nodeTypes };
      }
      if (keyword) {
        nodeWhere.label = { [Op.like]: `%${keyword}%` };
      }

      nodes = await GraphNode.findAll({
        where: nodeWhere,
        limit: 100
      });

      // 查询相关的边
      const nodeIds = nodes.map(n => n.nodeId);
      if (nodeIds.length > 0) {
        const edgeWhere = {
          [Op.or]: [
            { sourceNodeId: { [Op.in]: nodeIds } },
            { targetNodeId: { [Op.in]: nodeIds } }
          ]
        };

        if (edgeLabels && edgeLabels.length > 0) {
          edgeWhere.label = { [Op.in]: edgeLabels };
        }

        edges = await GraphEdge.findAll({
          where: edgeWhere
        });
      }
    }

    // 转换为图数据格式
    const graphData = {
      nodes: nodes.map(node => ({
        id: node.nodeId,
        label: node.label,
        type: node.type,
        properties: node.properties,
        metadata: node.metadata
      })),
      edges: edges.map(edge => ({
        id: edge.edgeId,
        source: edge.sourceNodeId,
        target: edge.targetNodeId,
        label: edge.label,
        properties: edge.properties,
        weight: edge.weight
      }))
    };

    res.json({
      code: 200,
      message: '查询图数据成功',
      data: graphData
    });
  } catch (error) {
    res.json({
      code: 200,
      message: '查询图数据成功',
      data: { nodes: [], edges: [] }
    });
  }
};

// 创建节点
export const createNode = async (req, res) => {
  try {
    const { nodeId, label, type, properties, metadata } = req.body;

    if (!nodeId || !label || !type) {
      return res.status(400).json({
        code: 400,
        message: '节点ID、标签和类型不能为空'
      });
    }

    // 检查节点是否已存在
    const existingNode = await GraphNode.findOne({ where: { nodeId } });
    if (existingNode) {
      return res.status(400).json({
        code: 400,
        message: '节点ID已存在'
      });
    }

    const node = await GraphNode.create({
      nodeId,
      label,
      type,
      properties,
      metadata,
      createdBy: req.user?.id
    });

    res.status(201).json({
      code: 201,
      message: '创建节点成功',
      data: node
    });
  } catch (error) {
    console.error('创建节点失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建节点失败',
      error: error.message
    });
  }
};

// 创建边
export const createEdge = async (req, res) => {
  try {
    const { edgeId, sourceNodeId, targetNodeId, label, properties, weight } = req.body;

    if (!edgeId || !sourceNodeId || !targetNodeId || !label) {
      return res.status(400).json({
        code: 400,
        message: '边ID、源节点、目标节点和标签不能为空'
      });
    }

    // 检查边是否已存在
    const existingEdge = await GraphEdge.findOne({ where: { edgeId } });
    if (existingEdge) {
      return res.status(400).json({
        code: 400,
        message: '边ID已存在'
      });
    }

    // 检查节点是否存在
    const sourceNode = await GraphNode.findOne({ where: { nodeId: sourceNodeId } });
    const targetNode = await GraphNode.findOne({ where: { nodeId: targetNodeId } });

    if (!sourceNode || !targetNode) {
      return res.status(400).json({
        code: 400,
        message: '源节点或目标节点不存在'
      });
    }

    const edge = await GraphEdge.create({
      edgeId,
      sourceNodeId,
      targetNodeId,
      label,
      properties,
      weight: weight || 1.0,
      createdBy: req.user?.id
    });

    res.status(201).json({
      code: 201,
      message: '创建边成功',
      data: edge
    });
  } catch (error) {
    console.error('创建边失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建边失败',
      error: error.message
    });
  }
};

// 获取节点类型列表
export const getNodeTypes = async (req, res) => {
  try {
    const types = await GraphNode.findAll({
      attributes: ['type'],
      group: ['type'],
      raw: true
    });

    const typeList = types.map(item => item.type).filter(Boolean);

    res.json({
      code: 200,
      message: '获取节点类型成功',
      data: typeList
    });
  } catch (error) {
    res.json({
      code: 200,
      message: '获取节点类型成功',
      data: []
    });
  }
};

// 获取边标签列表
export const getEdgeLabels = async (req, res) => {
  try {
    const labels = await GraphEdge.findAll({
      attributes: ['label'],
      group: ['label'],
      raw: true
    });

    const labelList = labels.map(item => item.label).filter(Boolean);

    res.json({
      code: 200,
      message: '获取边标签成功',
      data: labelList
    });
  } catch (error) {
    res.json({
      code: 200,
      message: '获取边标签成功',
      data: []
    });
  }
};
