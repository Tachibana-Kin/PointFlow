<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  role: 'member' | 'manager' | 'super_admin'
}
const props = defineProps<Props>()
const router = useRouter()

const actions = computed(() => {
  switch (props.role) {
    case 'member':
      return [
        { label: '新建记录', route: '/records/new' },
        { label: '申请兑换', route: '/rewards' },
      ]
    case 'manager':
      return [
        { label: '审核记录', route: '/review' },
        { label: '管理规则', route: '/admin/rules' },
      ]
    case 'super_admin':
      return [
        { label: '用户管理', route: '/admin/users' },
      ]
  }
})

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="quick-actions">
    <button
      v-for="action in actions"
      :key="action.label"
      class="action-btn"
      @click="navigate(action.route)"
    >
      {{ action.label }}
    </button>
  </div>
</template>

<style scoped>
.quick-actions {
  display: flex;
  gap: var(--spacing-sm);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: var(--spacing-sm) 0;
}
.action-btn {
  flex-shrink: 0;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: var(--font-size-sm, 13px);
  white-space: nowrap;
  transition: all 0.2s;
}
.action-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}
</style>
