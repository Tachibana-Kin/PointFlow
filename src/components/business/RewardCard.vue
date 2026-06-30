<script setup lang="ts">
import BaseCard from '@/components/common/BaseCard.vue'
import type { Reward } from '@/types'

interface Props {
  reward: Reward
  userScore: number
  hideRedeem?: boolean
}
withDefaults(defineProps<Props>(), { hideRedeem: false })

const emit = defineEmits<{ redeem: [rewardId: string] }>()
</script>

<template>
  <BaseCard class="reward-card">
    <h3 class="reward-title">{{ reward.title }}</h3>
    <p v-if="reward.description" class="reward-desc">{{ reward.description }}</p>
    <div class="reward-footer">
      <span class="reward-cost">
        <span class="cost-value">{{ reward.cost }}</span>
        <span class="cost-label">积分</span>
      </span>
      <button
        v-if="!hideRedeem"
        class="redeem-btn"
        :disabled="userScore < reward.cost"
        @click="emit('redeem', reward.id)"
      >
        {{ userScore < reward.cost ? '积分不足' : '兑换' }}
      </button>
    </div>
  </BaseCard>
</template>

<style scoped>
.reward-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.reward-title {
  font-size: var(--font-size-md, 15px);
  font-weight: 600;
}
.reward-desc {
  font-size: var(--font-size-sm, 13px);
  color: var(--color-text-muted);
  line-height: 1.5;
}
.reward-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: auto;
}
.reward-cost {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
}
.cost-value {
  font-size: var(--font-size-lg, 18px);
  font-weight: 700;
  color: var(--color-warning);
}
.cost-label {
  font-size: var(--font-size-sm, 13px);
  color: var(--color-text-muted);
}
.redeem-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-md);
  color: #fff;
  font-size: var(--font-size-sm, 13px);
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}
.redeem-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.redeem-btn:not(:disabled):hover {
  opacity: 0.85;
}
</style>
