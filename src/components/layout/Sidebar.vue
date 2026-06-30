<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps<{
  collapsed?: boolean
}>()

defineEmits<{
  toggle: []
  close: []
}>()

const route = useRoute()
const auth = useAuthStore()

const navItems = computed(() => {
  const items = [
    { to: '/dashboard', label: '仪表盘', icon: '📊', roles: ['super_admin', 'manager', 'member'] },
    { to: '/records', label: '记录', icon: '📋', roles: ['super_admin', 'manager', 'member'] },
    { to: '/review', label: '审核', icon: '✅', roles: ['manager', 'super_admin'] },
    { to: '/rewards', label: '奖励', icon: '🎁', roles: ['super_admin', 'manager', 'member'] },
    { to: '/stats', label: '统计', icon: '📈', roles: ['super_admin', 'manager', 'member'] },
    { to: '/settings', label: '设置', icon: '⚙️', roles: ['super_admin', 'manager', 'member'] },
  ]
  return items.filter(item => item.roles.includes(auth.userRole ?? ''))
})

const roleLabel = computed(() => {
  const labels: Record<string, string> = { super_admin: '超级管理员', manager: '监督者', member: '成员' }
  return labels[auth.userRole ?? ''] ?? '未知'
})
</script>

<template>
  <aside class="sidebar" :class="{ collapsed }">
    <div class="sidebar-header">
      <span class="logo" @click="$emit('close')">积分管理系统</span>
      <button class="toggle-btn" @click="$emit('toggle')">☰</button>
    </div>
    <nav class="nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: route.path.startsWith(item.to) }"
        @click="$emit('close')"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </RouterLink>
    </nav>
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-name">{{ auth.user?.name ?? '用户' }}</div>
        <span class="role-badge" :class="auth.userRole">{{ roleLabel }}</span>
      </div>
      <button class="logout-btn" @click="auth.logout()">退出登录</button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: var(--color-bg-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.logo {
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--color-primary);
  white-space: nowrap;
}

.toggle-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 1.25rem;
  padding: var(--spacing-xs);
}

.nav {
  flex: 1;
  padding: var(--spacing-sm);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}

.nav-item:hover {
  background: var(--color-bg-elevated);
  color: var(--color-text);
}

.nav-item.active {
  background: var(--color-primary);
  color: #fff;
}

.nav-icon {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collapsed .nav-label {
  display: none;
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  position: sticky;
  bottom: 0;
  background: var(--color-bg-surface);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.user-name {
  font-size: 0.875rem;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  color: var(--color-text-muted);
  align-self: flex-start;
}

.role-badge.super_admin {
  background: var(--color-danger);
  color: #fff;
}

.role-badge.manager {
  background: var(--color-warning);
  color: #000;
}

.role-badge.member {
  background: var(--color-primary);
  color: #fff;
}

.logout-btn {
  width: 100%;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  transition: background 0.2s, color 0.2s;
}

.logout-btn:hover {
  background: var(--color-danger);
  color: #fff;
  border-color: var(--color-danger);
}

.collapsed .user-info,
.collapsed .logout-btn span {
  display: none;
}
</style>
