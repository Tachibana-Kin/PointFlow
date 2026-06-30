import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Reward, RewardRequest } from '@/types'
import * as rewardsApi from '@/api/rewards'

export const useRewardStore = defineStore('reward', () => {
  const rewards = ref<Reward[]>([])
  const requests = ref<RewardRequest[]>([])
  const loading = ref(false)

  const enabledRewards = computed(() =>
    rewards.value.filter((r) => r.enabled)
  )

  async function fetchRewards() {
    loading.value = true
    try {
      rewards.value = await rewardsApi.list()
    } catch (e) {
      console.error('Fetch rewards failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createReward(data: Partial<Reward>) {
    loading.value = true
    try {
      const created = await rewardsApi.create(data)
      rewards.value.push(created)
      return created
    } catch (e) {
      console.error('Create reward failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateReward(id: string, data: Partial<Reward>) {
    loading.value = true
    try {
      const updated = await rewardsApi.update(id, data)
      const idx = rewards.value.findIndex((r) => r.id === id)
      if (idx !== -1) rewards.value[idx] = updated
      return updated
    } catch (e) {
      console.error('Update reward failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteReward(id: string) {
    loading.value = true
    try {
      await rewardsApi.remove(id)
      rewards.value = rewards.value.filter((r) => r.id !== id)
    } catch (e) {
      console.error('Delete reward failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchRequests() {
    loading.value = true
    try {
      requests.value = await rewardsApi.getRequests()
    } catch (e) {
      console.error('Fetch reward requests failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createRequest(rewardId: string) {
    loading.value = true
    try {
      const created = await rewardsApi.createRequest(rewardId)
      requests.value.push(created)
      return created
    } catch (e) {
      console.error('Create reward request failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function reviewRequest(id: string, status: 'approved' | 'rejected') {
    loading.value = true
    try {
      const updated = await rewardsApi.reviewRequest(id, status)
      const idx = requests.value.findIndex((r) => r.id === id)
      if (idx !== -1) requests.value[idx] = updated
      return updated
    } catch (e) {
      console.error('Review reward request failed', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    rewards,
    requests,
    loading,
    enabledRewards,
    fetchRewards,
    createReward,
    updateReward,
    deleteReward,
    fetchRequests,
    createRequest,
    reviewRequest,
  }
})
