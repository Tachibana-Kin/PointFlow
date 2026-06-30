import { api, rpcCall } from './client'
import type { PointRecord, ReviewBody } from '@/types'

function getUserId(): string | null {
  try {
    const u = JSON.parse(localStorage.getItem('pf_user') ?? 'null')
    return u?.id ?? null
  } catch { return null }
}

export async function list(params?: Record<string, string>): Promise<PointRecord[]> {
  const q: Record<string, string> = {
    select: '*,rule:rule_id(title,type,category:category_id(name)),user:user_id(name),punishment_logs:punishment_logs(*)',
    order: 'created_at.desc',
  }
  if (params?.status) q.status = `eq.${params.status}`
  if (params?.user_id) q.user_id = `eq.${params.user_id}`
  if (params?.pair_id) q.pair_id = `eq.${params.pair_id}`
  if (params?.limit) q.limit = params.limit
  return api.list<PointRecord>('records', q)
}

export async function create(data: { rule_id: string; remark?: string }): Promise<PointRecord> {
  const uid = getUserId()
  // Fetch rule to get score, pair_id, and punishment
  const rule = await api.get<any>('rules', data.rule_id)
  const payload: any = {
    rule_id: data.rule_id,
    remark: data.remark ?? null,
    score: rule?.score ?? 0,
    pair_id: rule?.pair_id ?? null,
  }
  if (rule?.punishment && Object.keys(rule.punishment).length > 0) {
    payload.punishment = rule.punishment
  }
  if (uid) payload.user_id = uid
  const created = await api.create<PointRecord>('records', payload)

  // Try to create punishment_logs entries (best-effort, don't fail the request)
  try {
    if (rule?.punishment && Object.keys(rule.punishment).length > 0) {
      for (const [type, amount] of Object.entries(rule.punishment)) {
        await api.create('punishment_logs', {
          record_id: (created as any).id,
          type,
          amount,
          executed: false,
        })
      }
    }
  } catch (e) {
    console.error('Failed to create punishment_logs (non-fatal)', e)
  }
  return created
}

export async function getById(id: string): Promise<PointRecord> {
  const record = await api.get<any>('records', id)
  // Also fetch punishment_logs for this record
  try {
    const logs = await api.list<any>('punishment_logs', {
      record_id: `eq.${id}`,
      order: 'created_at.asc',
    })
    record.punishment_logs = logs
  } catch (e) {
    record.punishment_logs = []
  }
  return record
}

export async function review(id: string, body: ReviewBody): Promise<PointRecord> {
  const uid = getUserId()
  return api.update<PointRecord>('records', id, {
    status: body.status,
    score: body.score ?? undefined,
    remark: body.remark ?? undefined,
    reviewer_id: uid,
    reviewed_at: new Date().toISOString(),
  } as any)
}
