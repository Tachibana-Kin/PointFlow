<script setup lang="ts">
interface Props {
  count: number
  type: 'review' | 'punishment'
}
defineProps<Props>()
</script>

<template>
  <div v-if="count > 0" class="pending-badge" :class="type">
    <div class="dot" />
    <span class="text">
      {{ type === 'review' ? '待审核' : '待执行' }}: {{ count }}
    </span>
  </div>
</template>

<style scoped>
.pending-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm, 13px);
  font-weight: 500;
}
.pending-badge.review {
  background: color-mix(in srgb, var(--color-warning) 15%, transparent);
  color: var(--color-warning);
}
.pending-badge.punishment {
  background: color-mix(in srgb, var(--color-danger) 15%, transparent);
  color: var(--color-danger);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}
.review .dot { background: var(--color-warning); }
.punishment .dot { background: var(--color-danger); }
.text {
  white-space: nowrap;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}
</style>
