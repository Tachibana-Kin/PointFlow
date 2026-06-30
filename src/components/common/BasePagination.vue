<script setup lang="ts">
defineProps<{
  page: number
  total: number
  pageSize?: number
}>()
defineEmits<{
  'update:page': [value: number]
}>()

const pageSizeVal = 20
</script>

<template>
  <div v-if="total > 0" class="pagination">
    <button
      class="page-btn"
      :disabled="page <= 1"
      @click="$emit('update:page', page - 1)"
    >
      上一页
    </button>
    <span class="page-info">{{ page }} / {{ Math.ceil(total / (pageSize ?? pageSizeVal)) }}</span>
    <button
      class="page-btn"
      :disabled="page >= Math.ceil(total / (pageSize ?? pageSizeVal))"
      @click="$emit('update:page', page + 1)"
    >
      下一页
    </button>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
}
.page-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  font-family: inherit;
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.page-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: #fff;
}
.page-info {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
</style>
