<script setup lang="ts">
import { ref } from 'vue'
import type { Rule } from '@/types'

interface Props {
  rules: Rule[]
  loading?: boolean
}
const props = withDefaults(defineProps<Props>(), { loading: false })

const emit = defineEmits<{
  edit: [rule: Rule]
  delete: [ruleId: string]
  toggle: [ruleId: string]
  batch: [ids: string[], action: string]
}>()

const selectedIds = ref<Set<string>>(new Set())

function toggleSelect(id: string) {
  const s = new Set(selectedIds.value)
  if (s.has(id)) { s.delete(id) } else { s.add(id) }
  selectedIds.value = s
}

function toggleSelectAll() {
  if (selectedIds.value.size === props.rules.length) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(props.rules.map(r => r.id))
  }
}

function emitBatch(action: string) {
  if (selectedIds.value.size) {
    emit('batch', [...selectedIds.value], action)
    selectedIds.value = new Set()
  }
}
</script>

<template>
  <div>
    <div v-if="selectedIds.size" class="batch-bar">
      <span class="selected-count">已选 {{ selectedIds.size }} 项</span>
      <button class="batch-btn" @click="emitBatch('enable')">启用</button>
      <button class="batch-btn" @click="emitBatch('disable')">禁用</button>
      <button class="batch-btn danger" @click="emitBatch('delete')">删除</button>
    </div>

    <div class="table-wrapper">
      <table class="rules-table">
        <thead>
          <tr>
            <th><input type="checkbox" :checked="rules.length > 0 && selectedIds.size === rules.length" @change="toggleSelectAll" /></th>
            <th>规则</th>
            <th>分值</th>
            <th>处罚</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rule in rules" :key="rule.id" class="table-row">
            <td><input type="checkbox" :checked="selectedIds.has(rule.id)" @change="toggleSelect(rule.id)" /></td>
            <td class="cell-title">{{ rule.title }}</td>
            <td>
              <span class="score" :class="rule.type === 'add' ? 'add' : 'deduct'">
                {{ rule.type === 'add' ? '+' : '-' }}{{ rule.score }}
              </span>
            </td>
            <td class="cell-punish">
              <span v-if="rule.punishment && Object.keys(rule.punishment).length">
                <span v-for="(item, idx) in Object.entries(rule.punishment)" :key="idx">
                  {{ idx > 0 ? ' / ' : '' }}{{ item[0] }} {{ item[1] }}
                </span>
              </span>
              <span v-else class="muted">—</span>
            </td>
            <td>
              <button class="toggle-btn" :class="{ on: rule.enabled }" @click="emit('toggle', rule.id)">
                {{ rule.enabled ? '启用' : '禁用' }}
              </button>
            </td>
            <td class="cell-actions">
              <button class="action-btn" @click="emit('edit', rule)">编辑</button>
              <button class="action-btn danger" @click="emit('delete', rule.id)">删除</button>
            </td>
          </tr>
          <tr v-if="!rules.length && !loading">
            <td colspan="6" class="empty-row">暂无规则</td>
          </tr>
          <tr v-if="loading">
            <td colspan="6" class="empty-row">加载中…</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mobile-cards">
      <div v-for="rule in rules" :key="rule.id" class="mobile-card">
        <div class="mobile-header">
          <input type="checkbox" :checked="selectedIds.has(rule.id)" @change="toggleSelect(rule.id)" />
          <span class="mobile-title">{{ rule.title }}</span>
          <span class="score" :class="rule.type === 'add' ? 'add' : 'deduct'">
            {{ rule.type === 'add' ? '+' : '-' }}{{ rule.score }}
          </span>
        </div>
        <div class="mobile-body">
          <div v-if="rule.punishment && Object.keys(rule.punishment).length" class="mobile-punish">
            <span v-for="(item, idx) in Object.entries(rule.punishment)" :key="idx">
              {{ idx > 0 ? ' / ' : '' }}{{ item[0] }} {{ item[1] }}
            </span>
          </div>
          <div class="mobile-actions">
            <button class="toggle-btn" :class="{ on: rule.enabled }" @click="emit('toggle', rule.id)">
              {{ rule.enabled ? '启用' : '禁用' }}
            </button>
            <button class="action-btn" @click="emit('edit', rule)">编辑</button>
            <button class="action-btn danger" @click="emit('delete', rule.id)">删除</button>
          </div>
        </div>
      </div>
      <div v-if="!rules.length && !loading" class="empty-mobile">暂无规则</div>
      <div v-if="loading" class="empty-mobile">加载中…</div>
    </div>
  </div>
</template>

<style scoped>
.batch-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
}
.selected-count {
  font-size: var(--font-size-sm, 13px);
  color: var(--color-primary);
  margin-right: auto;
}
.batch-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 12px;
  cursor: pointer;
}
.batch-btn.danger {
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.rules-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm, 13px);
}
.rules-table th {
  text-align: left;
  padding: var(--spacing-sm);
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  font-weight: 500;
  white-space: nowrap;
}
.rules-table td {
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}
.table-row:hover {
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
}
.cell-title {
  font-weight: 500;
}
.score {
  font-weight: 700;
  white-space: nowrap;
}
.add { color: var(--color-success); }
.deduct { color: var(--color-danger); }
.cell-punish {
  color: var(--color-text-muted);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.muted { color: var(--color-text-muted); }
.toggle-btn {
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.toggle-btn.on {
  background: color-mix(in srgb, var(--color-success) 20%, transparent);
  border-color: var(--color-success);
  color: var(--color-success);
}
.cell-actions {
  display: flex;
  gap: var(--spacing-xs);
}
.action-btn {
  padding: 2px 8px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 12px;
  cursor: pointer;
}
.action-btn.danger {
  color: var(--color-danger);
  border-color: var(--color-danger);
}
.empty-row {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--color-text-muted);
}

.mobile-cards {
  display: none;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.mobile-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
}
.mobile-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.mobile-title {
  flex: 1;
  font-weight: 500;
  font-size: var(--font-size-md, 15px);
}
.mobile-body {
  margin-top: var(--spacing-sm);
  padding-left: 28px;
}
.mobile-punish {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm, 13px);
  margin-bottom: var(--spacing-sm);
}
.mobile-actions {
  display: flex;
  gap: var(--spacing-sm);
}
.empty-mobile {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .table-wrapper {
    display: none;
  }
  .mobile-cards {
    display: flex;
  }
}
</style>
