<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import PunishmentSection from '@/components/business/PunishmentSection.vue'
import ReviewModal from '@/components/business/ReviewModal.vue'
import { useRecordStore } from '@/stores/record'
import { usePunishmentStore } from '@/stores/punishment'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const recordStore = useRecordStore()
const punishmentStore = usePunishmentStore()
const auth = useAuthStore()

const showReviewModal = ref(false)

const record = computed(() => recordStore.currentRecord)
const isPending = computed(() => record.value?.status === 'pending')
const canReview = computed(() =>
  isPending.value && (auth.isManager || auth.isSuperAdmin)
)

onMounted(async () => {
  const id = route.params.id as string
  await recordStore.fetchRecordById(id)
  await punishmentStore.fetchLogs(id)
})

function getRuleType(): string {
  const r = record.value
  return r?.rule_type ?? (r as any)?.rule?.type ?? 'add'
}

async function handleApprove(remark: string) {
  if (!record.value) return
  await recordStore.reviewRecord(record.value.id, { status: 'approved', remark: remark || undefined })
  showReviewModal.value = false
}

async function handleReject(remark: string) {
  if (!record.value) return
  await recordStore.reviewRecord(record.value.id, { status: 'rejected', remark: remark || undefined })
  showReviewModal.value = false
}
</script>

<template>
  <DefaultLayout>
    <div class="detail-page">
      <button class="back-btn" @click="router.push('/records')">
        ← 返回记录列表
      </button>

      <div v-if="recordStore.loading && !record" class="loading-state">加载中...</div>
      <template v-else-if="record">
        <div class="detail-card">
          <div class="detail-header">
            <h2 class="record-title">{{ record.rule_title ?? (record as any).rule?.title ?? record.rule_id }}</h2>
            <span
              class="status-badge"
              :class="{
                'status-pending': record.status === 'pending',
                'status-approved': record.status === 'approved',
                'status-rejected': record.status === 'rejected',
              }"
            >
              {{ record.status === 'pending' ? '待审核' : record.status === 'approved' ? '已通过' : '已拒绝' }}
            </span>
          </div>

          <div class="detail-section">
            <div class="detail-row">
              <span class="detail-label">分类</span>
              <span class="detail-value">{{ record.category_name ?? '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">积分</span>
              <span class="detail-value score" :class="getRuleType() === 'add' ? 'positive' : 'negative'">
                {{ record.score > 0 ? '+' : '' }}{{ record.score }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">时间</span>
              <span class="detail-value">{{ new Date(record.created_at).toLocaleString('zh-CN') }}</span>
            </div>
            <div v-if="record.remark" class="detail-row remark">
              <span class="detail-label">备注</span>
              <span class="detail-value">{{ record.remark }}</span>
            </div>
            <div v-if="record.reviewer_name" class="detail-row">
              <span class="detail-label">审核人</span>
              <span class="detail-value">{{ record.reviewer_name }}</span>
            </div>
            <div v-if="record.reviewed_at" class="detail-row">
              <span class="detail-label">审核时间</span>
              <span class="detail-value">{{ new Date(record.reviewed_at).toLocaleString('zh-CN') }}</span>
            </div>
          </div>
        </div>

        <PunishmentSection
          v-if="punishmentStore.punishmentLogs.length > 0"
          :logs="punishmentStore.punishmentLogs"
        />

        <div v-if="canReview" class="review-action">
          <BaseButton variant="primary" block @click="showReviewModal = true">
            审核
          </BaseButton>
        </div>
      </template>
      <div v-else class="loading-state">记录不存在</div>
    </div>

    <ReviewModal
      :show="showReviewModal"
      :record-id="record?.id"
      :record-title="record?.rule_title"
      @close="showReviewModal = false"
      @approve="handleApprove"
      @reject="handleReject"
    />
  </DefaultLayout>
</template>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.back-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  align-self: flex-start;
}
.back-btn:hover {
  color: var(--color-primary);
}
.loading-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-muted);
}
.detail-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-sm);
}
.record-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text);
}
.status-badge {
  font-size: 0.75rem;
  padding: 2px var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-weight: 500;
  white-space: nowrap;
}
.status-pending { background: rgba(234, 179, 8, 0.15); color: var(--color-warning); }
.status-approved { background: rgba(34, 197, 94, 0.15); color: var(--color-success); }
.status-rejected { background: rgba(239, 68, 68, 0.15); color: var(--color-danger); }
.detail-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xs) 0;
}
.detail-row.remark {
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-xs);
}
.detail-label {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}
.detail-value {
  font-size: 0.875rem;
  color: var(--color-text);
  text-align: right;
  word-break: break-all;
}
.detail-value.score { font-weight: 700; }
.detail-value.positive { color: var(--color-success); }
.detail-value.negative { color: var(--color-danger); }
.review-action {
  padding-top: var(--spacing-sm);
}
</style>
