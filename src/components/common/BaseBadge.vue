<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default'
}>(), {
  variant: 'default',
})
</script>

<template>
  <span class="base-badge" :class="variant">
    <slot />
  </span>
</template>

<style scoped>
.base-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  line-height: 1.5;
}

.base-badge.success {
  background: rgba(34, 197, 94, 0.15);
  color: var(--color-success);
}

.base-badge.warning {
  background: rgba(234, 179, 8, 0.15);
  color: var(--color-warning);
}

.base-badge.danger {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-danger);
}

.base-badge.info {
  background: rgba(99, 102, 241, 0.15);
  color: var(--color-primary);
}

.base-badge.default {
  background: var(--color-bg-elevated);
  color: var(--color-text-muted);
}
</style>
