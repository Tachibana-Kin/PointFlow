import { createClient } from '@supabase/supabase-js'
import type { ApiError } from '@/types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Supabase client for DB operations (no auth)
const supabase = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

export class ApiClientError extends Error {
  code: string
  status: number
  constructor(code: string, message: string, status: number) {
    super(message)
    this.name = 'ApiClientError'
    this.code = code
    this.status = status
  }
}

// RPC call (for login etc.)
export async function rpcCall<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.rpc(fn, args)
  if (error) {
    throw new ApiClientError(error.code ?? 'RPC_ERROR', error.message, 400)
  }
  return data as T
}

// Raw fetch for REST API (bypasses Supabase JS client)
const REST_URL = `${SUPABASE_URL}/rest/v1`

async function restRequest<T>(
  method: string,
  path: string,
  options: { body?: unknown; params?: Record<string, string> } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': ANON_KEY,
  }

  // POST/PATCH: ask Supabase to return the full row
  if (method === 'POST' || method === 'PATCH') {
    headers['Prefer'] = 'return=representation'
  }

  let url = `${REST_URL}${path}`
  if (options.params) {
    const qs = new URLSearchParams(options.params).toString()
    if (qs) url += `?${qs}`
  }

  const res = await fetch(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    const msg = err.message ?? err.msg ?? res.statusText
    throw new ApiClientError(err.code ?? 'HTTP_ERROR', msg, res.status)
  }

  if (res.status === 204) return undefined as T

  let body: any
  try {
    body = await res.json()
  } catch {
    // empty body after success — return a stub so callers don't crash
    return { id: '' } as T
  }

  return body as T
}

export const api = {
  list<T>(table: string, params?: Record<string, string>): Promise<T[]> {
    return restRequest<T[]>('GET', `/${table}`, { params })
  },
  get<T>(table: string, id: string): Promise<T> {
    return restRequest<T>('GET', `/${table}`, {
      params: { id: `eq.${id}`, select: '*' },
    }).then((res) => {
      // REST API returns array for GET with eq filter
      const arr = res as unknown as T[]
      if (Array.isArray(arr)) return arr[0]
      return res
    })
  },
  create<T>(table: string, data: Partial<T>): Promise<T> {
    return restRequest<T>('POST', `/${table}`, { body: data })
  },
  update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    return restRequest<T>('PATCH', `/${table}`, {
      params: { id: `eq.${id}` },
      body: data,
    }).then(() => this.get(table, id))
  },
  remove(table: string, id: string): Promise<void> {
    return restRequest<void>('DELETE', `/${table}`, {
      params: { id: `eq.${id}` },
    })
  },
  rpc: rpcCall,
}

export { supabase }
