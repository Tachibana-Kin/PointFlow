<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/category'
import { useRuleStore } from '@/stores/rule'
import type { Category, Rule, RuleType } from '@/types'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseEmpty from '@/components/common/BaseEmpty.vue'

const categoryStore = useCategoryStore()
const ruleStore = useRuleStore()

const selectedCategory = ref<Category | null>(null)
const selectedIds = ref<Set<string>>(new Set())
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingRule = ref<Rule | null>(null)
const deletingRule = ref<Rule | null>(null)
const showBatchDeleteModal = ref(false)
const error = ref('')

const form = ref<{
  title: string
  category_id: string
  type: RuleType
  score: number
  punishment: { type: string; amount: number }[]
  enabled: boolean
}>({
  title: '',
  category_id: '',
  type: 'add',
  score: 0,
  punishment: [],
  enabled: true,
})

const filteredRules = computed(() => {
  if (!selectedCategory.value) return []
  return ruleStore.rules.filter(r => r.category_id === selectedCategory.value!.id)
})

const allSelected = computed(() =>
  filteredRules.value.length > 0 && selectedIds.value.size === filteredRules.value.length
)

function toggleAll() {
  if (allSelected.value) {
    selectedIds.value.clear()
  } else {
    selectedIds.value = new Set(filteredRules.value.map(r => r.id))
  }
}

function toggleSelect(id: string) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

function selectCategory(cat: Category) {
  selectedCategory.value = cat
  selectedIds.value.clear()
  ruleStore.setFilters({ category_id: cat.id })
  ruleStore.fetchRules({ category_id: cat.id })
}

function openCreate() {
  if (!selectedCategory.value) return
  form.value = {
    title: '',
    category_id: selectedCategory.value.id,
    type: 'add',
    score: 1,
    punishment: [],
    enabled: true,
  }
  showCreateModal.value = true
}

function openEdit(rule: Rule) {
  editingRule.value = rule
  const punishments = rule.punishment
    ? Object.entries(rule.punishment).map(([type, amount]) => ({ type, amount: amount as number }))
    : []
  form.value = {
    title: rule.title,
    category_id: rule.category_id,
    type: rule.type,
    score: rule.score,
    punishment: punishments,
    enabled: rule.enabled,
  }
  showEditModal.value = true
}

function openDelete(rule: Rule) {
  deletingRule.value = rule
  showDeleteModal.value = true
}

function addPunishmentRow() {
  form.value.punishment.push({ type: '', amount: 0 })
}

function removePunishmentRow(idx: number) {
  form.value.punishment.splice(idx, 1)
}

async function createRule() {
  try {
    const payload: Record<string, any> = {
      title: form.value.title,
      category_id: form.value.category_id,
      type: form.value.type,
      score: form.value.score,
      enabled: form.value.enabled,
    }
    if (form.value.punishment.length > 0) {
      const p: Record<string, number> = {}
      for (const row of form.value.punishment) {
        if (row.type) p[row.type] = row.amount
      }
      payload.punishment = p
    }
    await ruleStore.createRule(payload as Partial<Rule>)
    showCreateModal.value = false
  } catch (e: any) {
    error.value = e.message || '创建规则失败'
  }
}

async function updateRule() {
  if (!editingRule.value) return
  try {
    const payload: Record<string, any> = {
      title: form.value.title,
      type: form.value.type,
      score: form.value.score,
      enabled: form.value.enabled,
    }
    if (form.value.punishment.length > 0) {
      const p: Record<string, number> = {}
      for (const row of form.value.punishment) {
        if (row.type) p[row.type] = row.amount
      }
      payload.punishment = p
    } else {
      payload.punishment = {}
    }
    await ruleStore.updateRule(editingRule.value.id, payload as Partial<Rule>)
    showEditModal.value = false
    editingRule.value = null
  } catch (e: any) {
    error.value = e.message || '更新规则失败'
  }
}

