<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/category'
import type { Category } from '@/types'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseEmpty from '@/components/common/BaseEmpty.vue'

const store = useCategoryStore()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingItem = ref<Category | null>(null)
const deletingItem = ref<Category | null>(null)
const error = ref('')

const form = ref({ name: '', icon: '📁', color: '#6366f1' })

const presetColors = [
  '#6366f1', '#22c55e', '#3b82f6', '#ef4444',
  '#eab308', '#a855f7', '#f97316', '#ec4899',
  '#14b8a6', '#06b6d4',
]

function openCreate() {
  form.value = { name: '', icon: '📁', color: presetColors[0] }
  showCreateModal.value = true
}

function openEdit(cat: Category) {
  editingItem.value = cat
  form.value = { name: cat.name, icon: cat.icon || '📁', color: cat.color || presetColors[0] }
  showEditModal.value = true
}

function openDelete(cat: Category) {
  deletingItem.value = cat
  showDeleteModal.value = true
}

async function createCategory() {
  try {
    await store.createCategory({ name: form.value.name, icon: form.value.icon, color: form.value.color })
    showCreateModal.value = false
  } catch (e: any) {
    error.value = e.message || '创建分类失败'
  }
}

async function updateCategory() {
  if (!editingItem.value) return
  try {
    await store.updateCategory(editingItem.value.id, { name: form.value.name, icon: form.value.icon, color: form.value.color })
    showEditModal.value = false
    editingItem.value = null
  } catch (e: any) {
    error.value = e.message || '更新分类失败'
  }
}

async function deleteCategory() {
  if (!deletingItem.value) return
  try {
    await store.deleteCategory(deletingItem.value.id)
    showDeleteModal.value = false
    deletingItem.value = null
  } catch (e: any) {
    error.value = e.message || '删除分类失败'
  }
}

onMounted(() => store.fetchCategories())
</script>

<template>
  <div class="categories-view">
    <header class="page-header">
      <h2 class="page-title">分类管理</h2>
      <BaseButton variant="primary" @click="openCreate">新建分类</BaseButton>
    </header>

    <div v-if="error" class="error-toast">{{ error }}</div>

    <BaseCard v-if="store.loading && !store.categories.length" padding="lg">
      <p class="loading-text">加载中...</p>
    </BaseCard>

    <BaseEmpty v-else-if="!store.categories.length" text="暂无分类数据" />

    <div v-else class="category-grid">
      <div v-for="cat in store.categories" :key="cat.id" class="category-card">
        <div class="category-left">
          <span class="color-dot" :style="{ background: cat.color || '#6366f1' }"></span>
          <span class="category-icon">{{ cat.icon || '📁' }}</span>
          <span class="category-name">{{ cat.name }}</span>
        </div>
        <div class="category-actions">
          <BaseButton size="sm" variant="ghost" @click="openEdit(cat)">编辑</BaseButton>
          <BaseButton size="sm" variant="danger" @click="openDelete(cat)">删除</BaseButton>
        </div>
      </div>
    </div>

    <BaseModal :open="showCreateModal" title="新建分类" @close="showCreateModal = false">
      <div class="form-group">
        <label>名称</label>
        <input v-model="form.name" class="form-input" placeholder="分类名称" />
      </div>
      <div class="form-group">
        <label>图标</label>
        <input v-model="form.icon" class="form-input" placeholder="输入 emoji 或文字" maxlength="4" />
      </div>
      <div class="form-group">
        <label>颜色</label>
        <div class="color-picker">
          <button
            v-for="c in presetColors"
            :key="c"
            class="color-option"
            :class="{ active: form.color === c }"
            :style="{ background: c }"
            @click="form.color = c"
          />
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="showCreateModal = false">取消</BaseButton>
        <BaseButton variant="primary" @click="createCategory">确定</BaseButton>
      </template>
    </BaseModal>

    <BaseModal :open="showEditModal" title="编辑分类" @close="showEditModal = false">
      <div class="form-group">
        <label>名称</label>
        <input v-model="form.name" class="form-input" />
      </div>
      <div class="form-group">
        <label>图标</label>
        <input v-model="form.icon" class="form-input" placeholder="输入 emoji 或文字" maxlength="4" />
      </div>
      <div class="form-group">
        <label>颜色</label>
        <div class="color-picker">
          <button
            v-for="c in presetColors"
            :key="c"
            class="color-option"
            :class="{ active: form.color === c }"
            :style="{ background: c }"
            @click="form.color = c"
          />
        </div>
      </div>
      <template #footer>
        <BaseButton variant="secondary" @click="showEditModal = false">取消</BaseButton>
        <BaseButton variant="primary" @click="updateCategory">保存</BaseButton>
      </template>
    </BaseModal>

    <BaseModal :open="showDeleteModal" title="确认删除" width="360px" @close="showDeleteModal = false">
      <p>确定要删除分类 <strong>{{ deletingItem?.name }}</strong> 吗？</p>
      <template #footer>
        <BaseButton variant="secondary" @click="showDeleteModal = false">取消</BaseButton>
        <BaseButton variant="danger" @click="deleteCategory">删除</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.categories-view {
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

.category-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.category-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: border-color 0.2s;
}

.category-card:hover {
  border-color: var(--color-primary);
}

.category-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.color-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}

.category-icon {
  font-size: 1.25rem;
}

.category-name {
  font-weight: 500;
  color: var(--color-text);
}

.category-actions {
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

.color-picker {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.15s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: var(--color-text);
  transform: scale(1.15);
}
</style>
