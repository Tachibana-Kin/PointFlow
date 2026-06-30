<script setup lang="ts">
import BaseButton from '@/components/common/BaseButton.vue'

defineProps<{
  show: boolean
  rewardTitle?: string
  rewardCost?: number
  loading?: boolean
}>()
defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card">
        <h3 class="modal-title">确认兑换</h3>
        <p class="modal-text">确定要兑换 <strong>{{ rewardTitle }}</strong> 吗？</p>
        <p class="modal-cost">消耗积分：<strong>{{ rewardCost }}</strong></p>
        <div class="modal-actions">
          <BaseButton variant="secondary" @click="$emit('close')">取消</BaseButton>
          <BaseButton variant="primary" :loading="loading" @click="$emit('confirm')">确认兑换</BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: var(--spacing-md);
}
.modal-card {
  width: 100%;
  max-width: 360px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
}
.modal-text, .modal-cost {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
}
.modal-actions {
  display: flex;
  gap: var(--spacing-sm);
}
.modal-actions > * {
  flex: 1;
}
</style>
