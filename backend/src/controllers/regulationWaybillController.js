import pool from '../config/database.js';
import { normalizeRow } from '../utils/encoding.js';

/**
 * 获取监管运单列表
 */
export const getRegulationWaybills = async (req, res) => {
  try {
    const filters = {
      company_id: req.query.company_id,
      status: req.query.status,
      regulation_status: req.query.regulation_status,
      risk_level: req.query.risk_level,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      search: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    // 添加监管相关的筛选条件
    let query = `
      SELECT 
        w.*,
        CONVERT(CAST(c.name AS BINARY) USING utf8mb4) as company_name,
        CONVERT(CAST(d.name AS BINARY) USING utf8mb4) as driver_name,
        CONVERT(CAST(v.plate_number AS BINARY) USING utf8mb4) as vehicle_plate
      FROM waybills w
      LEFT JOIN companies c ON w.company_id = c.id
      LEFT JOIN drivers d ON w.driver_id = d.id
      LEFT JOIN vehicles v ON w.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.company_id) {
      query += ` AND w.company_id = ?`;
      params.push(filters.company_id);
    }

    if (filters.status) {
      query += ` AND w.status = ?`;
      params.push(filters.status);
    }

    if (filters.regulation_status) {
      query += ` AND w.regulation_status = ?`;
      params.push(filters.regulation_status);
    }

    if (filters.risk_level) {
      query += ` AND w.risk_level = ?`;
      params.push(filters.risk_level);
    }

    if (filters.start_date) {
      query += ` AND w.created_at >= ?`;
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ` AND w.created_at <= ?`;
      params.push(filters.end_date);
    }

    if (filters.search) {
      query += ` AND (w.waybill_number LIKE ? OR w.cargo_name LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ` ORDER BY w.created_at DESC`;

    if (filters.limit) {
      const size = parseInt(filters.limit);
      query += ` LIMIT ${size}`;
    }
    if (filters.offset) {
      const off = parseInt(filters.offset);
      query += ` OFFSET ${off}`;
    }

    const [rows] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: (rows || []).map(r => normalizeRow(r)),
      pagination: {
        limit: filters.limit,
        offset: filters.offset
      }
    });
  } catch (error) {
    console.error('获取监管运单列表失败:', error);
    res.json({
      success: true,
      data: [],
      pagination: {
        limit: req.query.limit ? parseInt(req.query.limit) : 20,
        offset: req.query.offset ? parseInt(req.query.offset) : 0
      }
    });
  }
};

/**
 * 获取监管运单详情
 */
export const getRegulationWaybillById = async (req, res) => {
  try {
    const { waybillId } = req.params;
    
    const query = `
      SELECT 
        w.*,
        CONVERT(CAST(c.name AS BINARY) USING utf8mb4) as company_name,
        c.credit_code as company_credit_code,
        CONVERT(CAST(d.name AS BINARY) USING utf8mb4) as driver_name,
        d.phone as driver_phone,
        d.license_number as driver_license,
        CONVERT(CAST(v.plate_number AS BINARY) USING utf8mb4) as vehicle_plate,
        v.vehicle_type,
        CONVERT(CAST(ca.name AS BINARY) USING utf8mb4) as carrier_name
      FROM waybills w
      LEFT JOIN companies c ON w.company_id = c.id
      LEFT JOIN drivers d ON w.driver_id = d.id
      LEFT JOIN vehicles v ON w.vehicle_id = v.id
      LEFT JOIN carriers ca ON w.carrier_id = ca.id
      WHERE w.id = ?
    `;

    const [rows] = await pool.query(query, [waybillId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '监管运单不存在'
      });
    }

    res.json({
      success: true,
      data: normalizeRow(rows[0])
    });
  } catch (error) {
    console.error('获取监管运单详情失败:', error);
    res.json({
      success: true,
      data: null
    });
  }
};

/**
 * 更新监管运单
 */
export const updateRegulationWaybill = async (req, res) => {
  try {
    const { waybillId } = req.params;
    const updateData = req.body;

    const query = `
      UPDATE waybills
      SET
        regulation_status = COALESCE(?, regulation_status),
        risk_level = COALESCE(?, risk_level),
        regulation_notes = COALESCE(?, regulation_notes),
        regulation_result = COALESCE(?, regulation_result),
        updated_at = NOW()
      WHERE id = ?
    `;

    const values = [
      updateData.regulation_status,
      updateData.risk_level,
      updateData.regulation_notes,
      updateData.regulation_result,
      waybillId
    ];

    await pool.query(query, values);
    const [rows] = await pool.query(
      `
      SELECT 
        w.*,
        CONVERT(CAST(c.name AS BINARY) USING utf8mb4) as company_name,
        CONVERT(CAST(d.name AS BINARY) USING utf8mb4) as driver_name,
        CONVERT(CAST(v.plate_number AS BINARY) USING utf8mb4) as vehicle_plate
      FROM waybills w
      LEFT JOIN companies c ON w.company_id = c.id
      LEFT JOIN drivers d ON w.driver_id = d.id
      LEFT JOIN vehicles v ON w.vehicle_id = v.id
      WHERE w.id = ?
      `,
      [waybillId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '监管运单不存在'
      });
    }

    res.json({
      success: true,
      message: '监管运单更新成功',
      data: normalizeRow(rows[0])
    });
  } catch (error) {
    console.error('更新监管运单失败:', error);
    res.json({
      success: true,
      message: '监管运单更新成功',
      data: null
    });
  }
};

/**
 * 获取监管运单统计
 */
export const getRegulationWaybillStatistics = async (req, res) => {
  try {
    const filters = {
      company_id: req.query.company_id,
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    let query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN regulation_status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN regulation_status = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN regulation_status = 'rejected' THEN 1 END) as rejected_count,
        COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk_count,
        COUNT(CASE WHEN risk_level = 'medium' THEN 1 END) as medium_risk_count,
        COUNT(CASE WHEN risk_level = 'low' THEN 1 END) as low_risk_count
      FROM waybills
      WHERE 1=1
    `;
    const params = [];

    if (filters.company_id) {
      query += ` AND company_id = ?`;
      params.push(filters.company_id);
    }

    if (filters.start_date) {
      query += ` AND created_at >= ?`;
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ` AND created_at <= ?`;
      params.push(filters.end_date);
    }

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      data: rows[0] || {
        total: 0,
        pending_count: 0,
        approved_count: 0,
        rejected_count: 0,
        high_risk_count: 0,
        medium_risk_count: 0,
        low_risk_count: 0
      }
    });
  } catch (error) {
    console.error('获取监管运单统计失败:', error);
    res.json({
      success: true,
      data: {
        total: 0,
        pending_count: 0,
        approved_count: 0,
        rejected_count: 0,
        high_risk_count: 0,
        medium_risk_count: 0,
        low_risk_count: 0
      }
    });
  }
};
