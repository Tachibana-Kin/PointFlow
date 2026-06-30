import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PunishmentLog } from '@/types'
import * as punishmentsApi from '@/api/punishments'

export const usePunishmentStore = defineStore('punishment', () => {
  const punishmentLogs = ref<PunishmentLog[]>([])
  const loading = ref(false)

  const pendingExecutions = computed(() =>
    punishmentLogs.value.filter((log) => !log.executed)
  )

  async function fetchLogs(recordId?: string) {
    loading.value = true
    try {
      punishmentLogs.value = await punishmentsApi.list(recordId)
    } catch (e) {
      console.error('Fetch punishment logs failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createLog(data: { record_id: string; type: string; amount: number; remark?: string }) {
    loading.value = true
    try {
      const created = await punishmentsApi.create(data)
      punishmentLogs.value.push(created)
      return created
    } catch (e) {
      console.error('Create punishment log failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function markExecuted(id: string) {
    loading.value = true
    try {
      const updated = await punishmentsApi.markExecuted(id)
      const idx = punishmentLogs.value.findIndex((log) => log.id === id)
      if (idx !== -1) punishmentLogs.value[idx] = updated
      return updated
    } catch (e) {
      console.error('Mark executed failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    punishmentLogs,
    loading,
    pendingExecutions,
    fetchLogs,
    createLog,
    markExecuted,
  }
})
