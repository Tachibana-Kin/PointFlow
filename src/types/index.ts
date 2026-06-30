export type UserRole = 'super_admin' | 'manager' | 'member'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  created_at: string
}

export interface Pair {
  id: string
  manager_id: string
  member_id: string
  name?: string
  created_at: string
  manager_name?: string
  member_name?: string
}

export interface Category {
  id: string
  name: string
  icon?: string
  color?: string
}

export type RuleType = 'add' | 'deduct'

export interface Rule {
  id: string
  pair_id: string
  category_id: string
  title: string
  score: number
  type: RuleType
  punishment?: Record<string, number>
  enabled: boolean
  created_at: string
  updated_at: string
  category_name?: string
}

export type RecordStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface PointRecord {
  id: string
  pair_id: string
  user_id: string
  rule_id: string
  score: number
  punishment?: Record<string, number>
  remark?: string
  image_urls?: string[]
  status: RecordStatus
  reviewer_id?: string
  reviewed_at?: string
  created_at: string
  rule_title?: string
  rule_type?: RuleType
  category_name?: string
  user_name?: string
  reviewer_name?: string
  punishment_logs?: PunishmentLog[]
}

export interface PunishmentLog {
  id: string
  record_id: string
  type: string
  amount: number
  executed: boolean
  executed_at?: string
  remark?: string
  created_at: string
}

export interface Streak {
  id: string
  user_id: string
  pair_id: string
  current_streak: number
  max_streak: number
  last_qualified?: string
}

export interface Reward {
  id: string
  pair_id: string
  title: string
  cost: number
  description?: string
  enabled: boolean
  created_at: string
}

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface RewardRequest {
  id: string
  reward_id: string
  user_id: string
  status: RequestStatus
  reviewer_id?: string
  created_at: string
  reviewed_at?: string
  reward_title?: string
  reward_cost?: number
  user_name?: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  content?: string
  read: boolean
  created_at: string
}

export interface DashboardData {
  current_score: number
  today_score: number
  week_score: number
  month_score: number
  streak: number
  pending_review: number
  pending_punishments: number
}

export interface ApiResponse<T> {
  data: T
}

export interface ApiListResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
}

export interface ApiError {
  error: {
    code: string
    message: string
  }
}

export interface BatchAction {
  ids: string[]
  action: 'enable' | 'disable' | 'delete'
}

export interface ReviewBody {
  status: 'approved' | 'rejected'
  score?: number
  remark?: string
}

export interface RecordFilters {
  status?: RecordStatus
  category_id?: string
  date_from?: string
  date_to?: string
  page?: number
  page_size?: number
  user_id?: string
  pair_id?: string
  limit?: string
}

export interface RuleFilters {
  category_id?: string
  pair_id?: string
  enabled?: boolean
}
