<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  options: { label: string; value: string }[]
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="base-select-wrapper">
    <label v-if="label" class="select-label">{{ label }}</label>
    <select
      :value="modelValue"
      :disabled="disabled"
      class="base-select"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="" disabled>请选择...</option>
      <option
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
      >
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.base-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.select-label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.base-select {
  width: 100%;
  padding: 10px 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
  appearance: none;
  cursor: pointer;
}

.base-select:focus {
  border-color: var(--color-primary);
}

.base-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
