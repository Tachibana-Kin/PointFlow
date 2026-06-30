<script setup lang="ts">
withDefaults(defineProps<{
  padding?: string
  hover?: boolean
}>(), {
  padding: 'var(--spacing-md)',
  hover: false,
})
</script>

<template>
  <div class="base-card" :style="{ padding }" :class="{ hoverable: hover }">
    <slot />
  </div>
</template>

<style scoped>
.base-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.hoverable {
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.hoverable:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}
</style>
