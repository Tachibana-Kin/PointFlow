import { api } from './client'
import type { Category } from '@/types'

export async function list(): Promise<Category[]> {
  return api.list<Category>('categories', { select: '*', order: 'name.asc' })
}

export async function create(data: Partial<Category>): Promise<Category> {
  return api.create<Category>('categories', data)
}

export async function update(id: string, data: Partial<Category>): Promise<Category> {
  return api.update<Category>('categories', id, data)
}

export async function remove(id: string): Promise<void> {
  return api.remove('categories', id)
}
