import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Pair } from '@/types'
import * as pairsApi from '@/api/pairs'
import { useAuthStore } from './auth'

export const usePairStore = defineStore('pair', () => {
  const pairs = ref<Pair[]>([])
  const currentPair = ref<Pair | null>(null)
  const loading = ref(false)

  const managerPairs = computed(() => {
    const auth = useAuthStore()
    return pairs.value.filter((p) => p.manager_id === auth.user?.id)
  })
  const memberPair = computed(() => {
    const auth = useAuthStore()
    return pairs.value.find((p) => p.member_id === auth.user?.id) ?? null
  })

  async function fetchPairs() {
    loading.value = true
    try {
      pairs.value = await pairsApi.list()
    } catch (e) {
      console.error('Fetch pairs failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchMyPair() {
    loading.value = true
    try {
      const auth = useAuthStore()
      const all = await pairsApi.list()
      currentPair.value = all.find(
        (p) => p.manager_id === auth.user?.id || p.member_id === auth.user?.id
      ) ?? null
    } catch (e) {
      console.error('Fetch my pair failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  function setCurrentPair(pair: Pair) {
    currentPair.value = pair
  }

  return {
    pairs,
    currentPair,
    loading,
    managerPairs,
    memberPair,
    fetchPairs,
    fetchMyPair,
    setCurrentPair,
  }
})
