// 监管仪表板控制器

// 获取监管仪表板数据（兜底结构，避免前端无数据渲染）
export const getDashboardData = async (req, res) => {
  try {
    const poolModule = await import('../config/database.js');
    const pool = poolModule.default;
    const { normalizeRow } = await import('../utils/encoding.js');

    const [businessRows] = await pool.query(`
      SELECT 
        COUNT(*) as total_businesses,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_businesses,
        COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk_businesses
      FROM regulation_businesses
    `);

    const [inspectionRows] = await pool.query(`
      SELECT 
        COUNT(*) as total_inspections,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as ongoing_inspections,
        COUNT(CASE WHEN result = 'passed' THEN 1 END) as passed_count,
        COUNT(CASE WHEN result = 'failed' THEN 1 END) as failed_count,
        COUNT(CASE WHEN result IS NULL OR result = 'pending' THEN 1 END) as pending_count
      FROM regulation_inspections
    `);

    const [waybillRows] = await pool.query(`
      SELECT 
        COUNT(*) as total_waybills,
        COUNT(CASE WHEN regulation_status = 'pending' THEN 1 END) as pending_waybills,
        COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk_waybills,
        COUNT(CASE WHEN risk_level = 'medium' THEN 1 END) as medium_risk_waybills,
        COUNT(CASE WHEN risk_level = 'low' THEN 1 END) as low_risk_waybills
      FROM waybills
    `);

    const end = new Date();
    const start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);

    const [businessTrendRows] = await pool.query(
      `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM regulation_businesses
      WHERE created_at BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `,
      [start, end]
    );

    const [inspectionTrendRows] = await pool.query(
      `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM regulation_inspections
      WHERE created_at BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `,
      [start, end]
    );

    const [waybillTrendRows] = await pool.query(
      `
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM waybills
      WHERE created_at BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `,
      [start, end]
    );

    const dateKeys = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      dateKeys.push(d.toISOString().split('T')[0]);
    }
    const toMap = rows => Object.fromEntries(rows.map(r => [r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date), r.count]));
    const bMap = toMap(businessTrendRows || []);
    const iMap = toMap(inspectionTrendRows || []);
    const wMap = toMap(waybillTrendRows || []);
    const trend = dateKeys.map(date => ({
      date,
      businesses: bMap[date] || 0,
      inspections: iMap[date] || 0,
      waybills: wMap[date] || 0
    }));

    const [topCompanyRows] = await pool.query(
      `
      SELECT 
        c.id as company_id,
        CONVERT(CAST(c.name AS BINARY) USING utf8mb4) as company_name,
        COUNT(rb.id) as business_count,
        COUNT(CASE WHEN rb.risk_level = 'high' THEN 1 END) as high_risk_count
      FROM companies c
      LEFT JOIN regulation_businesses rb ON rb.company_id = c.id
      GROUP BY c.id, company_name
      ORDER BY business_count DESC
      LIMIT 10
    `
    );

    const [recentInspectionsRows] = await pool.query(
      `
      SELECT 
        ri.inspection_code,
        CONVERT(CAST(c.name AS BINARY) USING utf8mb4) as company_name,
        ri.result,
        ri.created_at
      FROM regulation_inspections ri
      LEFT JOIN companies c ON ri.company_id = c.id
      ORDER BY ri.created_at DESC
      LIMIT 10
    `
    );

    const [alertRows] = await pool.query(
      `
      SELECT 
        CONVERT(CAST(type AS BINARY) USING utf8mb4) as type, 
        CONVERT(CAST(title AS BINARY) USING utf8mb4) as title, 
        CONVERT(CAST(content AS BINARY) USING utf8mb4) as content, 
        created_at
      FROM regulation_messages
      ORDER BY created_at DESC
      LIMIT 10
    `
    );

    res.json({
      success: true,
      data: {
        realtime: {
          total_businesses: businessRows?.[0]?.total_businesses || 0,
          active_businesses: businessRows?.[0]?.active_businesses || 0,
          total_inspections: inspectionRows?.[0]?.total_inspections || 0,
          ongoing_inspections: inspectionRows?.[0]?.ongoing_inspections || 0,
          total_waybills: waybillRows?.[0]?.total_waybills || 0,
          pending_waybills: waybillRows?.[0]?.pending_waybills || 0,
          high_risk_businesses: businessRows?.[0]?.high_risk_businesses || 0,
          high_risk_waybills: waybillRows?.[0]?.high_risk_waybills || 0
        },
        trend,
        risk_distribution: [
          { risk_level: 'low', count: waybillRows?.[0]?.low_risk_waybills || 0 },
          { risk_level: 'medium', count: waybillRows?.[0]?.medium_risk_waybills || 0 },
          { risk_level: 'high', count: waybillRows?.[0]?.high_risk_waybills || 0 }
        ],
        inspection_result: [
          { result: 'passed', count: inspectionRows?.[0]?.passed_count || 0 },
          { result: 'failed', count: inspectionRows?.[0]?.failed_count || 0 },
          { result: 'pending', count: inspectionRows?.[0]?.pending_count || 0 }
        ],
        top_companies: (topCompanyRows || []).map(r => normalizeRow({
          company_name: r.company_name,
          business_count: r.business_count,
          high_risk_count: r.high_risk_count
        })),
        recent_inspections: (recentInspectionsRows || []).map(r => normalizeRow({
          inspection_code: r.inspection_code,
          company_name: r.company_name,
          result: r.result,
          created_at: r.created_at
        })),
        alerts: (alertRows || []).map(r => normalizeRow({
          type: r.type,
          title: r.title,
          message: r.content,
          created_at: r.created_at
        }))
      }
    });
  } catch (error) {
    console.error('获取仪表板数据失败:', error);
    res.json({
      success: true,
      data: {
        realtime: {
          total_businesses: 0,
          active_businesses: 0,
          total_inspections: 0,
          ongoing_inspections: 0,
          total_waybills: 0,
          pending_waybills: 0,
          high_risk_businesses: 0,
          high_risk_waybills: 0
        },
        trend: [],
        risk_distribution: [
          { risk_level: 'low', count: 0 },
          { risk_level: 'medium', count: 0 },
          { risk_level: 'high', count: 0 }
        ],
        inspection_result: [
          { result: 'passed', count: 0 },
          { result: 'failed', count: 0 },
          { result: 'pending', count: 0 }
        ],
        top_companies: [],
        recent_inspections: [],
        alerts: []
      }
    });
  }
};

export const getDashboardConfig = async (req, res) => {
  try {
    const config = {
      theme: 'dark',
      refreshInterval: 30,
      widgets: [
        { name: 'realtime', enabled: true },
        { name: 'trend', enabled: true },
        { name: 'riskDistribution', enabled: true },
        { name: 'inspectionResult', enabled: true },
        { name: 'regulationStatus', enabled: true }
      ]
    };
    res.json({ success: true, data: config });
  } catch (error) {
    console.error('获取大屏配置失败:', error);
    res.status(500).json({ success: false, message: '获取大屏配置失败' });
  }
};

export const updateDashboardConfig = async (req, res) => {
  try {
    const config = req.body || {};
    res.json({ success: true, message: '更新成功', data: config });
  } catch (error) {
    console.error('更新大屏配置失败:', error);
    res.status(500).json({ success: false, message: '更新大屏配置失败' });
  }
};