async function deleteRule() {
  if (!deletingRule.value) return
  try {
    await ruleStore.deleteRule(deletingRule.value.id)
    showDeleteModal.value = false
    deletingRule.value = null
  } catch (e: any) {
    error.value = e.message || '删除规则失败'
  }
}

async function batchEnable() {
  const ids = [...selectedIds.value]
  if (!ids.length) return
  try {
    for (const id of ids) {
      await ruleStore.updateRule(id, { enabled: true })
    }
    selectedIds.value.clear()
  } catch (e: any) {
    error.value = e.message || '批量启用失败'
  }
}

async function batchDisable() {
  const ids = [...selectedIds.value]
  if (!ids.length) return
  try {
    for (const id of ids) {
      await ruleStore.updateRule(id, { enabled: false })
    }
    selectedIds.value.clear()
  } catch (e: any) {
    error.value = e.message || '批量禁用失败'
  }
}

function confirmBatchDelete() {
  if (!selectedIds.value.size) return
  showBatchDeleteModal.value = true
}

async function batchDelete() {
  const ids = [...selectedIds.value]
  try {
    for (const id of ids) {
      await ruleStore.deleteRule(id)
    }
    selectedIds.value.clear()
    showBatchDeleteModal.value = false
  } catch (e: any) {
    error.value = e.message || '批量删除失败'
  }
}

onMounted(() => {
  categoryStore.fetchCategories()
})
</script>

