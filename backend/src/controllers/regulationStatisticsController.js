import pool from '../config/database.js';
import { normalizeRow, formatDateTime } from '../utils/encoding.js';

/**
 * 获取监管概览
 */
export const getOverview = async (req, res) => {
  try {
    const { start_date, end_date, company_id } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (start_date) {
      whereClause += ' AND DATE(created_at) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND DATE(created_at) <= ?';
      params.push(end_date);
    }

    if (company_id) {
      whereClause += ' AND company_id = ?';
      params.push(company_id);
    }

    const businessQuery = `
      SELECT 
        COUNT(*) as total_businesses,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_businesses,
        SUM(CASE WHEN risk_level = 'high' THEN 1 ELSE 0 END) as high_risk_businesses
      FROM regulation_businesses
      WHERE ${whereClause}
    `;

    const inspectionQuery = `
      SELECT 
        COUNT(*) as total_inspections,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_inspections,
        SUM(CASE WHEN result = 'passed' THEN 1 ELSE 0 END) as passed_inspections,
        SUM(CASE WHEN result = 'failed' THEN 1 ELSE 0 END) as failed_inspections,
        AVG(score) as average_score
      FROM regulation_inspections
      WHERE ${whereClause}
    `;

    const waybillQuery = `
      SELECT 
        COUNT(*) as total_waybills,
        SUM(CASE WHEN regulation_status = 'pending' THEN 1 ELSE 0 END) as pending_waybills,
        SUM(CASE WHEN regulation_status = 'approved' THEN 1 ELSE 0 END) as approved_waybills,
        SUM(CASE WHEN regulation_status = 'rejected' THEN 1 ELSE 0 END) as rejected_waybills,
        SUM(CASE WHEN risk_level = 'high' THEN 1 ELSE 0 END) as high_risk_waybills
      FROM waybills
      WHERE ${whereClause}
    `;

    let businessResult, inspectionResult, waybillResult;
    try {
      [businessResult, inspectionResult, waybillResult] = await Promise.all([
        pool.execute(businessQuery, params),
        pool.execute(inspectionQuery, params),
        pool.execute(waybillQuery, params)
      ]);
    } catch (e) {
      if (String(e.message || '').includes("doesn't exist")) {
        return res.json({
          success: true,
          data: {
            businesses: {
              total_businesses: 0,
              active_businesses: 0,
              high_risk_businesses: 0
            },
            inspections: {
              total_inspections: 0,
              completed_inspections: 0,
              passed_inspections: 0,
              failed_inspections: 0,
              average_score: 0
            },
            waybills: {
              total_waybills: 0,
              pending_waybills: 0,
              approved_waybills: 0,
              rejected_waybills: 0,
              high_risk_waybills: 0
            },
            summary: {
              total_items: 0,
              high_risk_items: 0,
              pass_rate: 0
            }
          }
        });
      }
      throw e;
    }

    const overview = {
      businesses: normalizeRow(businessResult[0][0] || {}),
      inspections: normalizeRow(inspectionResult[0][0] || {}),
      waybills: normalizeRow(waybillResult[0][0] || {}),
      summary: {
        total_items: parseInt((businessResult[0][0] || {}).total_businesses || 0) + 
                    parseInt((inspectionResult[0][0] || {}).total_inspections || 0) + 
                    parseInt((waybillResult[0][0] || {}).total_waybills || 0),
        high_risk_items: parseInt((businessResult[0][0] || {}).high_risk_businesses || 0) + 
                        parseInt((waybillResult[0][0] || {}).high_risk_waybills || 0),
        pass_rate: ((inspectionResult[0][0] || {}).total_inspections || 0) > 0 
          ? (((inspectionResult[0][0] || {}).passed_inspections / (inspectionResult[0][0] || {}).total_inspections) * 100).toFixed(2)
          : 0
      }
    };

    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('获取监管概览失败:', error);
    res.json({
      success: true,
      data: {
        businesses: {
          total_businesses: 0,
          active_businesses: 0,
          high_risk_businesses: 0
        },
        inspections: {
          total_inspections: 0,
          completed_inspections: 0,
          passed_inspections: 0,
          failed_inspections: 0,
          average_score: 0
        },
        waybills: {
          total_waybills: 0,
          pending_waybills: 0,
          approved_waybills: 0,
          rejected_waybills: 0,
          high_risk_waybills: 0
        },
        summary: {
          total_items: 0,
          high_risk_items: 0,
          pass_rate: 0
        }
      }
    });
  }
};

/**
 * 获取违规统计数据
 */
