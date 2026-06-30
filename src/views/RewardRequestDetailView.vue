<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useRewardStore } from '@/stores/reward'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const rewardStore = useRewardStore()
const auth = useAuthStore()

const request = computed(() =>
  rewardStore.requests.find((r) => r.id === route.params.id)
)
const canReview = computed(() =>
  request.value?.status === 'pending' && (auth.isManager || auth.isSuperAdmin)
)

onMounted(async () => {
  if (rewardStore.requests.length === 0) {
    await rewardStore.fetchRequests()
  }
})

async function handleReview(status: 'approved' | 'rejected') {
  const id = route.params.id as string
  await rewardStore.reviewRequest(id, status)
}
</script>

<template>
  <DefaultLayout>
    <div class="detail-page">
      <button class="back-btn" @click="router.push('/rewards/requests')">
        ← 返回兑换记录
      </button>

      <div v-if="!request" class="loading-state">加载中...</div>
      <template v-else>
        <div class="detail-card">
          <div class="detail-header">
            <h2 class="request-title">{{ request.reward_title ?? request.reward_id }}</h2>
            <span
              class="status-badge"
              :class="{
                'status-pending': request.status === 'pending',
                'status-approved': request.status === 'approved',
                'status-rejected': request.status === 'rejected',
              }"
            >
              {{ request.status === 'pending' ? '待审核' : request.status === 'approved' ? '已通过' : '已拒绝' }}
            </span>
          </div>

          <div class="detail-section">
            <div class="detail-row">
              <span class="detail-label">消耗积分</span>
              <span class="detail-value">{{ request.reward_cost ?? '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">申请人</span>
              <span class="detail-value">{{ request.user_name ?? '-' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">申请时间</span>
              <span class="detail-value">{{ new Date(request.created_at).toLocaleString('zh-CN') }}</span>
            </div>
            <div v-if="request.reviewed_at" class="detail-row">
              <span class="detail-label">审核时间</span>
              <span class="detail-value">{{ new Date(request.reviewed_at).toLocaleString('zh-CN') }}</span>
            </div>
          </div>
        </div>

        <div v-if="canReview" class="review-actions">
          <BaseButton variant="danger" @click="handleReview('rejected')">拒绝</BaseButton>
          <BaseButton variant="primary" @click="handleReview('approved')">通过</BaseButton>
        </div>
      </template>
    </div>
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
.request-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text);
}
.status-badge {
  font-size: 0.75rem;
  padding: 2px var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-weight: 500;
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
.detail-label {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}
.detail-value {
  font-size: 0.875rem;
  color: var(--color-text);
}
.review-actions {
  display: flex;
  gap: var(--spacing-sm);
}
.review-actions > * {
  flex: 1;
}
</style>