<template>
  <div class="rules-view">
    <div class="rules-layout">
      <aside class="category-tree">
        <h3 class="tree-title">分类</h3>
        <div v-if="categoryStore.loading" class="tree-loading">加载中...</div>
        <ul v-else class="tree-list">
          <li
            v-for="cat in categoryStore.categories"
            :key="cat.id"
            class="tree-item"
            :class="{ active: selectedCategory?.id === cat.id }"
            @click="selectCategory(cat)"
          >
            <span class="tree-dot" :style="{ background: cat.color || '#6366f1' }"></span>
            <span>{{ cat.icon }} {{ cat.name }}</span>
          </li>
        </ul>
      </aside>

      <div class="rules-content">
        <template v-if="!selectedCategory">
          <BaseEmpty icon="👈" text="请选择一个分类" />
        </template>

        <template v-else>
          <header class="rules-header">
            <h3 class="rules-title">{{ selectedCategory.name }} 规则</h3>
            <BaseButton variant="primary" size="sm" @click="openCreate">新建规则</BaseButton>
          </header>

          <div v-if="error" class="error-toast">{{ error }}</div>

          <div v-if="selectedIds.size > 0" class="batch-bar">
            <span class="batch-count">已选 {{ selectedIds.size }} 项</span>
            <BaseButton size="sm" variant="secondary" @click="batchEnable">批量启用</BaseButton>
            <BaseButton size="sm" variant="secondary" @click="batchDisable">批量禁用</BaseButton>
            <BaseButton size="sm" variant="danger" @click="confirmBatchDelete">批量删除</BaseButton>
          </div>

          <div v-if="ruleStore.loading && !filteredRules.length" class="loading-text">加载中...</div>

          <BaseEmpty v-else-if="!filteredRules.length" text="该分类暂无规则" />

          <div v-else class="rules-table-wrap">
            <table class="rules-table">
              <thead>
                <tr>
                  <th class="check-col">
                    <input type="checkbox" :checked="allSelected" @change="toggleAll" />
                  </th>
                  <th>标题</th>
                  <th>分值</th>
                  <th>惩罚</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="rule in filteredRules" :key="rule.id">
                  <td class="check-col">
                    <input type="checkbox" :checked="selectedIds.has(rule.id)" @change="toggleSelect(rule.id)" />
                  </td>
                  <td data-label="标题">{{ rule.title }}</td>
                  <td data-label="分值" :class="rule.type === 'add' ? 'score-add' : 'score-deduct'">
                    {{ rule.type === 'add' ? '+' : '-' }}{{ rule.score }}
                  </td>
                  <td data-label="惩罚" class="punishment-cell">
                    <template v-if="rule.punishment && Object.keys(rule.punishment).length">
                      <span class="punishment-badge" v-for="(item, i) in Object.entries(rule.punishment ?? {})" :key="i">
                        {{ item[0] }}: {{ item[1] }}
                      </span>
                    </template>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td data-label="状态">
                    <BaseBadge :variant="rule.enabled ? 'success' : 'default'">
                      {{ rule.enabled ? '启用' : '禁用' }}
                    </BaseBadge>
                  </td>
                  <td data-label="操作" class="actions-cell">
                    <BaseButton size="sm" variant="ghost" @click="openEdit(rule)">编辑</BaseButton>
                    <BaseButton size="sm" variant="danger" @click="openDelete(rule)">删除</BaseButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>
    </div>

    <BaseModal :open="showCreateModal" title="新建规则" @close="showCreateModal = false">
      <div class="form-group">
        <label>标题</label>
        <input v-model="form.title" class="form-input" placeholder="规则标题" />
      </div>
      <div class="form-group">
        <label>分类</label>
        <input :value="selectedCategory?.name" class="form-input" readonly />
      </div>
      <div class="form-group">
        <label>类型</label>
        <div class="radio-group">
          <label class="radio-label">
            <input type="radio" v-model="form.type" value="add" />
            <span>加分</span>
          </label>
          <label class="radio-label">
            <input type="radio" v-model="form.type" value="deduct" />
            <span>扣分</span>
          </label>
        </div>
      </div>
      <div class="form-group">
        <label>分值</label>
        <input v-model.number="form.score" class="form-input" type="number" min="0" />
      </div>
      <div class="form-group">
        <label class="label-row">
          <span>惩罚（可选）</span>
          <BaseButton size="sm" variant="ghost" @click="addPunishmentRow">+ 添加</BaseButton>
        </label>
        <div v-for="(row, i) in form.punishment" :key="i" class="punishment-row">
           <input v-model="row.type" class="form-input pun-type" placeholder="类型（如 打手心）" />
          <input v-model.number="row.amount" class="form-input pun-amount" type="number" min="0" placeholder="数量" />
          <button class="pun-remove" @click="removePunishmentRow(i)">✕</button>
        </div>
      </div>
      <div class="form-group">
        <label class="toggle-label">
          <input type="checkbox" v-model="form.enabled" />
          <span>启用</span>
        </label>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="showCreateModal = false">取消</BaseButton>
        <BaseButton variant="primary" @click="createRule">确定</BaseButton>
      </template>
    </BaseModal>

    <BaseModal :open="showEditModal" title="编辑规则" @close="showEditModal = false">
      <div class="form-group">
        <label>标题</label>
        <input v-model="form.title" class="form-input" />
      </div>
      <div class="form-group">
        <label>类型</label>
        <div class="radio-group">
          <label class="radio-label">
            <input type="radio" v-model="form.type" value="add" />
            <span>加分</span>
          </label>
          <label class="radio-label">
            <input type="radio" v-model="form.type" value="deduct" />
            <span>扣分</span>
          </label>
        </div>
      </div>
      <div class="form-group">
        <label>分值</label>
        <input v-model.number="form.score" class="form-input" type="number" min="0" />
      </div>
      <div class="form-group">
        <label class="label-row">
          <span>惩罚（可选）</span>
          <BaseButton size="sm" variant="ghost" @click="addPunishmentRow">+ 添加</BaseButton>
        </label>
        <div v-for="(row, i) in form.punishment" :key="i" class="punishment-row">
          <input v-model="row.type" class="form-input pun-type" placeholder="类型" />
          <input v-model.number="row.amount" class="form-input pun-amount" type="number" min="0" placeholder="数量" />
          <button class="pun-remove" @click="removePunishmentRow(i)">✕</button>
        </div>
      </div>
      <div class="form-group">
        <label class="toggle-label">
          <input type="checkbox" v-model="form.enabled" />
          <span>启用</span>
        </label>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="showEditModal = false">取消</BaseButton>
        <BaseButton variant="primary" @click="updateRule">保存</BaseButton>
      </template>
    </BaseModal>

    <BaseModal :open="showDeleteModal" title="确认删除" width="360px" @close="showDeleteModal = false">
      <p>确定要删除规则 <strong>{{ deletingRule?.title }}</strong> 吗？</p>
      <template #footer>
        <BaseButton variant="secondary" @click="showDeleteModal = false">取消</BaseButton>
        <BaseButton variant="danger" @click="deleteRule">删除</BaseButton>
      </template>
    </BaseModal>

    <BaseModal :open="showBatchDeleteModal" title="批量删除" width="360px" @close="showBatchDeleteModal = false">
      <p>确定要删除选中的 {{ selectedIds.size }} 条规则吗？此操作不可撤销。</p>
      <template #footer>
        <BaseButton variant="secondary" @click="showBatchDeleteModal = false">取消</BaseButton>
        <BaseButton variant="danger" @click="batchDelete">删除</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.rules-view {
  height: 100%;
}

