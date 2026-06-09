import express from 'express';
import { body } from 'express-validator';
import CompanyController from '../controllers/companyController.js';
import upload from '../config/upload.js';

const router = express.Router();

// 企业注册验证规则
const registerValidation = [
  body('name').trim().notEmpty().withMessage('企业名称不能为空'),
  body('creditCode').trim().notEmpty().withMessage('统一社会信用代码不能为空')
    .isLength({ min: 18, max: 18 }).withMessage('统一社会信用代码必须为18位'),
  body('legalPerson').trim().notEmpty().withMessage('法人代表不能为空'),
  body('contactPerson').trim().notEmpty().withMessage('联系人不能为空'),
  body('contactPhone').trim().notEmpty().withMessage('联系电话不能为空')
    .matches(/^1[3-9]\d{9}$/).withMessage('联系电话格式不正确'),
  body('contactEmail').trim().notEmpty().withMessage('联系邮箱不能为空')
    .isEmail().withMessage('邮箱格式不正确'),
  body('address').trim().notEmpty().withMessage('企业地址不能为空')
];

// 企业信息更新验证规则
const updateValidation = [
  body('name').trim().notEmpty().withMessage('企业名称不能为空'),
  body('legalPerson').trim().notEmpty().withMessage('法人代表不能为空'),
  body('contactPerson').trim().notEmpty().withMessage('联系人不能为空'),
  body('contactPhone').trim().notEmpty().withMessage('联系电话不能为空')
    .matches(/^1[3-9]\d{9}$/).withMessage('联系电话格式不正确'),
  body('contactEmail').trim().notEmpty().withMessage('联系邮箱不能为空')
    .isEmail().withMessage('邮箱格式不正确'),
  body('address').trim().notEmpty().withMessage('企业地址不能为空')
];

// 企业注册
router.post('/register',
  upload.fields([
    { name: 'businessLicense', maxCount: 1 },
    { name: 'otherDocuments', maxCount: 5 }
  ]),
  registerValidation,
  CompanyController.register
);

// 获取待审核企业列表
router.get('/pending', CompanyController.getPendingList);

// 获取企业列表（支持状态筛选）
router.get('/', CompanyController.getList);

// 获取企业详情
router.get('/:id', CompanyController.getDetail);

// 更新企业信息
router.put('/:id', updateValidation, CompanyController.update);

// 上传企业资质
router.post('/:id/qualifications',
  upload.single('qualification'),
  CompanyController.uploadQualification
);

// 删除企业资质
router.delete('/:id/qualifications',
  CompanyController.deleteQualification
);

// 审核通过企业
router.put('/:id/approve', CompanyController.approve);

// 驳回企业申请
router.put('/:id/reject',
  body('reason').trim().notEmpty().withMessage('驳回原因不能为空'),
  CompanyController.reject
);

// 获取企业系统配置
router.get('/:id/config', CompanyController.getConfig);

// 更新企业系统配置
router.put('/:id/config', CompanyController.updateConfig);

// 获取企业用户列表
router.get('/:id/users', CompanyController.getUsers);

// 创建企业用户
router.post('/:id/users', CompanyController.createUser);

// 更新企业用户
router.put('/:id/users/:userId', CompanyController.updateUser);

// 删除企业用户
router.delete('/:id/users/:userId', CompanyController.deleteUser);

// 获取企业日志
router.get('/:id/logs', CompanyController.getLogs);

// 导出企业日志
router.get('/:id/logs/export', CompanyController.exportLogs);

export default router;
