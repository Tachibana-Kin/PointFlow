import { api } from './client'
import type { PunishmentLog } from '@/types'

export async function list(record_id?: string): Promise<PunishmentLog[]> {
  const q: Record<string, string> = { order: 'created_at.asc' }
  if (record_id) q.record_id = `eq.${record_id}`
  return api.list<PunishmentLog>('punishment_logs', q)
}

export async function create(data: { record_id: string; type: string; amount: number; remark?: string }): Promise<PunishmentLog> {
  return api.create<PunishmentLog>('punishment_logs', data)
}

export async function markExecuted(id: string): Promise<PunishmentLog> {
  return api.update<PunishmentLog>('punishment_logs', id, { executed: true, executed_at: new Date().toISOString() } as any)
}
