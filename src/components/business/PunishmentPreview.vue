<script setup lang="ts">
interface Props {
  punishment?: Record<string, number> | null
}
defineProps<Props>()
</script>

<template>
  <div v-if="punishment && Object.keys(punishment).length" class="punishment-preview">
    <span v-for="(amt, key, idx) in punishment" :key="key" class="item">
      {{ idx > 0 ? '/' : '' }}{{ key }} {{ amt }}
    </span>
  </div>
</template>

<style scoped>
.punishment-preview {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm, 13px);
  color: var(--color-text-muted);
}
</style>
