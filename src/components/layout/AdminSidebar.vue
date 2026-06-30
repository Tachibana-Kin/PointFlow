<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()

const navItems = computed(() => {
  const isSuper = auth.userRole === 'super_admin'
  const isManager = auth.userRole === 'manager'
  const items = [
    { to: '/admin/users', label: '用户管理', icon: '👥', show: isSuper },
    { to: '/admin/pairs', label: '配对管理', icon: '🔗', show: isSuper },
    { to: '/admin/categories', label: '分类管理', icon: '🏷️', show: isSuper },
    { to: '/admin/rules', label: '规则管理', icon: '📏', show: isManager },
    { to: '/admin/rewards', label: '奖励管理', icon: '🎁', show: isManager },
  ]
  return items.filter(item => item.show)
})
</script>

<template>
  <aside class="admin-sidebar">
    <div class="sidebar-header">
      <span class="logo">积分管理后台</span>
    </div>
    <nav class="nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: route.path.startsWith(item.to) }"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </RouterLink>
    </nav>
    <div class="sidebar-footer">
      <RouterLink to="/dashboard" class="back-link">← 返回仪表盘</RouterLink>
    </div>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  width: 240px;
  min-height: 100vh;
  background: var(--color-bg-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.logo {
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--color-danger);
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
  background: var(--color-danger);
  color: #fff;
}

.nav-icon {
  font-size: 1.125rem;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.back-link {
  display: block;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  text-decoration: none;
  padding: var(--spacing-sm) 0;
}

.back-link:hover {
  color: var(--color-primary);
}
</style>
