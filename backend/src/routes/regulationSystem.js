import express from 'express';

const router = express.Router();

// 获取监管系统配置
router.get('/config', async (req, res) => {
  res.json({ success: true, data: {} });
});

// 更新监管系统配置
router.put('/config', async (req, res) => {
  res.json({ success: true, message: '配置更新成功' });
});

export default router;
