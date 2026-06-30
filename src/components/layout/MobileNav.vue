<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const tabs = computed(() => {
  const items = [
    { to: '/dashboard', label: '仪表盘', icon: '📊' },
    { to: '/records', label: '记录', icon: '📋' },
    { to: '/review', label: '审核', icon: '✅', roles: ['manager', 'super_admin'] },
    { to: '/rewards', label: '奖励', icon: '🎁' },
    { to: '/stats', label: '统计', icon: '📈' },
  ]
  return items.filter(item => !item.roles || item.roles.includes(auth.userRole ?? ''))
})
</script>

<template>
  <nav class="mobile-nav">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="mobile-nav-item"
      :class="{ active: $route.path.startsWith(tab.to) }"
    >
      <span class="mobile-nav-icon">{{ tab.icon }}</span>
      <span class="mobile-nav-label">{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: var(--color-bg-surface);
  border-top: 1px solid var(--color-border);
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.mobile-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--spacing-xs) 0;
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.625rem;
  transition: color 0.2s;
}

.mobile-nav-item.active {
  color: var(--color-primary);
}

.mobile-nav-icon {
  font-size: 1.25rem;
}

.mobile-nav-label {
  line-height: 1;
}
</style>
