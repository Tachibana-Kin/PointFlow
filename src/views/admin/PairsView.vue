<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import * as pairsApi from '@/api/pairs'
import * as usersApi from '@/api/users'
import type { Pair, User } from '@/types'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseEmpty from '@/components/common/BaseEmpty.vue'

const pairs = ref<Pair[]>([])
const users = ref<User[]>([])
const loading = ref(false)
const error = ref('')

const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const deletingPair = ref<Pair | null>(null)

const form = ref({ manager_id: '', member_id: '', name: '' })

const managers = computed(() => users.value.filter(u => u.role === 'manager'))
const pairedMemberIds = computed(() => pairs.value.map(p => p.member_id))
const availableMembers = computed(() =>
  users.value.filter(u => u.role === 'member' && !pairedMemberIds.value.includes(u.id))
)

async function loadPairs() {
  loading.value = true
  error.value = ''
  try {
    pairs.value = await pairsApi.list()
  } catch (e: any) {
    error.value = e.message || '加载配对列表失败'
  } finally {
    loading.value = false
  }
}

async function loadUsers() {
  try {
    users.value = await usersApi.list()
  } catch (e: any) {
    error.value = e.message || '加载用户列表失败'
  }
}

function openCreate() {
  form.value = { manager_id: '', member_id: '', name: '' }
  showCreateModal.value = true
}

function openDelete(pair: Pair) {
  deletingPair.value = pair
  showDeleteModal.value = true
}

async function createPair() {
  try {
    const data: { manager_id: string; member_id: string; name?: string } = {
      manager_id: form.value.manager_id,
      member_id: form.value.member_id,
    }
    if (form.value.name) data.name = form.value.name
    await pairsApi.create(data)
    showCreateModal.value = false
    await loadPairs()
  } catch (e: any) {
    error.value = e.message || '创建配对失败'
  }
}

async function deletePair() {
  if (!deletingPair.value) return
  try {
    await pairsApi.remove(deletingPair.value.id)
    showDeleteModal.value = false
    deletingPair.value = null
    await loadPairs()
  } catch (e: any) {
    error.value = e.message || '删除配对失败'
  }
}

function userName(id: string) {
  return users.value.find(u => u.id === id)?.name ?? id
}

onMounted(async () => {
  await loadUsers()
  await loadPairs()
})
</script>

<template>
  <div class="pairs-view">
    <header class="page-header">
      <h2 class="page-title">配对管理</h2>
      <BaseButton variant="primary" @click="openCreate">新建配对</BaseButton>
    </header>

    <div v-if="error" class="error-toast">{{ error }}</div>

    <BaseCard v-if="loading && !pairs.length" padding="lg">
      <p class="loading-text">加载中...</p>
    </BaseCard>

    <BaseEmpty v-else-if="!pairs.length" text="暂无配对数据" />

    <div v-else class="pairs-list">
      <div v-for="pair in pairs" :key="pair.id" class="pair-card">
        <div class="pair-body">
          <div class="pair-info">
            <span v-if="pair.name" class="pair-name">{{ pair.name }}</span>
            <span class="pair-members">
              <BaseBadge variant="warning">{{ userName(pair.manager_id) }}</BaseBadge>
              <span class="arrow-icon">→</span>
              <BaseBadge>{{ userName(pair.member_id) }}</BaseBadge>
            </span>
          </div>
          <div class="pair-meta">
            <span class="pair-created">{{ new Date(pair.created_at).toLocaleDateString() }}</span>
            <BaseButton size="sm" variant="danger" @click="openDelete(pair)">删除</BaseButton>
          </div>
        </div>
      </div>
    </div>

    <BaseModal :open="showCreateModal" title="新建配对" @close="showCreateModal = false">
      <div class="form-group">
        <label>管理者</label>
        <select v-model="form.manager_id" class="form-select">
          <option value="" disabled>选择管理者</option>
          <option v-for="m in managers" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>成员</label>
        <select v-model="form.member_id" class="form-select">
          <option value="" disabled>选择成员</option>
          <option v-for="m in availableMembers" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>配对名称（可选）</label>
        <input v-model="form.name" class="form-input" placeholder="输入配对名称" />
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="showCreateModal = false">取消</BaseButton>
        <BaseButton variant="primary" @click="createPair">确定</BaseButton>
      </template>
    </BaseModal>

    <BaseModal :open="showDeleteModal" title="确认删除" width="360px" @close="showDeleteModal = false">
      <p>确定要删除此配对吗？</p>
      <p v-if="deletingPair?.name" class="delete-detail">{{ deletingPair.name }}</p>
      <template #footer>
        <BaseButton variant="secondary" @click="showDeleteModal = false">取消</BaseButton>
        <BaseButton variant="danger" @click="deletePair">删除</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.pairs-view {
  max-width: 720px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
}

.error-toast {
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
  font-size: 0.875rem;
}

.loading-text {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--spacing-xl);
}

.pairs-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.pair-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
}

.pair-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.pair-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.pair-name {
  font-weight: 600;
  color: var(--color-text);
}

.pair-members {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 0.875rem;
}

.arrow-icon {
  color: var(--color-primary);
  font-size: 1.125rem;
}

.pair-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-xs);
}

.pair-created {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-xs);
}

.form-input,
.form-select {
  width: 100%;
  padding: 8px 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  border-color: var(--color-primary);
}

.form-select {
  appearance: none;
  cursor: pointer;
}

.delete-detail {
  margin-top: var(--spacing-sm);
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .pair-body {
    flex-direction: column;
    align-items: flex-start;
  }

  .pair-meta {
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
  }
}
</style>
