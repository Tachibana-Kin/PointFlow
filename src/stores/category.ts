import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Category } from '@/types'
import * as categoriesApi from '@/api/categories'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<Category[]>([])
  const loading = ref(false)

  async function fetchCategories() {
    loading.value = true
    try {
      categories.value = await categoriesApi.list()
    } catch (e) {
      console.error('Fetch categories failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createCategory(data: Partial<Category>) {
    loading.value = true
    try {
      const created = await categoriesApi.create(data)
      categories.value.push(created)
      return created
    } catch (e) {
      console.error('Create category failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateCategory(id: string, data: Partial<Category>) {
    loading.value = true
    try {
      const updated = await categoriesApi.update(id, data)
      const idx = categories.value.findIndex((c) => c.id === id)
      if (idx !== -1) categories.value[idx] = updated
      return updated
    } catch (e) {
      console.error('Update category failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteCategory(id: string) {
    loading.value = true
    try {
      await categoriesApi.remove(id)
      categories.value = categories.value.filter((c) => c.id !== id)
    } catch (e) {
      console.error('Delete category failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    loading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})
