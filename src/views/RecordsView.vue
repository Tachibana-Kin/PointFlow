<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import FilterBar from '@/components/business/FilterBar.vue'
import RecordCard from '@/components/business/RecordCard.vue'
import BasePagination from '@/components/common/BasePagination.vue'
import { useRecordStore } from '@/stores/record'
import { useCategoryStore } from '@/stores/category'
import { useAuthStore } from '@/stores/auth'
import type { RecordStatus } from '@/types'

const router = useRouter()
const recordStore = useRecordStore()
const categoryStore = useCategoryStore()
const auth = useAuthStore()

const categoryId = ref('')
const status = ref('')
const search = ref('')
const currentPage = ref(1)

onMounted(async () => {
  await categoryStore.fetchCategories()
  await fetchRecords()
})

watch([categoryId, status, search, currentPage], () => {
  fetchRecords()
})

async function fetchRecords() {
  const filters: any = {
    page: currentPage.value,
    page_size: 20,
    ...(categoryId.value ? { category_id: categoryId.value } : {}),
    ...(status.value ? { status: status.value as RecordStatus } : {}),
  }
  // Member sees only their own records; manager sees only their pair's records
  if (auth.isMember && auth.user?.id) {
    filters.user_id = auth.user.id
  }
  await recordStore.fetchRecords(filters)
}

function goToDetail(id: string) {
  router.push(`/records/${id}`)
}
</script>

<template>
  <DefaultLayout>
    <div class="records-page">
      <div class="header-row">
        <h2 class="page-title">积分记录</h2>
      </div>

      <FilterBar
        :categories="categoryStore.categories"
        :category-id="categoryId"
        :status="status"
        :search="search"
        @update:category-id="categoryId = $event; currentPage = 1"
        @update:status="status = $event; currentPage = 1"
        @update:search="search = $event; currentPage = 1"
        @refresh="fetchRecords"
      />

      <div v-if="recordStore.loading && recordStore.records.length === 0" class="loading-state">
        加载中...
      </div>
      <div v-else-if="recordStore.records.length === 0" class="empty-state">
        <p>暂无记录</p>
      </div>
      <div v-else class="records-list">
        <RecordCard
          v-for="r in recordStore.records"
          :key="r.id"
          :record="r"
          @click="goToDetail(r.id)"
        />
      </div>

      <BasePagination
        :page="currentPage"
        :total="recordStore.total"
        :page-size="20"
        @update:page="currentPage = $event"
      />
    </div>
  </DefaultLayout>
</template>

<style scoped>
.records-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}
.loading-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-muted);
}
.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-muted);
  font-size: 0.9375rem;
}
.records-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>
