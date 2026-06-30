import { api } from './client'
import type { User } from '@/types'

export async function list(): Promise<User[]> {
  return api.list<User>('users', { select: '*', order: 'created_at.desc' })
}

export async function create(data: Partial<User>): Promise<User> {
  return api.create<User>('users', data)
}

export async function update(id: string, data: Partial<User>): Promise<User> {
  return api.update<User>('users', id, data)
}

export async function remove(id: string): Promise<void> {
  return api.remove('users', id)
}
