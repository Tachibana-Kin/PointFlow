<script setup lang="ts">
interface Props {
  streak: number
}
defineProps<Props>()
</script>

<template>
  <div class="streak-badge">
    <span class="fire">🔥</span>
    <span class="count">{{ streak }}</span>
    <span class="unit">天</span>
  </div>
</template>

<style scoped>
.streak-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: var(--spacing-xs) var(--spacing-md);
}
.fire {
  font-size: var(--font-size-lg, 18px);
}
.count {
  font-weight: 700;
  font-size: var(--font-size-lg, 18px);
  color: var(--color-warning);
}
.unit {
  font-size: var(--font-size-sm, 13px);
  color: var(--color-text-muted);
}
</style>
