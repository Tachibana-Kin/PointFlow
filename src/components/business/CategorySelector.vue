<script setup lang="ts">
import type { Category } from '@/types'

interface Props {
  categories: Category[]
  selected?: string
}
defineProps<Props>()

const emit = defineEmits<{ select: [categoryId: string] }>()
</script>

<template>
  <div class="category-grid">
    <button
      v-for="cat in categories"
      :key="cat.id"
      class="cat-card"
      :class="{ active: cat.id === selected }"
      @click="emit('select', cat.id)"
    >
      <span v-if="cat.icon" class="cat-icon">{{ cat.icon }}</span>
      <span class="cat-name">{{ cat.name }}</span>
    </button>
  </div>
</template>

<style scoped>
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: var(--spacing-sm);
}
.cat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) var(--spacing-sm);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s;
}
.cat-card:hover {
  border-color: var(--color-primary);
}
.cat-card.active {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
}
.cat-icon {
  font-size: var(--font-size-xl, 24px);
}
.cat-name {
  font-size: var(--font-size-sm, 13px);
  text-align: center;
}
</style>
