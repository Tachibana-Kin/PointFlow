<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import RewardCard from '@/components/business/RewardCard.vue'
import RequestModal from '@/components/business/RequestModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useRewardStore } from '@/stores/reward'
import { useDashboardStore } from '@/stores/dashboard'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const rewardStore = useRewardStore()
const dashboard = useDashboardStore()
const auth = useAuthStore()

const showModal = ref(false)
const submitting = ref(false)
const selectedReward = ref<{ id: string; title: string; cost: number } | null>(null)
const notification = ref('')

onMounted(async () => {
  await Promise.all([
    rewardStore.fetchRewards(),
    dashboard.fetchDashboard(),
  ])
})

function openRedeem(rewardId: string) {
  const reward = rewardStore.rewards.find((r) => r.id === rewardId)
  if (!reward) return
  if (reward.cost > dashboard.currentScore) return
  selectedReward.value = { id: reward.id, title: reward.title, cost: reward.cost }
  showModal.value = true
}

async function confirmRedeem() {
  if (!selectedReward.value) return
  submitting.value = true
  try {
    await rewardStore.createRequest(selectedReward.value.id)
    showModal.value = false
    selectedReward.value = null
    notification.value = '兑换申请已提交，等待审核'
    setTimeout(() => { notification.value = '' }, 3000)
    dashboard.fetchDashboard()
  } catch (e) {
    notification.value = '兑换失败，请重试'
    setTimeout(() => { notification.value = '' }, 3000)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <DefaultLayout>
    <div class="rewards-page">
      <div class="score-header">
        <span class="score-label">当前积分</span>
        <span class="score-value">{{ dashboard.currentScore }}</span>
      </div>

      <div class="header-row">
        <h2 class="page-title">{{ auth.isManager || auth.isSuperAdmin ? '奖励管理' : '奖励兑换' }}</h2>
        <BaseButton v-if="auth.isManager || auth.isSuperAdmin" variant="primary" size="sm" @click="router.push('/admin/rewards')">
          新建奖励
        </BaseButton>
      </div>

      <div v-if="rewardStore.loading && rewardStore.rewards.length === 0" class="loading-state">
        加载中...
      </div>
      <div v-else-if="rewardStore.rewards.length === 0" class="empty-state">
        <p>暂无可用奖励</p>
      </div>
      <div v-else class="rewards-grid">
        <RewardCard
          v-for="reward in rewardStore.rewards"
          :key="reward.id"
          :reward="reward"
          :user-score="dashboard.currentScore"
          :hide-redeem="auth.isManager || auth.isSuperAdmin"
          @redeem="openRedeem(reward.id)"
        />
      </div>
    </div>

    <div v-if="notification" class="toast">{{ notification }}</div>

    <RequestModal
      :show="showModal"
      :reward-title="selectedReward?.title"
      :reward-cost="selectedReward?.cost"
      :loading="submitting"
      @close="showModal = false"
      @confirm="confirmRedeem"
    />
  </DefaultLayout>
</template>

<style scoped>
.rewards-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
.score-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: linear-gradient(135deg, var(--color-primary), #818cf8);
  border-radius: var(--radius-lg);
  color: #fff;
}
.score-label {
  font-size: 0.875rem;
  opacity: 0.85;
}
.score-value {
  font-size: 1.5rem;
  font-weight: 800;
  margin-left: auto;
}
.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
.rewards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}
@media (min-width: 768px) {
.toast {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-success);
  color: var(--color-success);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 300;
  box-shadow: var(--shadow-md);
}
.rewards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
