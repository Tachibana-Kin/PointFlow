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
  <div class="category-tree">
    <button
      v-for="cat in categories"
      :key="cat.id"
      class="tree-item"
      :class="{ active: cat.id === selected }"
      @click="emit('select', cat.id)"
    >
      <span
        v-if="cat.color"
        class="color-dot"
        :style="{ background: cat.color }"
      />
      <span v-if="cat.icon" class="item-icon">{{ cat.icon }}</span>
      <span class="item-name">{{ cat.name }}</span>
    </button>
    <div v-if="!categories.length" class="empty">暂无分类</div>
  </div>
</template>

<style scoped>
.category-tree {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tree-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}
.tree-item:hover {
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
}
.tree-item.active {
  background: color-mix(in srgb, var(--color-primary) 20%, transparent);
  color: var(--color-primary);
  font-weight: 600;
}
.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.item-icon {
  font-size: var(--font-size-md, 15px);
}
.item-name {
  font-size: var(--font-size-md, 15px);
}
.empty {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm, 13px);
  padding: var(--spacing-md);
  text-align: center;
}
</style>
