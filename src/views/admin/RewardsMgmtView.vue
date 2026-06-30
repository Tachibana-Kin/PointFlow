<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRewardStore } from '@/stores/reward'
import type { Reward } from '@/types'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseEmpty from '@/components/common/BaseEmpty.vue'

const store = useRewardStore()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingItem = ref<Reward | null>(null)
const deletingItem = ref<Reward | null>(null)
const error = ref('')

const form = ref({ title: '', cost: 0, description: '', enabled: true })

function openCreate() {
  form.value = { title: '', cost: 0, description: '', enabled: true }
  showCreateModal.value = true
}

function openEdit(reward: Reward) {
  editingItem.value = reward
  form.value = {
    title: reward.title,
    cost: reward.cost,
    description: reward.description || '',
    enabled: reward.enabled,
  }
  showEditModal.value = true
}

function openDelete(reward: Reward) {
  deletingItem.value = reward
  showDeleteModal.value = true
}

async function createReward() {
  try {
    await store.createReward({
      title: form.value.title,
      cost: form.value.cost,
      description: form.value.description || undefined,
      enabled: form.value.enabled,
    })
    showCreateModal.value = false
  } catch (e: any) {
    error.value = e.message || '创建奖励失败'
  }
}

async function updateReward() {
  if (!editingItem.value) return
  try {
    await store.updateReward(editingItem.value.id, {
      title: form.value.title,
      cost: form.value.cost,
      description: form.value.description || undefined,
      enabled: form.value.enabled,
    })
    showEditModal.value = false
    editingItem.value = null
  } catch (e: any) {
    error.value = e.message || '更新奖励失败'
  }
}

async function deleteReward() {
  if (!deletingItem.value) return
  try {
    await store.deleteReward(deletingItem.value.id)
    showDeleteModal.value = false
    deletingItem.value = null
  } catch (e: any) {
    error.value = e.message || '删除奖励失败'
  }
}

async function toggleEnabled(reward: Reward) {
  try {
    await store.updateReward(reward.id, { enabled: !reward.enabled })
  } catch (e: any) {
    error.value = e.message || '更新状态失败'
  }
}

onMounted(() => store.fetchRewards())
</script>

<template>
  <div class="rewards-mgmt-view">
    <header class="page-header">
      <h2 class="page-title">奖励管理</h2>
      <BaseButton variant="primary" @click="openCreate">新建奖励</BaseButton>
    </header>

    <div v-if="error" class="error-toast">{{ error }}</div>

    <BaseCard v-if="store.loading && !store.rewards.length" padding="lg">
      <p class="loading-text">加载中...</p>
    </BaseCard>

    <BaseEmpty v-else-if="!store.rewards.length" text="暂无奖励数据" />

    <div v-else class="rewards-table-wrap">
      <table class="rewards-table">
        <thead>
          <tr>
            <th>标题</th>
            <th>消耗积分</th>
            <th>描述</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reward in store.rewards" :key="reward.id">
            <td data-label="标题">{{ reward.title }}</td>
            <td data-label="消耗积分">{{ reward.cost }}</td>
            <td data-label="描述" class="desc-cell">{{ reward.description || '-' }}</td>
            <td data-label="状态">
              <label class="toggle-switch">
                <input type="checkbox" :checked="reward.enabled" @change="toggleEnabled(reward)" />
                <span class="toggle-track">
                  <span class="toggle-thumb"></span>
                </span>
                <span class="toggle-label-text">{{ reward.enabled ? '启用' : '禁用' }}</span>
              </label>
            </td>
            <td data-label="操作" class="actions-cell">
              <BaseButton size="sm" variant="ghost" @click="openEdit(reward)">编辑</BaseButton>
              <BaseButton size="sm" variant="danger" @click="openDelete(reward)">删除</BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal :open="showCreateModal" title="新建奖励" @close="showCreateModal = false">
      <div class="form-group">
        <label>标题</label>
        <input v-model="form.title" class="form-input" placeholder="奖励标题" />
      </div>
      <div class="form-group">
        <label>消耗积分</label>
        <input v-model.number="form.cost" class="form-input" type="number" min="0" />
      </div>
      <div class="form-group">
        <label>描述</label>
        <textarea v-model="form.description" class="form-textarea" rows="3" placeholder="奖励描述（可选）"></textarea>
      </div>
      <div class="form-group">
        <label class="toggle-label">
          <input type="checkbox" v-model="form.enabled" />
          <span>启用</span>
        </label>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="showCreateModal = false">取消</BaseButton>
        <BaseButton variant="primary" @click="createReward">确定</BaseButton>
      </template>
    </BaseModal>

    <BaseModal :open="showEditModal" title="编辑奖励" @close="showEditModal = false">
      <div class="form-group">
        <label>标题</label>
        <input v-model="form.title" class="form-input" />
      </div>
      <div class="form-group">
        <label>消耗积分</label>
        <input v-model.number="form.cost" class="form-input" type="number" min="0" />
      </div>
      <div class="form-group">
        <label>描述</label>
        <textarea v-model="form.description" class="form-textarea" rows="3" placeholder="奖励描述（可选）"></textarea>
      </div>
      <div class="form-group">
        <label class="toggle-label">
          <input type="checkbox" v-model="form.enabled" />
          <span>启用</span>
        </label>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="showEditModal = false">取消</BaseButton>
        <BaseButton variant="primary" @click="updateReward">保存</BaseButton>
      </template>
    </BaseModal>

    <BaseModal :open="showDeleteModal" title="确认删除" width="360px" @close="showDeleteModal = false">
      <p>确定要删除奖励 <strong>{{ deletingItem?.title }}</strong> 吗？</p>
      <template #footer>
        <BaseButton variant="secondary" @click="showDeleteModal = false">取消</BaseButton>
        <BaseButton variant="danger" @click="deleteReward">删除</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.rewards-mgmt-view {
  max-width: 860px;
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

.rewards-table-wrap {
  overflow-x: auto;
}

.rewards-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.rewards-table th {
  text-align: left;
  padding: 12px var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-weight: 500;
  white-space: nowrap;
}

.rewards-table td {
  padding: 12px var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  vertical-align: middle;
}

.desc-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-muted);
}

.actions-cell {
  display: flex;
  gap: var(--spacing-xs);
}

.toggle-switch {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
}

.toggle-switch input {
  display: none;
}

.toggle-track {
  width: 36px;
  height: 20px;
  background: var(--color-bg-elevated);
  border-radius: 10px;
  position: relative;
  transition: background 0.2s;
}

.toggle-switch input:checked + .toggle-track {
  background: var(--color-primary);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}

.toggle-switch input:checked + .toggle-track .toggle-thumb {
  transform: translateX(16px);
}

.toggle-label-text {
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
.form-textarea {
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
.form-textarea:focus {
  border-color: var(--color-primary);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-text);
}

@media (max-width: 640px) {
  .rewards-table thead {
    display: none;
  }

  .rewards-table tr {
    display: block;
    padding: var(--spacing-md) 0;
    border-bottom: 1px solid var(--color-border);
  }

  .rewards-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px var(--spacing-sm);
    border-bottom: none;
  }

  .rewards-table td::before {
    content: attr(data-label);
    font-weight: 500;
    color: var(--color-text-muted);
    margin-right: var(--spacing-md);
  }

  .desc-cell {
    max-width: none;
  }

  .actions-cell {
    justify-content: flex-end;
  }
}
</style>
