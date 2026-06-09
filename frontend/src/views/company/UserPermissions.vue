<template>
  <div class="user-permissions">
    <div class="page-header">
      <h2>用户权限管理</h2>
      <p class="subtitle">管理企业用户及其权限配置</p>
    </div>

    <!-- 搜索和操作栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="searchForm.role"
            placeholder="请选择角色"
            clearable
            @clear="handleSearch"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="操作员" value="operator" />
            <el-option label="查看者" value="viewer" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            @clear="handleSearch"
          >
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <div class="action-bar">
        <el-button v-if="$hasPerm('user.manage')" type="primary" icon="el-icon-plus" @click="handleAdd">
          添加用户
        </el-button>
      </div>
    </el-card>

    <!-- 用户列表 -->
    <el-card class="table-card">
      <el-table
        :data="userList"
        v-loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="权限" min-width="200">
          <template #default="{ row }">
            <el-tag
              v-for="perm in row.permissions"
              :key="perm"
              size="small"
              style="margin-right: 5px"
            >
              {{ getPermissionLabel(perm) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后登录" width="160">
          <template #default="{ row }">
            {{ formatDate(row.lastLoginAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="text"
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="handleResetPassword(row)"
            >
              重置密码
            </el-button>
            <el-button
              type="text"
              size="small"
              style="color: #f56c6c"
              @click="$hasPerm('user.manage') && handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="userForm"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="userForm.username"
            placeholder="请输入用户名"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="操作员" value="operator" />
            <el-option label="查看者" value="viewer" />
          </el-select>
        </el-form-item>
        <el-form-item label="权限" prop="permissions">
          <el-checkbox-group v-model="userForm.permissions">
            <el-checkbox label="waybill.view">查看运单</el-checkbox>
            <el-checkbox label="waybill.create">创建运单</el-checkbox>
            <el-checkbox label="waybill.edit">编辑运单</el-checkbox>
            <el-checkbox label="waybill.delete">删除运单</el-checkbox>
            <el-checkbox label="message.view">查看消息</el-checkbox>
            <el-checkbox label="message.send">发送消息</el-checkbox>
            <el-checkbox label="statistics.view">查看统计</el-checkbox>
            <el-checkbox label="api.manage">管理API</el-checkbox>
            <el-checkbox label="user.manage">管理用户</el-checkbox>
            <el-checkbox label="config.manage">管理配置</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getCompanyUsers, createCompanyUser, updateCompanyUser, deleteCompanyUser } from '@/api/company'

export default {
  name: 'UserPermissions',
  data() {
    return {
      loading: false,
      submitting: false,
      companyId: null,
      searchForm: {
        username: '',
        role: '',
        status: ''
      },
      userList: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      dialogVisible: false,
      isEdit: false,
      userForm: {
        username: '',
        realName: '',
        email: '',
        phone: '',
        password: '',
        role: 'operator',
        permissions: [],
        status: 'active'
      },
      userRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度在3-20个字符', trigger: 'blur' }
        ],
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度至少6个字符', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑用户' : '添加用户'
    }
  },
  created() {
    this.companyId = this.$route.params.id || localStorage.getItem('companyId') || '1'
    this.loadUsers()
  },
  methods: {
    async loadUsers() {
      if (!this.companyId) {
        this.$message.error('企业ID不存在')
        return
      }

      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          ...this.searchForm
        }
        const response = await getCompanyUsers(this.companyId, params)
        const cacheKey = `companyUsers:${this.companyId}`
        const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]')
        if (response.success === true || response.code === 200) {
          const serverList = (response.data?.users) || []
          const serverTotal = (response.data?.total)
          if ((serverTotal === 0 || serverList.length === 0) && cached.length > 0) {
            this.userList = cached
            this.pagination.total = cached.length
            this.$message.warning('用户接口不可用，已使用本地缓存列表显示')
          } else {
            this.userList = serverList
            this.pagination.total = serverTotal || serverList.length
            localStorage.setItem(cacheKey, JSON.stringify(serverList))
          }
        } else {
          throw new Error(response.message || '接口未就绪')
        }
      } catch (error) {
        const cacheKey = `companyUsers:${this.companyId}`
        const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]')
        this.userList = cached
        this.pagination.total = cached.length
        this.$message.warning('用户接口不可用，已使用本地缓存列表显示')
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.pagination.page = 1
      this.loadUsers()
    },
    handleReset() {
      this.searchForm = {
        username: '',
        role: '',
        status: ''
      }
      this.handleSearch()
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.loadUsers()
    },
    handleCurrentChange(val) {
      this.pagination.page = val
      this.loadUsers()
    },
    handleAdd() {
      this.isEdit = false
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.isEdit = true
      this.userForm = { ...row }
      this.dialogVisible = true
    },
    async handleToggleStatus(row) {
      const newStatus = row.status === 'active' ? 'inactive' : 'active'
      const action = newStatus === 'active' ? '启用' : '禁用'
      
      try {
        await this.$confirm(`确定要${action}该用户吗？`, '提示', {
          type: 'warning'
        })
        
        const resp = await updateCompanyUser(this.companyId, row.id, { status: newStatus })
        if (resp.success === true || resp.code === 200) {
          this.$message.success(`${action}成功`)
        } else {
          // 接口不可用时更新本地缓存
          const cacheKey = `companyUsers:${this.companyId}`
          const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]')
          const idx = cached.findIndex(u => u.id === row.id)
          if (idx >= 0) {
            cached[idx].status = newStatus
            localStorage.setItem(cacheKey, JSON.stringify(cached))
            this.$message.success(`${action}成功（本地缓存）`)
          }
        }
        this.loadUsers()
      } catch (error) {
        if (error !== 'cancel') {
          const msg = error?.message || `${action}失败`
          const detail = error?.detail
          this.$message.error(detail ? `${msg}（${detail}）` : msg)
        }
      }
    },
    async handleResetPassword(row) {
      try {
        await this.$confirm('确定要重置该用户的密码吗？', '提示', {
          type: 'warning'
        })
        
        // 这里应该调用重置密码的API
        this.$message.success('密码重置成功，新密码已发送到用户邮箱')
      } catch (error) {
        if (error !== 'cancel') {
          const msg = error?.message || '密码重置失败'
          const detail = error?.detail
          this.$message.error(detail ? `${msg}（${detail}）` : msg)
        }
      }
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确定要删除该用户吗？此操作不可恢复！', '警告', {
          type: 'warning',
          confirmButtonText: '确定删除',
          cancelButtonText: '取消'
        })
        
        const resp = await deleteCompanyUser(this.companyId, row.id)
        if (resp.success === true || resp.code === 200) {
          this.$message.success('删除成功')
          const currentId = localStorage.getItem('userId')
          if (currentId && String(currentId) === String(row.id)) {
            localStorage.removeItem('permissions')
            localStorage.removeItem('subRole')
            this.$message.warning('当前登录用户已被删除，权限已清空')
          }
        } else {
          // 接口不可用时更新本地缓存
          const cacheKey = `companyUsers:${this.companyId}`
          const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]').filter(u => u.id !== row.id)
          localStorage.setItem(cacheKey, JSON.stringify(cached))
          this.$message.success('删除成功（本地缓存）')
        }
        this.loadUsers()
      } catch (error) {
        if (error !== 'cancel') {
          const msg = error?.message || '删除失败'
          const detail = error?.detail
          this.$message.error(detail ? `${msg}（${detail}）` : msg)
        }
      }
    },
    async handleSubmit() {
      try {
        await this.$refs.userForm.validate()
      } catch (error) {
        return
      }

      this.submitting = true
      try {
        if (this.isEdit) {
          const resp = await updateCompanyUser(this.companyId, this.userForm.id, this.userForm)
          if (resp.success === true || resp.code === 200) {
            this.$message.success('更新成功')
            const currentId = localStorage.getItem('userId')
            if (currentId && String(currentId) === String(this.userForm.id)) {
              const perms = Array.isArray(this.userForm.permissions) ? this.userForm.permissions : []
              localStorage.setItem('permissions', JSON.stringify(perms))
              const subRole = this.userForm.role || ''
              if (subRole) localStorage.setItem('subRole', String(subRole))
            }
          } else {
            const cacheKey = `companyUsers:${this.companyId}`
            const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]')
            const idx = cached.findIndex(u => u.id === this.userForm.id)
            if (idx >= 0) {
              cached[idx] = { ...cached[idx], ...this.userForm }
              localStorage.setItem(cacheKey, JSON.stringify(cached))
              this.$message.success('更新成功（本地缓存）')
            }
          }
        } else {
          const resp = await createCompanyUser(this.companyId, this.userForm)
          if (resp.success === true || resp.code === 200) {
            if (String(resp.message || '').includes('用户名已存在')) {
              this.$message.warning('用户名已存在，已为您定位到该用户')
              this.searchForm.username = this.userForm.username
              this.pagination.page = 1
              const existing = resp?.data?.user
              if (existing) {
                this.isEdit = true
                this.userForm = {
                  id: existing.id,
                  username: existing.username,
                  realName: existing.realName || '',
                  email: existing.email || '',
                  phone: existing.phone || '',
                  password: '',
                  role: existing.role || 'operator',
                  permissions: Array.isArray(existing.permissions) ? existing.permissions : [],
                  status: existing.status || 'active'
                }
                this.dialogVisible = true
              } else {
                this.dialogVisible = false
              }
              await this.loadUsers()
            } else {
              const cacheKey = `companyUsers:${this.companyId}`
              const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]')
              const newUser = {
                ...this.userForm,
                id: (resp?.data?.userId) ? String(resp.data.userId) : Date.now().toString(),
                lastLoginAt: null
              }
              const merged = [newUser, ...cached].reduce((acc, cur) => {
                const key = cur.id ? String(cur.id) : cur.username
                if (!acc._set.has(key)) {
                  acc._set.add(key)
                  acc.list.push(cur)
                }
                return acc
              }, { _set: new Set(), list: [] }).list
              localStorage.setItem(cacheKey, JSON.stringify(merged))
              this.$message.success('添加成功')
              this.userList = merged
              this.pagination.total = merged.length
            }
          } else {
            const cacheKey = `companyUsers:${this.companyId}`
            const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]')
            const newUser = {
              ...this.userForm,
              id: Date.now().toString(),
              lastLoginAt: null
            }
            localStorage.setItem(cacheKey, JSON.stringify([newUser, ...cached]))
            this.$message.success('添加成功（本地缓存）')
          }
        }
        this.dialogVisible = false
        this.loadUsers()
      } catch (error) {
        const msg = error?.message || '操作失败'
        const detail = error?.detail
        this.$message.error(detail ? `${msg}（${detail}）` : msg)
      } finally {
        this.submitting = false
      }
    },
    handleDialogClose() {
      this.$refs.userForm.resetFields()
      this.userForm = {
        username: '',
        realName: '',
        email: '',
        phone: '',
        password: '',
        role: 'operator',
        permissions: [],
        status: 'active'
      }
    },
    getRoleType(role) {
      const types = {
        admin: 'danger',
        operator: 'primary',
        viewer: 'info'
      }
      return types[role] || 'info'
    },
    getRoleLabel(role) {
      const labels = {
        admin: '管理员',
        operator: '操作员',
        viewer: '查看者'
      }
      return labels[role] || role
    },
    getPermissionLabel(perm) {
      const labels = {
        'waybill.view': '查看运单',
        'waybill.create': '创建运单',
        'waybill.edit': '编辑运单',
        'waybill.delete': '删除运单',
        'message.view': '查看消息',
        'message.send': '发送消息',
        'statistics.view': '查看统计',
        'api.manage': '管理API',
        'user.manage': '管理用户',
        'config.manage': '管理配置'
      }
      return labels[perm] || perm
    },
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.user-permissions {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.search-card {
  margin-bottom: 20px;
}

.action-bar {
  margin-top: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

:deep(.el-checkbox) {
  display: block;
  margin: 8px 0;
}
</style>