export const getViolations = async (req, res) => {
  try {
    const { start_date, end_date, company_id, group_by = 'month' } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (start_date) {
      whereClause += ' AND DATE(created_at) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND DATE(created_at) <= ?';
      params.push(end_date);
    }

    if (company_id) {
      whereClause += ' AND company_id = ?';
      params.push(company_id);
    }

    let dateFormat;
    switch (group_by) {
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'week':
        dateFormat = '%x-%v';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'year':
        dateFormat = '%Y';
        break;
      default:
        dateFormat = '%Y-%m';
    }

    const timeSeriesQuery = `
      SELECT 
        DATE_FORMAT(created_at, '${dateFormat}') as period,
        COUNT(*) as total,
        SUM(CASE WHEN result = 'failed' THEN 1 ELSE 0 END) as violations
      FROM regulation_inspections
      WHERE ${whereClause} AND result IS NOT NULL
      GROUP BY period
      ORDER BY period
    `;

    const byTypeQuery = `
      SELECT 
        inspection_type,
        COUNT(*) as total,
        SUM(CASE WHEN result = 'failed' THEN 1 ELSE 0 END) as violations,
        ROUND(SUM(CASE WHEN result = 'failed' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as violation_rate
      FROM regulation_inspections
      WHERE ${whereClause} AND result IS NOT NULL
      GROUP BY inspection_type
    `;

    const byCompanyQuery = `
      SELECT 
        CONVERT(CAST(c.name AS BINARY) USING utf8mb4) as company_name,
        COUNT(*) as total_inspections,
        SUM(CASE WHEN ri.result = 'failed' THEN 1 ELSE 0 END) as violations,
        ROUND(SUM(CASE WHEN ri.result = 'failed' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as violation_rate
      FROM regulation_inspections ri
      LEFT JOIN companies c ON ri.company_id = c.id
      WHERE ${whereClause} AND ri.result IS NOT NULL
      GROUP BY c.id, company_name
      ORDER BY violations DESC
      LIMIT 10
    `;

    let timeSeriesResult, byTypeResult, byCompanyResult;
    try {
      [timeSeriesResult, byTypeResult, byCompanyResult] = await Promise.all([
        pool.execute(timeSeriesQuery, params),
        pool.execute(byTypeQuery, params),
        pool.execute(byCompanyQuery, params)
      ]);
    } catch (e) {
      if (String(e.message || '').includes("doesn't exist")) {
        return res.json({
          success: true,
          data: {
            time_series: [],
            by_type: [],
            by_company: []
          }
        });
      }
      throw e;
    }

    const fillPeriods = () => {
      const pad = (n) => String(n).padStart(2, '0');
      const makeRange = (start, end) => {
        const periods = [];
        if (group_by === 'day') {
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            periods.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
          }
        } else if (group_by === 'week') {
          let d = new Date(start);
          while (d <= end) {
            const y = d.getFullYear();
            const m = pad(d.getMonth() + 1);
            const day = pad(d.getDate());
            periods.push(`${y}-W${m}${day}`);
            d.setDate(d.getDate() + 7);
          }
        } else if (group_by === 'year') {
          for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
            periods.push(String(y));
          }
        } else {
          let y = start.getFullYear();
          let m = start.getMonth() + 1;
          const endY = end.getFullYear();
          const endM = end.getMonth() + 1;
          while (y < endY || (y === endY && m <= endM)) {
            periods.push(`${y}-${pad(m)}`);
            m++;
            if (m > 12) { m = 1; y++; }
          }
        }
        return periods;
      };
      if (start_date && end_date) {
        return makeRange(new Date(start_date), new Date(end_date));
      }
      const now = new Date();
      if (group_by === 'day') {
        const end = new Date(now);
        const start = new Date(now);
        start.setDate(start.getDate() - 6);
        return makeRange(start, end);
      }
      if (group_by === 'week') {
        const end = new Date(now);
        const start = new Date(now);
        start.setDate(start.getDate() - 7 * 7); // 8周
        return makeRange(start, end);
      }
      if (group_by === 'year') {
        const end = new Date(now);
        const start = new Date(now.getFullYear() - 4, 0, 1);
        return makeRange(start, end);
      }
      const end = new Date(now);
      const start = new Date(now);
      start.setMonth(start.getMonth() - 5); // 近6个月
      return makeRange(start, end);
    };

    const periods = fillPeriods();
    const tsRows = Array.isArray(timeSeriesResult?.[0]) ? timeSeriesResult[0] : [];
    let timeSeries = tsRows;
    if (periods && periods.length > 0) {
      const map = new Map(tsRows.map(r => [String(r.period), { total: parseInt(r.total || 0), violations: parseInt(r.violations || 0) }]));
      timeSeries = periods.map(p => {
        const v = map.get(p) || { total: 0, violations: 0 };
        return { period: p, total: v.total, violations: v.violations };
      });
    }

    const typeRows = Array.isArray(byTypeResult?.[0]) ? byTypeResult[0] : [];
    let byType = typeRows;
    if (!typeRows || typeRows.length === 0) {
      byType = [
        { inspection_type: 'routine', total: 0, violations: 0, violation_rate: 0 },
        { inspection_type: 'special', total: 0, violations: 0, violation_rate: 0 },
        { inspection_type: 'random', total: 0, violations: 0, violation_rate: 0 }
      ];
    }

    const companyRows = Array.isArray(byCompanyResult?.[0]) ? byCompanyResult[0] : [];
    let byCompany = companyRows;
    if (!companyRows || companyRows.length === 0) {
      const [fallbackCompanies] = await pool.execute(
        `
        SELECT 
          CONVERT(CAST(c.name AS BINARY) USING utf8mb4) as company_name
        FROM companies c
        ORDER BY c.id DESC
        LIMIT 10
        `
      );
      byCompany = (fallbackCompanies || []).map(r => ({
        company_name: r.company_name,
        total_inspections: 0,
        violations: 0,
        violation_rate: 0
      }));
    }

    res.json({
      success: true,
      data: {
        time_series: timeSeries,
        by_type: byType,
        by_company: byCompany
      }
    });
  } catch (error) {
    console.error('获取违规统计失败:', error);
    res.json({
      success: true,
      data: {
        time_series: [],
        by_type: [],
        by_company: []
      }
    });
  }
};

