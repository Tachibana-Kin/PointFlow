<script setup lang="ts">
import { reactive } from 'vue'
import type { Category } from '@/types'

interface Props {
  categories: Category[]
  statuses?: { label: string; value: string }[]
}
withDefaults(defineProps<Props>(), {
  statuses: () => [
    { label: '全部状态', value: '' },
    { label: '待审核', value: 'pending' },
    { label: '已通过', value: 'approved' },
    { label: '已拒绝', value: 'rejected' },
  ],
})

interface Filters {
  category_id: string
  status: string
  date_from: string
  date_to: string
  search: string
}
const filters = reactive<Filters>({
  category_id: '',
  status: '',
  date_from: '',
  date_to: '',
  search: '',
})

const emit = defineEmits<{ 'update:filters': [filters: Filters] }>()

function update() {
  emit('update:filters', { ...filters })
}
</script>

<template>
  <div class="filter-bar">
    <select v-model="filters.category_id" class="filter-select" @change="update">
      <option value="">全部分类</option>
      <option v-for="c in categories" :key="c.id" :value="c.id">
        {{ c.name }}
      </option>
    </select>

    <select v-model="filters.status" class="filter-select" @change="update">
      <option v-for="s in statuses" :key="s.value" :value="s.value">
        {{ s.label }}
      </option>
    </select>

    <input v-model="filters.date_from" type="date" class="filter-date" @change="update" />
    <span class="sep">-</span>
    <input v-model="filters.date_to" type="date" class="filter-date" @change="update" />

    <input
      v-model="filters.search"
      type="search"
      class="filter-search"
      placeholder="搜索…"
      @input="update"
    />
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  flex-wrap: wrap;
}
.filter-select,
.filter-date,
.filter-search {
  height: 36px;
  padding: 0 var(--spacing-sm);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: var(--font-size-sm, 13px);
  min-width: 0;
}
.filter-select { min-width: 100px; }
.filter-date { min-width: 130px; }
.filter-search {
  flex: 1;
  min-width: 150px;
}
.sep {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm, 13px);
}

@media (max-width: 480px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-select,
  .filter-date,
  .filter-search {
    width: 100%;
  }
  .sep {
    display: none;
  }
}
</style>