.rules-layout {
  display: flex;
  gap: var(--spacing-lg);
  height: 100%;
}

.category-tree {
  width: 220px;
  flex-shrink: 0;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  align-self: flex-start;
  position: sticky;
  top: var(--spacing-md);
}

.tree-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-md);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tree-loading {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.tree-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tree-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 8px 10px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-text);
  transition: background 0.15s;
}

.tree-item:hover {
  background: var(--color-bg-elevated);
}

.tree-item.active {
  background: rgba(99, 102, 241, 0.15);
  color: var(--color-primary);
}

.tree-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.rules-content {
  flex: 1;
  min-width: 0;
}

.rules-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.rules-title {
  font-size: 1.125rem;
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

.batch-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
}

.batch-count {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-right: auto;
}

.rules-table-wrap {
  overflow-x: auto;
}

.rules-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.rules-table th {
  text-align: left;
  padding: 10px var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-weight: 500;
  white-space: nowrap;
}

.rules-table td {
  padding: 10px var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.check-col {
  width: 36px;
  text-align: center;
}

.score-add {
  color: var(--color-score-positive, #22c55e);
  font-weight: 600;
}

.score-deduct {
  color: var(--color-score-negative, #ef4444);
  font-weight: 600;
}

.text-muted {
  color: var(--color-text-muted);
}

.punishment-cell {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.punishment-badge {
  background: var(--color-bg-elevated);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  white-space: nowrap;
}

.actions-cell {
  display: flex;
  gap: var(--spacing-xs);
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

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-input {
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

.form-input:focus {
  border-color: var(--color-primary);
}

.form-input[readonly] {
  opacity: 0.6;
  cursor: not-allowed;
}

.radio-group {
  display: flex;
  gap: var(--spacing-md);
}

.radio-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-text);
}

.punishment-row {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.pun-type {
  flex: 1;
}

.pun-amount {
  width: 100px;
}

.pun-remove {
  background: none;
  border: none;
  color: var(--color-danger);
  font-size: 1rem;
  cursor: pointer;
  padding: 0 4px;
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
  .rules-layout {
    flex-direction: column;
  }

  .category-tree {
    width: 100%;
    position: static;
  }

  .rules-table thead {
    display: none;
  }

  .rules-table tr {
    display: block;
    padding: var(--spacing-md) 0;
    border-bottom: 1px solid var(--color-border);
  }

  .rules-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px var(--spacing-sm);
    border-bottom: none;
  }

  .rules-table td::before {
    content: attr(data-label);
    font-weight: 500;
    color: var(--color-text-muted);
    margin-right: var(--spacing-md);
  }

  .check-col {
    width: auto;
  }

  .actions-cell {
    justify-content: flex-end;
  }
}
</style>
