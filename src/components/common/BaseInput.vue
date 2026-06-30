<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  type?: string
  placeholder?: string
  multiline?: boolean
  disabled?: boolean
}>()
defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="base-input-wrapper">
    <label v-if="label" class="input-label">{{ label }}</label>
    <textarea
      v-if="multiline"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="base-input base-textarea"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <input
      v-else
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="base-input"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<style scoped>
.base-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.input-label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
.base-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.base-input:focus {
  border-color: var(--color-primary);
}
.base-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.base-textarea {
  min-height: 100px;
  resize: vertical;
}
</style>
