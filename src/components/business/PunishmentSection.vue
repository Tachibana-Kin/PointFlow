<script setup lang="ts">
import BaseCard from '@/components/common/BaseCard.vue'
import type { PunishmentLog } from '@/types'

interface Props {
  logs: PunishmentLog[]
}
defineProps<Props>()

const emit = defineEmits<{ markExecuted: [logId: string] }>()
</script>

<template>
  <BaseCard v-if="logs.length" class="punishment-section">
    <h4 class="section-title">处罚记录</h4>
    <div v-for="log in logs" :key="log.id" class="log-item">
      <div class="log-info">
        <span class="log-type">{{ log.type }}</span>
        <span class="log-amount">{{ log.amount }}</span>
      </div>
      <div class="log-status">
        <button
          v-if="!log.executed"
          class="mark-btn"
          @click="emit('markExecuted', log.id)"
        >
          标记已执行
        </button>
        <span v-else class="executed-badge">
          <span class="check">✓</span> 已执行
        </span>
        <span v-if="log.executed_at" class="executed-time">{{ log.executed_at.slice(0, 16) }}</span>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
.punishment-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.section-title {
  font-size: var(--font-size-md, 15px);
  font-weight: 600;
}
.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-border);
}
.log-item:last-child {
  border-bottom: none;
}
.log-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}
.log-type {
  font-weight: 500;
}
.log-amount {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm, 13px);
}
.log-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}
.mark-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: color-mix(in srgb, var(--color-warning) 20%, transparent);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-sm);
  color: var(--color-warning);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.mark-btn:hover {
  background: var(--color-warning);
  color: #000;
}
.executed-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: var(--color-success);
  font-size: 12px;
}
.check {
  font-weight: 700;
}
.executed-time {
  font-size: 11px;
  color: var(--color-text-muted);
}
</style>
