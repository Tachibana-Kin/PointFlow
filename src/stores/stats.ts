import { defineStore } from 'pinia'
import { ref } from 'vue'
import { stats as statsApi } from '@/api'

export const useStatsStore = defineStore('stats', () => {
  const dailyTrend = ref<{ date: string; score: number }[]>([])
  const categoryBreakdown = ref<{ category: string; score: number }[]>([])
  const monthlyStats = ref<{ month: string; score: number }[]>([])
  const leaderboard = ref<{ user_id: string; user_name: string; score: number }[]>([])
  const loading = ref(false)

  async function fetchDailyTrend() {
    loading.value = true
    try {
      dailyTrend.value = await statsApi.getDailyTrend()
    } catch (e) {
      console.error('Fetch daily trend failed', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchCategoryBreakdown() {
    loading.value = true
    try {
      categoryBreakdown.value = await statsApi.getCategoryBreakdown()
    } catch (e) {
      console.error('Fetch category breakdown failed', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchMonthly() {
    loading.value = true
    try {
      monthlyStats.value = await statsApi.getMonthly()
    } catch (e) {
      console.error('Fetch monthly stats failed', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchLeaderboard() {
    loading.value = true
    try {
      leaderboard.value = await statsApi.getLeaderboard()
    } catch (e) {
      console.error('Fetch leaderboard failed', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchAll() {
    await Promise.all([
      fetchDailyTrend(),
      fetchCategoryBreakdown(),
      fetchMonthly(),
      fetchLeaderboard(),
    ])
  }

  return {
    dailyTrend,
    categoryBreakdown,
    monthlyStats,
    leaderboard,
    loading,
    fetchDailyTrend,
    fetchCategoryBreakdown,
    fetchMonthly,
    fetchLeaderboard,
    fetchAll,
  }
})
