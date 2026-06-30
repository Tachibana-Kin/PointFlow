import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { login as apiLogin, logout as apiLogout, getStoredUser, setStoredUser } from '@/api/auth'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(getStoredUser())
  const loading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role ?? null)
  const isManager = computed(() => userRole.value === 'manager')
  const isMember = computed(() => userRole.value === 'member')
  const isSuperAdmin = computed(() => userRole.value === 'super_admin')

  async function initAuth() {
    const stored = getStoredUser()
    if (stored) {
      user.value = stored
    }
  }

  async function login(name: string, password: string) {
    loading.value = true
    error.value = ''
    try {
      const u = await apiLogin(name, password)
      setStoredUser(u)
      user.value = u
      return u
    } catch (e: any) {
      error.value = e.message || '登录失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    apiLogout()
    user.value = null
    router.push({ name: 'login' })
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isManager,
    isMember,
    isSuperAdmin,
    userRole,
    initAuth,
    login,
    logout,
  }
})
