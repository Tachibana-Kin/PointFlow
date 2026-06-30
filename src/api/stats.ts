import { api } from './client'
import type { DashboardData } from '@/types'

function getUserId(): string | null {
  try {
    const u = JSON.parse(localStorage.getItem('pf_user') ?? 'null')
    return u?.id ?? null
  } catch { return null }
}

export async function getDashboard(): Promise<DashboardData> {
  const uid = getUserId()
  const params: Record<string, string> = { select: 'score,status,created_at,user_id', limit: '1000' }
  if (uid) params.user_id = `eq.${uid}`

  const records = await api.list<any>('records', params)
  const now = new Date()
  const today = now.toDateString()
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const approved = records.filter(r => r.status === 'approved')
  const current_score = approved.reduce((s: number, r: any) => s + (r.score ?? 0), 0)
  const today_score = approved
    .filter((r: any) => new Date(r.created_at).toDateString() === today)
    .reduce((s: number, r: any) => s + (r.score ?? 0), 0)
  const week_score = approved
    .filter((r: any) => new Date(r.created_at) >= weekStart)
    .reduce((s: number, r: any) => s + (r.score ?? 0), 0)
  const month_score = approved
    .filter((r: any) => new Date(r.created_at) >= monthStart)
    .reduce((s: number, r: any) => s + (r.score ?? 0), 0)

  const pending_review = records.filter(r => r.status === 'pending').length

  return {
    current_score,
    today_score,
    week_score,
    month_score,
    streak: 0,
    pending_review,
    pending_punishments: 0,
  }
}

export async function getDailyTrend(): Promise<{ date: string; score: number }[]> {
  const records = await api.list<any>('records', { select: 'score,status,created_at', status: 'eq.approved', limit: '500' })
  const grouped: Record<string, number> = {}
  records.forEach((r: any) => {
    const d = r.created_at?.slice(0, 10)
    if (d) grouped[d] = (grouped[d] ?? 0) + (r.score ?? 0)
  })
  return Object.entries(grouped).map(([date, score]) => ({ date, score })).sort((a, b) => a.date.localeCompare(b.date))
}

export async function getCategoryBreakdown(): Promise<{ category: string; score: number }[]> {
  const records = await api.list<any>('records', {
    select: 'score,status,rule:rule_id(category:category_id(name))',
    status: 'eq.approved',
    limit: '500',
  })
  const grouped: Record<string, number> = {}
  records.forEach((r: any) => {
    const cat = r.rule?.category?.name ?? '其他'
    grouped[cat] = (grouped[cat] ?? 0) + Math.abs(r.score ?? 0)
  })
  return Object.entries(grouped).map(([category, score]) => ({ category, score }))
}

export async function getMonthly(): Promise<{ month: string; score: number }[]> {
  const records = await api.list<any>('records', { select: 'score,status,created_at', status: 'eq.approved', limit: '1000' })
  const grouped: Record<string, number> = {}
  records.forEach((r: any) => {
    const m = r.created_at?.slice(0, 7)
    if (m) grouped[m] = (grouped[m] ?? 0) + (r.score ?? 0)
  })
  return Object.entries(grouped).map(([month, score]) => ({ month, score })).sort((a, b) => a.month.localeCompare(b.month))
}

export async function getLeaderboard(): Promise<{ user_id: string; user_name: string; score: number }[]> {
  const records = await api.list<any>('records', {
    select: 'score,status,user:user_id(name)',
    status: 'eq.approved',
    limit: '1000',
  })
  const grouped: Record<string, { user_name: string; score: number }> = {}
  records.forEach((r: any) => {
    const uid = r.user_id
    if (!uid) return
    if (!grouped[uid]) grouped[uid] = { user_name: r.user?.name ?? '未知', score: 0 }
    grouped[uid].score += r.score ?? 0
  })
  return Object.entries(grouped)
    .map(([user_id, v]) => ({ user_id, user_name: v.user_name, score: v.score }))
    .sort((a, b) => b.score - a.score)
}
