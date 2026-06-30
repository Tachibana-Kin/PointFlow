<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import * as usersApi from '@/api/users'
import type { User, UserRole } from '@/types'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseEmpty from '@/components/common/BaseEmpty.vue'
import BasePagination from '@/components/common/BasePagination.vue'

const users = ref<User[]>([])
const loading = ref(false)
const error = ref('')
const sortKey = ref<keyof User>('created_at')
const sortDir = ref<'asc' | 'desc'>('desc')
const search = ref('')
const page = ref(1)
const pageSize = 20

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingUser = ref<User | null>(null)
const deletingUser = ref<User | null>(null)

const form = ref({ name: '', email: '', role: 'member' as UserRole })

const sorted = computed(() => {
  const key = sortKey.value
  const dir = sortDir.value
  const filtered = users.value.filter(u =>
    u.name.toLowerCase().includes(search.value.toLowerCase()) ||
    u.email.toLowerCase().includes(search.value.toLowerCase())
  )
  return [...filtered].sort((a, b) => {
    const av = (a[key] ?? '') as string
    const bv = (b[key] ?? '') as string
    return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
  })
})

const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return sorted.value.slice(start, start + pageSize)
})

const total = computed(() => sorted.value.length)

function toggleSort(key: keyof User) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

function sortIcon(key: keyof User) {
  if (sortKey.value !== key) return '↕'
  return sortDir.value === 'asc' ? '↑' : '↓'
}

const roleBadge = (r: UserRole) => {
  if (r === 'super_admin') return 'info'
  if (r === 'manager') return 'warning'
  return 'default'
}

const roleLabel: Record<UserRole, string> = {
  super_admin: '超级管理员',
  manager: '管理员',
  member: '成员',
}

