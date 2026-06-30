<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import type { Record } from '@/types'

interface Props {
  record: Record
  showReviewActions?: boolean
}
const props = withDefaults(defineProps<Props>(), { showReviewActions: false })
const router = useRouter()

const emit = defineEmits<{
  approve: [id: string]
  reject: [id: string]
}>()

const statusMap: Record<string, { label: string; class: string }> = {
  pending: { label: '待审核', class: 'pending' },
  approved: { label: '已通过', class: 'approved' },
  rejected: { label: '已拒绝', class: 'rejected' },
  cancelled: { label: '已撤销', class: 'cancelled' },
}

function getTitle(): string {
  const r = props.record
  return r.rule_title ?? (r as any).rule?.title ?? r.id
}

function getType(): string {
  const r = props.record
  return r.rule_type ?? (r as any).rule?.type ?? 'add'
}

function getCategory(): string {
  const r = props.record
  return r.category_name ?? (r as any).rule?.category?.name ?? ''
}

function goDetail() {
  router.push(`/records/${props.record.id}`)
}

function handleApprove(e: Event) {
  e.stopPropagation()
  emit('approve', props.record.id)
}

function handleReject(e: Event) {
  e.stopPropagation()
  emit('reject', props.record.id)
}
</script>

<template>
  <BaseCard class="record-card" @click="goDetail">
    <div class="card-header">
      <h3 class="title">{{ getTitle() }}</h3>
      <span
        class="score"
        :class="getType() === 'add' ? 'positive' : 'negative'"
      >
        {{ record.score > 0 ? '+' : '' }}{{ record.score }}
      </span>
    </div>
    <div class="card-meta">
      <span class="badge" :class="statusMap[record.status]?.class">
        {{ statusMap[record.status]?.label }}
      </span>
      <span v-if="getCategory()" class="category">{{ getCategory() }}</span>
      <span class="time">{{ record.created_at?.slice(0, 10) }}</span>
    </div>
    <div v-if="showReviewActions && record.status === 'pending'" class="review-actions" @click.stop>
      <BaseButton variant="primary" size="sm" @click="handleApprove">通过</BaseButton>
      <BaseButton variant="danger" size="sm" @click="handleReject">拒绝</BaseButton>
    </div>
  </BaseCard>
</template>

<style scoped>
.record-card {
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.record-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md, 0 4px 6px rgba(0,0,0,0.4));
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
}
.title {
  font-size: var(--font-size-md, 15px);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.score {
  font-size: var(--font-size-lg, 18px);
  font-weight: 700;
  flex-shrink: 0;
}
.positive { color: var(--color-success); }
.negative { color: var(--color-danger); }
.card-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}
.badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 500;
}
.badge.pending { background: color-mix(in srgb, var(--color-warning) 20%, transparent); color: var(--color-warning); }
.badge.approved { background: color-mix(in srgb, var(--color-success) 20%, transparent); color: var(--color-success); }
.badge.rejected { background: color-mix(in srgb, var(--color-danger) 20%, transparent); color: var(--color-danger); }
.badge.cancelled { background: color-mix(in srgb, var(--color-text-muted) 20%, transparent); color: var(--color-text-muted); }
.category, .time {
  font-size: 12px;
  color: var(--color-text-muted);
}
.category::before { content: '·'; margin-right: var(--spacing-xs); }
.review-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  justify-content: flex-end;
}
</style>
