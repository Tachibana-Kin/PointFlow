import { api } from './client'
import type { Reward, RewardRequest } from '@/types'

export async function list(): Promise<Reward[]> {
  return api.list<Reward>('rewards', { select: '*', order: 'created_at.desc' })
}

export async function create(data: Partial<Reward>): Promise<Reward> {
  return api.create<Reward>('rewards', data)
}

export async function update(id: string, data: Partial<Reward>): Promise<Reward> {
  return api.update<Reward>('rewards', id, data)
}

export async function remove(id: string): Promise<void> {
  return api.remove('rewards', id)
}

export async function getRequests(): Promise<RewardRequest[]> {
  return api.list<RewardRequest>('reward_requests', { select: '*,reward:reward_id(title,cost),user:user_id(name)', order: 'created_at.desc' })
}

function getUserId(): string | null {
  try {
    const u = JSON.parse(localStorage.getItem('pf_user') ?? 'null')
    return u?.id ?? null
  } catch { return null }
}

export async function createRequest(reward_id: string): Promise<RewardRequest> {
  const uid = getUserId()
  const payload: any = { reward_id }
  if (uid) payload.user_id = uid
  return api.create<RewardRequest>('reward_requests', payload)
}

export async function reviewRequest(id: string, status: 'approved' | 'rejected'): Promise<RewardRequest> {
  return api.update<RewardRequest>('reward_requests', id, { status } as any)
}
