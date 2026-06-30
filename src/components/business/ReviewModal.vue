<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'

defineProps<{
  show: boolean
  recordId?: string
  recordTitle?: string
}>()
defineEmits<{
  close: []
  approve: [remark: string]
  reject: [remark: string]
}>()

const remark = ref('')
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card">
        <h3 class="modal-title">审核记录</h3>
        <p v-if="recordTitle" class="modal-subtitle">{{ recordTitle }}</p>
        <BaseInput
          v-model="remark"
          :multiline="true"
          placeholder="审核备注（可选）"
        />
        <div class="modal-actions">
          <BaseButton variant="danger" @click="$emit('reject', remark)">拒绝</BaseButton>
          <BaseButton variant="primary" @click="$emit('approve', remark)">通过</BaseButton>
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
  max-width: 400px;
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
.modal-subtitle {
  font-size: 0.875rem;
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
