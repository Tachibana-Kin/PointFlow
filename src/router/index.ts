import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('pf_user') ?? 'null')
  } catch { return null }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      const user = getUser()
      if (user?.role === 'super_admin') return '/admin/users'
      return '/dashboard'
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/records/new',
    name: 'record-new',
    component: () => import('@/views/RecordNewView.vue'),
    meta: { requiresAuth: true, roles: ['member'] },
  },
  {
    path: '/records',
    name: 'records',
    component: () => import('@/views/RecordsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/records/:id',
    name: 'record-detail',
    component: () => import('@/views/RecordDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/review',
    name: 'review',
    component: () => import('@/views/ReviewView.vue'),
    meta: { requiresAuth: true, roles: ['manager', 'super_admin'] },
  },
  {
    path: '/rewards',
    name: 'rewards',
    component: () => import('@/views/RewardsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/rewards/requests',
    name: 'reward-requests',
    component: () => import('@/views/RewardRequestsView.vue'),
    meta: { requiresAuth: true, roles: ['member'] },
  },
  {
    path: '/rewards/requests/:id',
    name: 'reward-request-detail',
    component: () => import('@/views/RewardRequestDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/stats',
    name: 'stats',
    component: () => import('@/views/StatsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/views/admin/UsersView.vue'),
    meta: { requiresAuth: true, roles: ['super_admin'] },
  },
  {
    path: '/admin/pairs',
    name: 'admin-pairs',
    component: () => import('@/views/admin/PairsView.vue'),
    meta: { requiresAuth: true, roles: ['super_admin'] },
  },
  {
    path: '/admin/categories',
    name: 'admin-categories',
    component: () => import('@/views/admin/CategoriesView.vue'),
    meta: { requiresAuth: true, roles: ['super_admin'] },
  },
  {
    path: '/admin/rules',
    name: 'admin-rules',
    component: () => import('@/views/admin/RulesView.vue'),
    meta: { requiresAuth: true, roles: ['manager'] },
  },
  {
    path: '/admin/rewards',
    name: 'admin-rewards-mgmt',
    component: () => import('@/views/admin/RewardsMgmtView.vue'),
    meta: { requiresAuth: true, roles: ['manager'] },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const user = getUser()

  if (to.meta.requiresAuth && !user) {
    return next({ name: 'login' })
  }

  if (to.meta.guest && user) {
    return next({ name: 'dashboard' })
  }

  const roles = to.meta.roles as string[] | undefined
  if (roles && user) {
    if (!roles.includes(user.role)) {
      return next({ name: 'dashboard' })
    }
  }

  next()
})

export default router
