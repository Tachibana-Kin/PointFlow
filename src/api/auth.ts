import { rpcCall, supabase } from './client'
import type { User } from '@/types'

export async function login(name: string, password: string): Promise<User> {
  return rpcCall<User>('login_user', { p_name: name, p_password: password })
}

export async function logout(): Promise<void> {
  localStorage.removeItem('pf_token')
  localStorage.removeItem('pf_user')
}

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('pf_user')
    return raw ? JSON.parse(raw) as User : null
  } catch { return null }
}

export function setStoredUser(user: User): void {
  localStorage.setItem('pf_user', JSON.stringify(user))
  localStorage.setItem('pf_token', '1')
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  const user = getStoredUser()
  if (!user) throw new Error('未登录')
  // verify old password by logging in
  await login(user.name, oldPassword)
  // update password via RPC (no return needed)
  const { error } = await supabase.rpc('update_password', { p_user_id: user.id, p_password: newPassword })
  if (error) throw new Error(error.message)
}
