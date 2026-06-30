<script setup lang="ts">
import BaseCard from '@/components/common/BaseCard.vue'

interface Props {
  label: string
  score: number
  trend?: 'up' | 'down' | 'neutral'
}
withDefaults(defineProps<Props>(), { trend: 'neutral' })
</script>

<template>
  <BaseCard class="score-card">
    <div class="score-value" :class="score >= 0 ? 'positive' : 'negative'">
      {{ score > 0 ? '+' : '' }}{{ score }}
    </div>
    <div class="score-label">{{ label }}</div>
    <span v-if="trend !== 'neutral'" class="trend" :class="trend">
      {{ trend === 'up' ? '↑' : '↓' }}
    </span>
  </BaseCard>
</template>

<style scoped>
.score-card {
  text-align: center;
  position: relative;
}
.score-value {
  font-size: var(--font-size-xl, 24px);
  font-weight: 700;
  line-height: 1.2;
}
.positive { color: var(--color-success); }
.negative { color: var(--color-danger); }
.score-label {
  font-size: var(--font-size-sm, 13px);
  color: var(--color-text-muted);
  margin-top: var(--spacing-xs);
}
.trend {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  font-size: var(--font-size-md, 15px);
}
.trend.up { color: var(--color-success); }
.trend.down { color: var(--color-danger); }
</style>
