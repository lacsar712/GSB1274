import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页总览' }
  },
  {
    path: '/401',
    name: 'Unauthorized',
    component: () => import('@/views/error/Unauthorized.vue'),
    meta: { title: '未授权' }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/Forbidden.vue'),
    meta: { title: '无权限' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/company',
    name: 'Company',
    children: [
      {
        path: 'register',
        name: 'CompanyRegister',
        component: () => import('@/views/company/Register.vue'),
        meta: { title: '企业注册' }
      },
      {
        path: 'audit',
        name: 'CompanyAudit',
        component: () => import('@/views/company/Audit.vue'),
        meta: { title: '企业审核' }
      },
      {
        path: 'status',
        name: 'CompanyStatus',
        component: () => import('@/views/company/Status.vue'),
        meta: { title: '审核状态' }
      },
      {
        path: ':id',
        name: 'CompanyDetail',
        component: () => import('@/views/company/Detail.vue'),
        meta: { title: '企业信息详情' }
      },
      {
        path: ':id/edit',
        name: 'CompanyEdit',
        component: () => import('@/views/company/Edit.vue'),
        meta: { title: '编辑企业信息' }
      },
      {
        path: ':id/qualifications',
        name: 'CompanyQualifications',
        component: () => import('@/views/company/Qualifications.vue'),
        meta: { title: '企业资质管理' }
      },
      {
        path: ':id/config',
        name: 'SystemConfig',
        component: () => import('@/views/company/SystemConfig.vue'),
        meta: { title: '系统配置' }
      },
      {
        path: ':id/users',
        name: 'UserPermissions',
        component: () => import('@/views/company/UserPermissions.vue'),
        meta: { title: '用户权限管理' }
      },
      {
        path: ':id/logs',
        name: 'SystemLogs',
        component: () => import('@/views/company/SystemLogs.vue'),
        meta: { title: '系统日志' }
      }
    ]
  },
  {
    path: '/api',
    name: 'Api',
    children: [
      {
        path: 'docs',
        name: 'ApiDocs',
        component: () => import('@/views/api/Docs.vue'),
        meta: { title: 'API文档' }
      },
      {
        path: 'keys',
        name: 'ApiKeys',
        component: () => import('@/views/api/Keys.vue'),
        meta: { title: 'API密钥管理' }
      },
      {
        path: 'test',
        name: 'ApiTest',
        component: () => import('@/views/api/Test.vue'),
        meta: { title: 'API对接测试' }
      }
    ]
  },
  {
    path: '/waybill',
    name: 'Waybill',
    children: [
      {
        path: 'list',
        name: 'WaybillList',
        component: () => import('@/views/waybill/List.vue'),
        meta: { title: '运单管理' }
      },
      {
        path: 'create',
        name: 'WaybillCreate',
        component: () => import('@/views/waybill/Create.vue'),
        meta: { title: '创建运单' }
      },
      {
        path: 'detail/:id',
        name: 'WaybillDetail',
        component: () => import('@/views/waybill/Detail.vue'),
        meta: { title: '运单详情' }
      }
    ]
  },
  {
    path: '/carriers',
    name: 'Carriers',
    children: [
      {
        path: '',
        name: 'CarrierList',
        component: () => import('@/views/carrier/List.vue'),
        meta: { title: '承运人管理' }
      },
      {
        path: 'create',
        name: 'CarrierCreate',
        component: () => import('@/views/carrier/Create.vue'),
        meta: { title: '添加承运人' }
      },
      {
        path: ':id',
        name: 'CarrierDetail',
        component: () => import('@/views/carrier/Detail.vue'),
        meta: { title: '承运人详情' }
      },
      {
        path: ':id/edit',
        name: 'CarrierEdit',
        component: () => import('@/views/carrier/Create.vue'),
        meta: { title: '编辑承运人' }
      }
    ]
  },
  {
    path: '/vehicles',
    name: 'Vehicles',
    children: [
      {
        path: '',
        name: 'VehicleList',
        component: () => import('@/views/vehicle/List.vue'),
        meta: { title: '车辆管理' }
      },
      {
        path: 'create',
        name: 'VehicleCreate',
        component: () => import('@/views/vehicle/Create.vue'),
        meta: { title: '添加车辆' }
      },
      {
        path: ':id',
        name: 'VehicleDetail',
        component: () => import('@/views/vehicle/Detail.vue'),
        meta: { title: '车辆详情' }
      },
      {
        path: ':id/edit',
        name: 'VehicleEdit',
        component: () => import('@/views/vehicle/Create.vue'),
        meta: { title: '编辑车辆' }
      }
    ]
  },
  {
    path: '/drivers',
    name: 'Drivers',
    children: [
      {
        path: '',
        name: 'DriverList',
        component: () => import('@/views/driver/List.vue'),
        meta: { title: '驾驶员管理' }
      },
      {
        path: 'create',
        name: 'DriverCreate',
        component: () => import('@/views/driver/Create.vue'),
        meta: { title: '添加驾驶员' }
      },
      {
        path: ':id',
        name: 'DriverDetail',
        component: () => import('@/views/driver/Detail.vue'),
        meta: { title: '驾驶员详情' }
      },
      {
        path: ':id/edit',
        name: 'DriverEdit',
        component: () => import('@/views/driver/Create.vue'),
        meta: { title: '编辑驾驶员' }
      }
    ]
  },
  {
    path: '/statistics',
    name: 'Statistics',
    children: [
      {
        path: 'overview',
        name: 'StatisticsOverview',
        component: () => import('@/views/statistics/Overview.vue'),
        meta: { title: '企业运营概览' }
      },
      {
        path: 'revenue',
        name: 'StatisticsRevenue',
        component: () => import('@/views/statistics/Revenue.vue'),
        meta: { title: '收入统计分析' }
      }
    ]
  },
  {
    path: '/companies/:id/messages',
    name: 'Messages',
    children: [
      {
        path: '',
        name: 'MessageList',
        component: () => import('@/views/message/List.vue'),
        meta: { title: '消息中心' }
      },
      {
        path: ':msgId',
        name: 'MessageDetail',
        component: () => import('@/views/message/Detail.vue'),
        meta: { title: '消息详情' }
      },
      {
        path: 'settings',
        name: 'MessageSettings',
        component: () => import('@/views/message/Settings.vue'),
        meta: { title: '消息设置' }
      }
    ]
  },
  {
    path: '/user/:id',
    name: 'User',
    children: [
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/Profile.vue'),
        meta: { title: '个人信息' }
      },
      {
        path: 'password',
        name: 'ChangePassword',
        component: () => import('@/views/user/ChangePassword.vue'),
        meta: { title: '修改密码' }
      },
      {
        path: 'preferences',
        name: 'UserPreferences',
        component: () => import('@/views/user/Preferences.vue'),
        meta: { title: '偏好设置' }
      }
    ]
  },
  {
    path: '/tags',
    name: 'Tags',
    children: [
      {
        path: '',
        name: 'TagList',
        component: () => import('@/views/tag/List.vue'),
        meta: { title: '标签库' }
      }
    ]
  },
  {
    path: '/indicators',
    name: 'Indicators',
    children: [
      {
        path: '',
        name: 'IndicatorList',
        component: () => import('@/views/indicator/List.vue'),
        meta: { title: '指标库' }
      },
      {
        path: 'create',
        name: 'IndicatorCreate',
        component: () => import('@/views/indicator/Create.vue'),
        meta: { title: '创建指标' }
      },
      {
        path: 'edit/:id',
        name: 'IndicatorEdit',
        component: () => import('@/views/indicator/Edit.vue'),
        meta: { title: '编辑指标' }
      }
    ]
  },
  {
    path: '/risks',
    name: 'Risks',
    children: [
      {
        path: '',
        name: 'RiskList',
        component: () => import('@/views/risk/List.vue'),
        meta: { title: '风险库' }
      },
      {
        path: 'create',
        name: 'RiskCreate',
        component: () => import('@/views/risk/Create.vue'),
        meta: { title: '创建风险' }
      },
      {
        path: ':id',
        name: 'RiskDetail',
        component: () => import('@/views/risk/Detail.vue'),
        meta: { title: '风险详情' }
      },
      {
        path: 'edit/:id',
        name: 'RiskEdit',
        component: () => import('@/views/risk/Create.vue'),
        meta: { title: '编辑风险' }
      }
    ]
  },
  {
    path: '/graph',
    name: 'Graph',
    children: [
      {
        path: 'visualization',
        name: 'GraphVisualization',
        component: () => import('@/views/graph/Visualization.vue'),
        meta: { title: '图数据可视化' }
      },
      {
        path: 'query',
        name: 'GraphQuery',
        component: () => import('@/views/graph/Query.vue'),
        meta: { title: '图数据查询' }
      }
    ]
  },
  {
    path: '/dictionary',
    name: 'Dictionary',
    children: [
      {
        path: 'list',
        name: 'DictionaryList',
        component: () => import('@/views/dictionary/List.vue'),
        meta: { title: '字典管理' }
      },
      {
        path: 'create',
        name: 'DictionaryCreate',
        component: () => import('@/views/dictionary/Create.vue'),
        meta: { title: '新增字典' }
      },
      {
        path: 'detail/:id',
        name: 'DictionaryDetail',
        component: () => import('@/views/dictionary/Detail.vue'),
        meta: { title: '字典详情' }
      },
      {
        path: 'edit/:id',
        name: 'DictionaryEdit',
        component: () => import('@/views/dictionary/Create.vue'),
        meta: { title: '编辑字典' }
      }
    ]
  },
  {
    path: '/company-configs',
    name: 'CompanyConfigs',
    children: [
      {
        path: '',
        name: 'CompanyConfigList',
        component: () => import('@/views/companyConfig/List.vue'),
        meta: { title: '企业配置管理' }
      },
      {
        path: ':id',
        name: 'CompanyConfigDetail',
        component: () => import('@/views/companyConfig/Detail.vue'),
        meta: { title: '企业配置详情' }
      }
    ]
  },
  {
    path: '/operations',
    name: 'Operations',
    children: [
      {
        path: 'dashboard',
        name: 'OperationsDashboard',
        component: () => import('@/views/operations/Dashboard.vue'),
        meta: { title: '运营统计分析' }
      },
      {
        path: 'revenue',
        name: 'OperationsRevenue',
        component: () => import('@/views/operations/Revenue.vue'),
        meta: { title: '运营收入统计' }
      },
      {
        path: 'messages',
        name: 'OperationsMessageList',
        component: () => import('@/views/operations/MessageList.vue'),
        meta: { title: '运营消息中心' }
      },
      {
        path: 'messages/:msgId',
        name: 'OperationsMessageDetail',
        component: () => import('@/views/operations/MessageDetail.vue'),
        meta: { title: '运营消息详情' }
      },
      {
        path: 'monitoring',
        name: 'OperationsMonitoring',
        component: () => import('@/views/operations/MonitoringDashboard.vue'),
        meta: { title: '运维监控' }
      },
      {
        path: 'performance',
        name: 'OperationsPerformance',
        component: () => import('@/views/operations/PerformanceMonitoring.vue'),
        meta: { title: '性能监控' }
      },
      {
        path: 'system/config',
        name: 'OperationsSystemConfig',
        component: () => import('@/views/operations/SystemConfig.vue'),
        meta: { title: '运营系统管理' }
      },
      {
        path: 'system/logs',
        name: 'OperationsSystemLogs',
        component: () => import('@/views/operations/SystemLogs.vue'),
        meta: { title: '运营系统日志' }
      }
      ,
      {
        path: 'user/center',
        name: 'OperationsUserCenter',
        component: () => import('@/views/operations/UserCenter.vue'),
        meta: { title: '运营用户个人管理中心' }
      }
    ]
  },
  {
    path: '/regulation',
    name: 'Regulation',
    children: [
      {
        path: 'business',
        name: 'RegulationBusinessList',
        component: () => import('@/views/regulation/BusinessList.vue'),
        meta: { title: '监管业务管理' }
      },
      {
        path: 'business/:id',
        name: 'RegulationBusinessDetail',
        component: () => import('@/views/regulation/BusinessDetail.vue'),
        meta: { title: '监管业务详情' }
      },
      {
        path: 'inspections',
        name: 'RegulationInspectionList',
        component: () => import('@/views/regulation/InspectionList.vue'),
        meta: { title: '抽检管理' }
      },
      {
        path: 'inspections/:id',
        name: 'RegulationInspectionDetail',
        component: () => import('@/views/regulation/InspectionDetail.vue'),
        meta: { title: '抽检详情' }
      },
      {
        path: 'waybills',
        name: 'RegulationWaybillList',
        component: () => import('@/views/regulation/WaybillList.vue'),
        meta: { title: '监管运单管理' }
      },
      {
        path: 'waybills/:id',
        name: 'RegulationWaybillDetail',
        component: () => import('@/views/regulation/WaybillDetail.vue'),
        meta: { title: '监管运单详情' }
      },
      {
        path: 'statistics',
        name: 'RegulationStatistics',
        component: () => import('@/views/regulation/Statistics.vue'),
        meta: { title: '监管统计分析' }
      },
      {
        path: 'dashboard',
        name: 'RegulationDashboard',
        component: () => import('@/views/regulation/Dashboard.vue'),
        meta: { title: '监管大屏' }
      },
      {
        path: 'messages',
        name: 'RegulationMessages',
        component: () => import('@/views/regulation/Messages.vue'),
        meta: { title: '监管消息中心' }
      },
      {
        path: 'system/config',
        name: 'RegulationSystemConfig',
        component: () => import('@/views/regulation/SystemConfig.vue'),
        meta: { title: '监管系统管理' }
      },
      {
        path: 'user/center',
        name: 'RegulationUserCenter',
        component: () => import('@/views/regulation/UserCenter.vue'),
        meta: { title: '监管用户个人管理中心' }
      }
    ]
  },
  {
    path: '/delivery',
    name: 'Delivery',
    children: [
      {
        path: 'dashboard',
        name: 'DeliveryDashboard',
        component: () => import('@/views/delivery/Dashboard.vue'),
        meta: { title: '末端配送服务仪表板' }
      },
      {
        path: 'list',
        name: 'DeliveryList',
        component: () => import('@/views/delivery/List.vue'),
        meta: { title: '配送订单管理' }
      },
      {
        path: 'create',
        name: 'DeliveryCreate',
        component: () => import('@/views/delivery/Create.vue'),
        meta: { title: '新建配送订单' }
      },
      {
        path: 'edit/:id',
        name: 'DeliveryEdit',
        component: () => import('@/views/delivery/Edit.vue'),
        meta: { title: '编辑配送订单' }
      },
      {
        path: 'detail/:id',
        name: 'DeliveryDetail',
        component: () => import('@/views/delivery/Detail.vue'),
        meta: { title: '配送订单详情' }
      }
    ]
  },
  {
    path: '/vehicle-safety',
    name: 'VehicleSafety',
    children: [
      {
        path: 'dashboard',
        name: 'VehicleSafetyDashboard',
        component: () => import('@/views/vehicleSafety/Dashboard.vue'),
        meta: { title: '车辆安全监控' }
      },
      {
        path: 'list',
        name: 'VehicleSafetyList',
        component: () => import('@/views/vehicleSafety/List.vue'),
        meta: { title: '安全事件管理' }
      },
      {
        path: 'detail/:id',
        name: 'VehicleSafetyDetail',
        component: () => import('@/views/vehicleSafety/Detail.vue'),
        meta: { title: '安全事件详情' }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫：标题、鉴权与角色校验
router.beforeEach((to, _from, next) => {
  // 标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 网络货运智能服务系统`;
  } else {
    document.title = '网络货运智能服务系统';
  }
  // 公共页放行
  const publicPaths = ['/', '/login', '/401', '/403'];
  if (publicPaths.includes(to.path)) return next();
  // 简单鉴权：本地token存在
  const token = localStorage.getItem('token');
  if (!token) return next('/401');
  // 角色校验
  const role = localStorage.getItem('role') || '';
  if (role === 'admin') return next();
  // 权限校验（公司域）
  const perms = (() => {
    try {
      const raw = localStorage.getItem('permissions') || '[]';
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  })();
  const requirePerm = (p) => {
    // 基于路径的最小权限映射
    if (p.startsWith('/waybill')) {
      if (p.includes('/create')) return 'waybill.create';
      if (p.includes('/edit/')) return 'waybill.edit';
      if (p.includes('/detail/')) return 'waybill.view';
      return 'waybill.view';
    }
    if (p.startsWith('/companies') && p.includes('/messages')) return 'message.view';
    if (p.startsWith('/statistics')) return 'statistics.view';
    if (p.startsWith('/api')) return 'api.manage';
    if (p.startsWith('/company/') && p.includes('/users')) return 'user.manage';
    if (p.startsWith('/company/') && p.includes('/config')) return 'config.manage';
    return null;
  };
  const needRole = (() => {
    const p = to.path;
    if (p.startsWith('/operations')) return 'operator';
    if (p.startsWith('/regulation')) return 'regulator';
    const companyPrefixes = [
      '/company', '/companies', '/waybill', '/carriers', '/vehicles', '/drivers',
      '/tags', '/indicators', '/dictionary', '/company-configs', '/statistics',
      '/vehicle-safety', '/delivery', '/graph', '/api', '/user'
    ];
    if (companyPrefixes.some(prefix => p.startsWith(prefix))) return 'company';
    return '';
  })();
  if (needRole && needRole !== role) return next('/403');
  // 当为公司域时做细粒度权限校验
  if (needRole === 'company') {
    const rp = requirePerm(to.path);
    if (rp && !perms.includes(rp)) {
      return next('/403');
    }
  }
  next();
});

export default router;
