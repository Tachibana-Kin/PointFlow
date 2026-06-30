import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DashboardData } from '@/types'
import { getDashboard } from '@/api/stats'

export const useDashboardStore = defineStore('dashboard', () => {
  const data = ref<DashboardData | null>(null)
  const loading = ref(false)

  const currentScore = computed(() => data.value?.current_score ?? 0)
  const pendingCount = computed(() => data.value?.pending_review ?? 0)
  const streakDays = computed(() => data.value?.streak ?? 0)

  async function fetchDashboard() {
    loading.value = true
    try {
      data.value = await getDashboard()
    } catch (e) {
      console.error('Fetch dashboard failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    currentScore,
    pendingCount,
    streakDays,
    fetchDashboard,
  }
})
