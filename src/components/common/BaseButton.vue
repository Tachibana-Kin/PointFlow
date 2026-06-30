<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <button
    class="base-btn"
    :class="[variant ?? 'primary', size ?? 'md', { block, loading }]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="spinner" />
    <slot />
  </button>
</template>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  border: none;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  white-space: nowrap;
}
.base-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.base-btn.sm { padding: var(--spacing-xs) var(--spacing-sm); font-size: 0.75rem; }
.base-btn.md { padding: var(--spacing-sm) var(--spacing-lg); font-size: 0.875rem; }
.base-btn.lg { padding: var(--spacing-md) var(--spacing-xl); font-size: 1rem; }
.base-btn.block { width: 100%; }
.primary { background: var(--color-primary); color: #fff; }
.primary:hover:not(:disabled) { background: var(--color-primary-hover); }
.secondary { background: var(--color-bg-elevated); color: var(--color-text); border: 1px solid var(--color-border); }
.secondary:hover:not(:disabled) { background: var(--color-border); }
.danger { background: var(--color-danger); color: #fff; }
.danger:hover:not(:disabled) { background: #dc2626; }
.ghost { background: transparent; color: var(--color-text-muted); }
.ghost:hover:not(:disabled) { background: var(--color-bg-elevated); color: var(--color-text); }
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
