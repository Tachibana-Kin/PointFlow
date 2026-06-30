<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useRewardStore } from '@/stores/reward'

const router = useRouter()
const rewardStore = useRewardStore()

const requests = computed(() => rewardStore.requests)

onMounted(async () => {
  await rewardStore.fetchRequests()
})

function statusClass(status: string) {
  switch (status) {
    case 'pending': return 'status-pending'
    case 'approved': return 'status-approved'
    case 'rejected': return 'status-rejected'
    default: return ''
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'pending': return '待审核'
    case 'approved': return '已通过'
    case 'rejected': return '已拒绝'
    default: return status
  }
}
</script>

<template>
  <DefaultLayout>
    <div class="requests-page">
      <h2 class="page-title">兑换记录</h2>

      <div v-if="rewardStore.loading && requests.length === 0" class="loading-state">
        加载中...
      </div>
      <div v-else-if="requests.length === 0" class="empty-state">
        <p>暂无兑换记录</p>
      </div>
      <div v-else class="requests-list">
        <div
          v-for="req in requests"
          :key="req.id"
          class="request-item"
          @click="router.push(`/rewards/requests/${req.id}`)"
        >
          <div class="request-info">
            <span class="request-title">{{ req.reward_title ?? req.reward_id }}</span>
            <span class="request-time">{{ new Date(req.created_at).toLocaleString('zh-CN') }}</span>
          </div>
          <span class="status-badge" :class="statusClass(req.status)">
            {{ statusLabel(req.status) }}
          </span>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.requests-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
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
}
.requests-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: border-color 0.2s;
}
.request-item:hover {
  border-color: var(--color-primary);
}
.request-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.request-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
}
.request-time {
  font-size: 0.75rem;
  color: var(--color-text-muted);
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
</style>
