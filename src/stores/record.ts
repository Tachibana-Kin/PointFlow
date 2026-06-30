import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PointRecord, RecordFilters, ReviewBody } from '@/types'
import * as recordsApi from '@/api/records'

export const useRecordStore = defineStore('record', () => {
  const records = ref<PointRecord[]>([])
  const currentRecord = ref<PointRecord | null>(null)
  const loading = ref(false)
  const filters = ref<RecordFilters>({
    page: 1,
    page_size: 20,
  })
  const total = ref(0)
  const page = ref(1)

  const pendingRecords = computed(() =>
    records.value.filter((r) => r.status === 'pending')
  )
  const todayRecords = computed(() => {
    const today = new Date().toDateString()
    return records.value.filter(
      (r) => new Date(r.created_at).toDateString() === today
    )
  })

  async function fetchRecords(overrideFilters?: RecordFilters) {
    loading.value = true
    try {
      const activeFilters = overrideFilters ?? filters.value
      const result = await recordsApi.list(activeFilters as Record<string, string>)
      records.value = result
      total.value = result.length
      page.value = 1
    } catch (e) {
      console.error('Fetch records failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createRecord(data: { rule_id: string; remark?: string }) {
    loading.value = true
    try {
      const created = await recordsApi.create(data)
      records.value.unshift(created)
      total.value++
      return created
    } catch (e) {
      console.error('Create record failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchRecordById(id: string) {
    loading.value = true
    try {
      currentRecord.value = await recordsApi.getById(id)
    } catch (e) {
      console.error('Fetch record failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function reviewRecord(id: string, body: ReviewBody) {
    loading.value = true
    try {
      const updated = await recordsApi.review(id, body)
      const idx = records.value.findIndex((r) => r.id === id)
      if (idx !== -1) records.value[idx] = updated
      if (currentRecord.value?.id === id) currentRecord.value = updated
      return updated
    } catch (e) {
      console.error('Review record failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  function setFilters(newFilters: RecordFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  return {
    records,
    currentRecord,
    loading,
    filters,
    total,
    page,
    pendingRecords,
    todayRecords,
    fetchRecords,
    createRecord,
    fetchRecordById,
    reviewRecord,
    setFilters,
  }
})