/**
 * 导出统计数据
 */
export const exportStatistics = async (req, res) => {
  try {
    const { start_date, end_date, company_id, type = 'overview' } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (start_date) {
      whereClause += ' AND DATE(created_at) >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND DATE(created_at) <= ?';
      params.push(end_date);
    }

    if (company_id) {
      whereClause += ' AND company_id = ?';
      params.push(company_id);
    }

    let query;
    let filename;

    switch (type) {
      case 'businesses':
        query = `
          SELECT 
            business_code as 业务编号,
            business_name as 业务名称,
            business_type as 业务类型,
            status as 状态,
            risk_level as 风险等级,
            created_at as 创建时间
          FROM regulation_businesses
          WHERE ${whereClause}
          ORDER BY created_at DESC
        `;
        filename = 'regulation_businesses.csv';
        break;

      case 'inspections':
        query = `
          SELECT 
            ri.inspection_code as 抽检编号,
            CONVERT(CAST(ri.inspection_title AS BINARY) USING utf8mb4) as 抽检标题,
            CONVERT(CAST(ri.inspection_type AS BINARY) USING utf8mb4) as 抽检类型,
            CONVERT(CAST(c.name AS BINARY) USING utf8mb4) as 企业名称,
            CONVERT(CAST(ri.status AS BINARY) USING utf8mb4) as 状态,
            CONVERT(CAST(ri.result AS BINARY) USING utf8mb4) as 结果,
            ri.score as 评分,
            ri.created_at as 创建时间
          FROM regulation_inspections ri
          LEFT JOIN companies c ON ri.company_id = c.id
          WHERE ${whereClause}
          ORDER BY ri.created_at DESC
        `;
        filename = 'regulation_inspections.csv';
        break;

      case 'waybills':
        query = `
          SELECT 
            w.waybill_number as 运单号,
            CONVERT(CAST(c.name AS BINARY) USING utf8mb4) as 企业名称,
            CONVERT(CAST(w.cargo_name AS BINARY) USING utf8mb4) as 货物名称,
            CONVERT(CAST(w.regulation_status AS BINARY) USING utf8mb4) as 监管状态,
            CONVERT(CAST(w.risk_level AS BINARY) USING utf8mb4) as 风险等级,
            w.created_at as 创建时间
          FROM waybills w
          LEFT JOIN companies c ON w.company_id = c.id
          WHERE ${whereClause}
          ORDER BY w.created_at DESC
        `;
        filename = 'regulation_waybills.csv';
        break;

      default:
        query = `
          SELECT 
            CONVERT(CAST('业务' AS BINARY) USING utf8mb4) as 类型,
            COUNT(*) as 总数,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as 活跃数,
            SUM(CASE WHEN risk_level = 'high' THEN 1 ELSE 0 END) as 高风险数
          FROM regulation_businesses
          WHERE ${whereClause}
          UNION ALL
          SELECT 
            CONVERT(CAST('抽检' AS BINARY) USING utf8mb4) as 类型,
            COUNT(*) as 总数,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as 已完成,
            SUM(CASE WHEN result = 'failed' THEN 1 ELSE 0 END) as 未通过
          FROM regulation_inspections
          WHERE ${whereClause}
          UNION ALL
          SELECT 
            CONVERT(CAST('运单' AS BINARY) USING utf8mb4) as 类型,
            COUNT(*) as 总数,
            SUM(CASE WHEN regulation_status = 'approved' THEN 1 ELSE 0 END) as 已批准,
            SUM(CASE WHEN risk_level = 'high' THEN 1 ELSE 0 END) as 高风险
          FROM waybills
          WHERE ${whereClause}
        `;
        filename = 'regulation_overview.csv';
    }

    let rows;
    try {
      [rows] = await pool.execute(query, params);
    } catch (e) {
      if (String(e.message || '').includes("doesn't exist")) {
        return res.status(404).json({
          success: false,
          message: '没有数据可导出'
        });
      }
      throw e;
    }

    // 转换为CSV格式
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '没有数据可导出'
      });
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        headers.map(header => {
          const v = row[header];
          const value = v instanceof Date ? formatDateTime(v) : v;
          const s = typeof value === 'string' ? value : String(value ?? '');
          return s.includes(',') ? `"${s.replace(/\"/g, '""')}"` : s;
        }).join(',')
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csvContent); // 添加BOM以支持Excel正确显示中文
  } catch (error) {
    console.error('导出统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '导出统计数据失败',
      error: error.message
    });
  }
};
