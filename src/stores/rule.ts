import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Rule, RuleFilters, BatchAction } from '@/types'
import * as rulesApi from '@/api/rules'

export const useRuleStore = defineStore('rule', () => {
  const rules = ref<Rule[]>([])
  const loading = ref(false)
  const filters = ref<RuleFilters>({})

  const rulesByCategory = computed(() => (categoryId: string) =>
    rules.value.filter((r) => r.category_id === categoryId)
  )
  const enabledRules = computed(() =>
    rules.value.filter((r) => r.enabled)
  )

  async function fetchRules(overrideFilters?: RuleFilters) {
    loading.value = true
    try {
      const activeFilters = overrideFilters ?? filters.value
      rules.value = await rulesApi.list(activeFilters as Record<string, string>)
    } catch (e) {
      console.error('Fetch rules failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createRule(data: Partial<Rule>) {
    loading.value = true
    try {
      const created = await rulesApi.create(data)
      rules.value.push(created)
      return created
    } catch (e) {
      console.error('Create rule failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateRule(id: string, data: Partial<Rule>) {
    loading.value = true
    try {
      const updated = await rulesApi.update(id, data)
      const idx = rules.value.findIndex((r) => r.id === id)
      if (idx !== -1) rules.value[idx] = updated
      return updated
    } catch (e) {
      console.error('Update rule failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteRule(id: string) {
    loading.value = true
    try {
      await rulesApi.remove(id)
      rules.value = rules.value.filter((r) => r.id !== id)
    } catch (e) {
      console.error('Delete rule failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function batchAction(data: BatchAction) {
    loading.value = true
    try {
      await rulesApi.batch(data)
      await fetchRules()
    } catch (e) {
      console.error('Batch action failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  function setFilters(newFilters: RuleFilters) {
    filters.value = newFilters
  }

  return {
    rules,
    loading,
    filters,
    rulesByCategory,
    enabledRules,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    batchAction,
    setFilters,
  }
})
