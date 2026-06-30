<script setup lang="ts">
import type { Rule } from '@/types'

interface Props {
  rules: Rule[]
  selected?: string
}
defineProps<Props>()

const emit = defineEmits<{ select: [ruleId: string] }>()
</script>

<template>
  <div class="rule-list">
    <button
      v-for="rule in rules"
      :key="rule.id"
      class="rule-item"
      :class="{ selected: rule.id === selected, disabled: !rule.enabled }"
      :disabled="!rule.enabled"
      @click="emit('select', rule.id)"
    >
      <div class="rule-main">
        <span class="rule-title">{{ rule.title }}</span>
        <span class="rule-score" :class="rule.type === 'add' ? 'add' : 'deduct'">
          {{ rule.type === 'add' ? '+' : '-' }}{{ rule.score }}
        </span>
      </div>
      <div v-if="rule.punishment && Object.keys(rule.punishment).length" class="rule-punish">
        <span v-for="(item, idx) in Object.entries(rule.punishment)" :key="idx">
          {{ idx > 0 ? ' / ' : '' }}{{ item[0] }} {{ item[1] }}
        </span>
      </div>
    </button>
    <div v-if="!rules.length" class="empty">暂无规则</div>
  </div>
</template>

<style scoped>
.rule-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.rule-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}
.rule-item:hover:not(:disabled) {
  border-color: var(--color-primary);
}
.rule-item.selected {
  border-color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
}
.rule-item.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.rule-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
}
.rule-title {
  font-size: var(--font-size-md, 15px);
  font-weight: 500;
}
.rule-score {
  font-weight: 700;
  flex-shrink: 0;
}
.add { color: var(--color-success); }
.deduct { color: var(--color-danger); }
.rule-punish {
  font-size: 12px;
  color: var(--color-text-muted);
}
.empty {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--spacing-lg);
  font-size: var(--font-size-sm, 13px);
}
</style>
