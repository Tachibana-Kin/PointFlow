import { api } from './client'
import type { Pair } from '@/types'

export async function list(): Promise<Pair[]> {
  return api.list<Pair>('pairs', { select: '*,manager:manager_id(name),member:member_id(name)', order: 'created_at.desc' })
}

export async function create(data: { manager_id: string; member_id: string; name?: string }): Promise<Pair> {
  return api.create<Pair>('pairs', data)
}

export async function remove(id: string): Promise<void> {
  return api.remove('pairs', id)
}
