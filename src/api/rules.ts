import { api } from './client'
import type { Rule, BatchAction } from '@/types'

export async function list(params?: Record<string, string>): Promise<Rule[]> {
  const q: Record<string, string> = { select: '*,category:category_id(name)', order: 'created_at.desc' }
  if (params?.category_id) q.category_id = `eq.${params.category_id}`
  if (params?.pair_id) q.pair_id = `eq.${params.pair_id}`
  if (params?.enabled) q.enabled = `eq.${params.enabled}`
  return api.list<Rule>('rules', q)
}

export async function create(data: Partial<Rule>): Promise<Rule> {
  return api.create<Rule>('rules', data)
}

export async function update(id: string, data: Partial<Rule>): Promise<Rule> {
  return api.update<Rule>('rules', id, data)
}

export async function remove(id: string): Promise<void> {
  return api.remove('rules', id)
}

export async function batch(data: BatchAction): Promise<void> {
  for (const id of data.ids) {
    if (data.action === 'delete') {
      await api.remove('rules', id)
    } else {
      await api.update('rules', id, { enabled: data.action === 'enable' } as any)
    }
  }
}
