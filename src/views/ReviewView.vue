<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import RecordCard from '@/components/business/RecordCard.vue'
import ReviewModal from '@/components/business/ReviewModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useRecordStore } from '@/stores/record'

const recordStore = useRecordStore()

const activeTab = ref<'pending' | 'reviewed'>('pending')
const showReviewModal = ref(false)
const selectedRecordId = ref<string | undefined>(undefined)
const selectedIds = ref<Set<string>>(new Set())
const batchMode = ref(false)

const displayRecords = computed(() => {
  if (activeTab.value === 'pending') {
    return recordStore.records.filter((r) => r.status === 'pending')
  }
  return recordStore.records.filter((r) => r.status !== 'pending')
})

onMounted(async () => {
  await recordStore.fetchRecords({ page: 1, page_size: 50 })
})

function openReview(id: string) {
  selectedRecordId.value = id
  showReviewModal.value = true
}

async function handleApprove(remark: string) {
  if (!selectedRecordId.value) return
  await recordStore.reviewRecord(selectedRecordId.value, {
    status: 'approved',
    remark: remark || undefined,
  })
  showReviewModal.value = false
  selectedRecordId.value = undefined
}

async function handleReject(remark: string) {
  if (!selectedRecordId.value) return
  await recordStore.reviewRecord(selectedRecordId.value, {
    status: 'rejected',
    remark: remark || undefined,
  })
  showReviewModal.value = false
  selectedRecordId.value = undefined
}

function toggleSelect(id: string) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

async function batchApprove() {
  for (const id of selectedIds.value) {
    await recordStore.reviewRecord(id, { status: 'approved' })
  }
  selectedIds.value = new Set()
  batchMode.value = false
}

async function batchReject() {
  for (const id of selectedIds.value) {
    await recordStore.reviewRecord(id, { status: 'rejected' })
  }
  selectedIds.value = new Set()
  batchMode.value = false
}
</script>

<template>
  <DefaultLayout>
    <div class="review-page">
      <div class="header-row">
        <h2 class="page-title">审核</h2>
        <button
          class="batch-toggle"
          :class="{ active: batchMode }"
          @click="batchMode = !batchMode"
        >
          {{ batchMode ? '退出批量' : '批量审核' }}
        </button>
      </div>

      <div class="tabs">
        <button
          class="tab"
          :class="{ active: activeTab === 'pending' }"
          @click="activeTab = 'pending'"
        >
          待审核
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'reviewed' }"
          @click="activeTab = 'reviewed'"
        >
          已审核
        </button>
      </div>

      <div v-if="batchMode && selectedIds.size > 0" class="batch-actions">
        <BaseButton variant="primary" size="sm" @click="batchApprove">
          批量通过 ({{ selectedIds.size }})
        </BaseButton>
        <BaseButton variant="danger" size="sm" @click="batchReject">
          批量拒绝 ({{ selectedIds.size }})
        </BaseButton>
      </div>

      <div v-if="recordStore.loading && displayRecords.length === 0" class="loading-state">
        加载中...
      </div>
      <div v-else-if="displayRecords.length === 0" class="empty-state">
        <p>{{ activeTab === 'pending' ? '暂无待审核记录' : '暂无已审核记录' }}</p>
      </div>
      <div v-else class="records-list">
        <div
          v-for="r in displayRecords"
          :key="r.id"
          class="record-wrapper"
          :class="{ selected: selectedIds.has(r.id) }"
        >
          <label v-if="batchMode && r.status === 'pending'" class="checkbox-label">
            <input
              type="checkbox"
              :checked="selectedIds.has(r.id)"
              @change="toggleSelect(r.id)"
            />
          </label>
          <RecordCard
            :record="r"
            :show-review-actions="!batchMode && r.status === 'pending'"
            @click="!batchMode ? openReview(r.id) : toggleSelect(r.id)"
            @approve="openReview(r.id)"
            @reject="openReview(r.id)"
          />
        </div>
      </div>
    </div>

    <ReviewModal
      :show="showReviewModal"
      :record-id="selectedRecordId"
      @close="showReviewModal = false"
      @approve="handleApprove"
      @reject="handleReject"
    />
  </DefaultLayout>
</template>

<style scoped>
.review-page {
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
.batch-toggle {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: 0.8125rem;
  cursor: pointer;
  font-family: inherit;
}
.batch-toggle.active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
.tabs {
  display: flex;
  background: var(--color-bg-surface);
  border-radius: var(--radius-md);
  padding: 2px;
}
.tab {
  flex: 1;
  padding: var(--spacing-sm);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-family: inherit;
  transition: background 0.2s, color 0.2s;
}
.tab.active {
  background: var(--color-bg-elevated);
  color: var(--color-text);
}
.batch-actions {
  display: flex;
  gap: var(--spacing-sm);
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
.record-wrapper {
  display: flex;
  gap: var(--spacing-sm);
  align-items: flex-start;
}
.record-wrapper.selected .record-card {
  border-color: var(--color-primary);
}
.checkbox-label {
  padding-top: var(--spacing-md);
  flex-shrink: 0;
}
.checkbox-label input {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
}
.record-wrapper .record-card {
  flex: 1;
}
</style>