async function loadUsers() {
  loading.value = true
  error.value = ''
  try {
    users.value = await usersApi.list()
  } catch (e: any) {
    error.value = e.message || '加载用户列表失败'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.value = { name: '', email: '', role: 'member' }
  showCreateModal.value = true
}

function openEdit(user: User) {
  editingUser.value = user
  form.value = { name: user.name, email: user.email, role: user.role }
  showEditModal.value = true
}

function openDelete(user: User) {
  deletingUser.value = user
  showDeleteModal.value = true
}

async function createUser() {
  try {
    await usersApi.create(form.value)
    showCreateModal.value = false
    await loadUsers()
  } catch (e: any) {
    error.value = e.message || '创建用户失败'
  }
}

async function updateUser() {
  if (!editingUser.value) return
  try {
    await usersApi.update(editingUser.value.id, form.value)
    showEditModal.value = false
    editingUser.value = null
    await loadUsers()
  } catch (e: any) {
    error.value = e.message || '更新用户失败'
  }
}

async function deleteUser() {
  if (!deletingUser.value) return
  try {
    await usersApi.remove(deletingUser.value.id)
    showDeleteModal.value = false
    deletingUser.value = null
    await loadUsers()
  } catch (e: any) {
    error.value = e.message || '删除用户失败'
  }
}

onMounted(loadUsers)
</script>

<template>
  <div class="users-view">
    <header class="page-header">
      <h2 class="page-title">用户管理</h2>
      <BaseButton variant="primary" @click="openCreate">添加用户</BaseButton>
    </header>

    <div class="search-bar">
      <input v-model="search" class="search-input" placeholder="搜索用户名或邮箱..." />
    </div>

    <div v-if="error" class="error-toast">{{ error }}</div>

    <BaseCard v-if="loading && !users.length" padding="lg">
      <p class="loading-text">加载中...</p>
    </BaseCard>

    <BaseEmpty v-else-if="!users.length" text="暂无用户数据" />

    <template v-else>
      <div class="table-wrap">
        <table class="users-table">
          <thead>
            <tr>
              <th @click="toggleSort('name')">姓名 {{ sortIcon('name') }}</th>
              <th @click="toggleSort('email')">邮箱 {{ sortIcon('email') }}</th>
              <th @click="toggleSort('role')">角色 {{ sortIcon('role') }}</th>
              <th @click="toggleSort('created_at')">创建时间 {{ sortIcon('created_at') }}</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paged" :key="user.id">
              <td data-label="姓名">{{ user.name }}</td>
              <td data-label="邮箱">{{ user.email }}</td>
              <td data-label="角色">
                <BaseBadge :variant="roleBadge(user.role)">{{ roleLabel[user.role] }}</BaseBadge>
              </td>
              <td data-label="创建时间">{{ new Date(user.created_at).toLocaleDateString() }}</td>
              <td data-label="操作" class="actions-cell">
                <BaseButton size="sm" variant="ghost" @click="openEdit(user)">编辑</BaseButton>
                <BaseButton size="sm" variant="danger" @click="openDelete(user)">删除</BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-wrap">
        <BasePagination :page="page" :total="total" :page-size="pageSize" @change="page = $event" />
      </div>
    </template>

    <BaseModal :open="showCreateModal" title="添加用户" @close="showCreateModal = false">
      <div class="form-group">
        <label>姓名</label>
        <input v-model="form.name" class="form-input" placeholder="输入姓名" />
      </div>
      <div class="form-group">
        <label>邮箱</label>
        <input v-model="form.email" class="form-input" type="email" placeholder="输入邮箱" />
      </div>
      <div class="form-group">
        <label>角色</label>
        <select v-model="form.role" class="form-select">
          <option value="member">成员</option>
          <option value="manager">管理员</option>
          <option value="super_admin">超级管理员</option>
        </select>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="showCreateModal = false">取消</BaseButton>
        <BaseButton variant="primary" @click="createUser">确定</BaseButton>
      </template>
    </BaseModal>

    <BaseModal :open="showEditModal" title="编辑用户" @close="showEditModal = false">
      <div class="form-group">
        <label>姓名</label>
        <input v-model="form.name" class="form-input" />
      </div>
      <div class="form-group">
        <label>邮箱</label>
        <input v-model="form.email" class="form-input" readonly />
      </div>
      <div class="form-group">
        <label>角色</label>
        <select v-model="form.role" class="form-select">
          <option value="member">成员</option>
          <option value="manager">管理员</option>
          <option value="super_admin">超级管理员</option>
        </select>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="showEditModal = false">取消</BaseButton>
        <BaseButton variant="primary" @click="updateUser">保存</BaseButton>
      </template>
    </BaseModal>

    <BaseModal :open="showDeleteModal" title="确认删除" width="360px" @close="showDeleteModal = false">
      <p>确定要删除用户 <strong>{{ deletingUser?.name }}</strong> 吗？此操作不可撤销。</p>
      <template #footer>
        <BaseButton variant="secondary" @click="showDeleteModal = false">取消</BaseButton>
        <BaseButton variant="danger" @click="deleteUser">删除</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.users-view {
  max-width: 960px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
}

.search-bar {
  margin-bottom: var(--spacing-md);
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--color-primary);
}

.error-toast {
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  font-size: 0.875rem;
}

.loading-text {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--spacing-xl);
}

.table-wrap {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.users-table th {
  text-align: left;
  padding: 12px var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-weight: 500;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.users-table th:hover {
  color: var(--color-text);
}

.users-table td {
  padding: 12px var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.actions-cell {
  display: flex;
  gap: var(--spacing-xs);
}

.pagination-wrap {
  margin-top: var(--spacing-lg);
  display: flex;
  justify-content: center;
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-xs);
}

.form-input,
.form-select {
  width: 100%;
  padding: 8px 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  border-color: var(--color-primary);
}

.form-select {
  appearance: none;
  cursor: pointer;
}

@media (max-width: 640px) {
  .users-table thead {
    display: none;
  }

  .users-table tr {
    display: block;
    padding: var(--spacing-md) 0;
    border-bottom: 1px solid var(--color-border);
  }

  .users-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px var(--spacing-sm);
    border-bottom: none;
  }

  .users-table td::before {
    content: attr(data-label);
    font-weight: 500;
    color: var(--color-text-muted);
    margin-right: var(--spacing-md);
  }

  .actions-cell {
    justify-content: flex-end;
  }
}
</style>
