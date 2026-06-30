<script setup lang="ts">
interface Props {
  score: number
  type: 'add' | 'deduct'
}
defineProps<Props>()
</script>

<template>
  <div class="score-preview" :class="type">
    <span class="prefix">{{ type === 'add' ? '+' : '-' }}</span>
    <span class="value">{{ score }}</span>
  </div>
</template>

<style scoped>
.score-preview {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  font-weight: 700;
}
.prefix {
  font-size: var(--font-size-lg, 18px);
}
.value {
  font-size: var(--font-size-xl, 24px);
}
.add { color: var(--color-success); }
.deduct { color: var(--color-danger); }
</style>
