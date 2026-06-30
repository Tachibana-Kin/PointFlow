<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import ScoreCard from '@/components/business/ScoreCard.vue'
import StreakBadge from '@/components/business/StreakBadge.vue'
import QuickActions from '@/components/business/QuickActions.vue'
import PendingBadge from '@/components/business/PendingBadge.vue'
import RecordCard from '@/components/business/RecordCard.vue'
import BaseCard from '@/components/common/BaseCard.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useRecordStore } from '@/stores/record'
import { useAuthStore } from '@/stores/auth'
import { usePairStore } from '@/stores/pair'
import * as recordsApi from '@/api/records'
import * as rewardsApi from '@/api/rewards'

const router = useRouter()
const dashboard = useDashboardStore()
const record = useRecordStore()
const auth = useAuthStore()
const pairStore = usePairStore()

const recentRecords = computed(() => record.records.slice(0, 10))

interface MemberInfo {
  id: string
  name: string
  avatar: string
  pairName: string
  score: number
}
const memberInfos = ref<MemberInfo[]>([])

// Reward requests for manager dashboard
const pendingRequests = ref<any[]>([])

onMounted(async () => {
  await Promise.all([
    dashboard.fetchDashboard(),
    record.fetchRecords({ page: 1, page_size: 10 }),
    pairStore.fetchPairs(),
  ])
  if (auth.isManager) {
    const myPairs = pairStore.pairs.filter(p => p.manager_id === auth.user?.id)
    const infos: MemberInfo[] = []
    for (const p of myPairs) {
      const memberName = (p as any).member?.name ?? p.member_name ?? '成员'
      const memberData = await recordsApi.list({ user_id: p.member_id, status: 'approved', limit: '1000' })
      const totalScore = memberData.reduce((s, r) => s + (r.score ?? 0), 0)
      infos.push({
        id: p.member_id,
        name: memberName,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=6366f1&color=fff&size=40`,
        pairName: p.name ?? '',
        score: totalScore,
      })
    }
    memberInfos.value = infos

    // Fetch pending reward requests
    try {
      pendingRequests.value = await rewardsApi.getRequests()
      pendingRequests.value = pendingRequests.value.filter((r: any) => r.status === 'pending')
    } catch (e) {
      console.error('Failed to fetch reward requests', e)
    }
  }
})

async function refresh() {
  await Promise.all([
    dashboard.fetchDashboard(),
    record.fetchRecords({ page: 1, page_size: 10 }),
  ])
}

function goToRecord(id: string) {
  router.push(`/records/${id}`)
}
</script>

<template>
  <DefaultLayout>
    <div class="dashboard">
      <div class="header-row">
        <h2 class="page-title">仪表盘</h2>
        <button class="refresh-btn" @click="refresh">🔄</button>
      </div>

      <!-- For member: show linked manager -->
      <BaseCard v-if="auth.isMember" class="manager-info">
        <div class="manager-info-inner">
          <span class="manager-label">绑定监督者</span>
          <span class="manager-name">{{ (pairStore.memberPair as any)?.manager?.name ?? pairStore.memberPair?.manager_name ?? '未知' }}</span>
        </div>
      </BaseCard>

      <div v-if="dashboard.loading && !dashboard.data" class="loading-state">加载中...</div>
      <template v-else>
        <!-- For members and super_admin: show score grid -->
        <div v-if="!auth.isManager" class="score-grid">
          <ScoreCard label="当前积分" :score="dashboard.currentScore" />
          <ScoreCard label="今日积分" :score="dashboard.data?.today_score ?? 0" />
          <ScoreCard label="本周积分" :score="dashboard.data?.week_score ?? 0" />
          <ScoreCard label="本月积分" :score="dashboard.data?.month_score ?? 0" />
        </div>

        <!-- For manager: show each member -->
        <div v-if="auth.isManager && memberInfos.length" class="members-section">
          <h3 class="section-title">所辖成员</h3>
          <div class="member-list">
            <RouterLink
              v-for="m in memberInfos"
              :key="m.id"
              :to="`/records?user_id=${m.id}`"
              class="member-card"
            >
              <img :src="m.avatar" :alt="m.name" class="member-avatar" />
              <div class="member-detail">
                <span class="member-name">{{ m.name }}</span>
                <span class="member-score">{{ m.score }} 分</span>
              </div>
            </RouterLink>
          </div>
        </div>

        <div class="info-row">
          <StreakBadge :streak="dashboard.streakDays ?? dashboard.data?.streak ?? 0" />
          <div class="pending-group">
            <PendingBadge
              v-if="auth.isManager || auth.isSuperAdmin"
              :count="dashboard.pendingCount ?? dashboard.data?.pending_review ?? 0"
              type="review"
            />
            <PendingBadge
              v-if="auth.isManager || auth.isSuperAdmin"
              :count="dashboard.data?.pending_punishments ?? 0"
              type="punishment"
            />
            <PendingBadge
              v-if="auth.isManager && pendingRequests.length"
              :count="pendingRequests.length"
              type="punishment"
            />
          </div>
        </div>

        <QuickActions :role="auth.userRole ?? 'member'" />

        <!-- Pending reward requests for manager -->
        <section v-if="auth.isManager && pendingRequests.length" class="recent-section">
          <h3 class="section-title">待审核兑换</h3>
          <div class="request-list">
            <div
              v-for="req in pendingRequests.slice(0, 5)"
              :key="req.id"
              class="request-item"
              @click="router.push('/rewards/requests/' + req.id)"
            >
              <span class="request-title">{{ (req as any).reward?.title ?? req.reward_id }}</span>
              <span class="request-user">{{ (req as any).user?.name ?? req.user_name ?? '用户' }}</span>
              <span class="request-cost">{{ (req as any).reward?.cost ?? '-' }} 分</span>
            </div>
          </div>
        </section>

        <section class="recent-section">
          <h3 class="section-title">最近记录</h3>
          <div v-if="recentRecords.length === 0" class="empty-state">暂无记录</div>
          <div v-else class="recent-list">
            <div
              v-for="r in recentRecords"
              :key="r.id"
              class="recent-record-item"
              @click="goToRecord(r.id)"
            >
              <div class="record-main">
                <span class="record-title">{{ r.rule_title ?? (r as any).rule?.title ?? r.id }}</span>
                <span class="record-score" :class="((r as any).rule?.type ?? 'add') === 'add' ? 'positive' : 'negative'">
                  {{ r.score > 0 ? '+' : '' }}{{ r.score }}
                </span>
              </div>
              <div class="record-meta">
                <span class="record-user">{{ (r as any).user?.name ?? r.user_name ?? '' }}</span>
                <span class="record-status" :class="'status-' + r.status">
                  {{ r.status === 'pending' ? '待审核' : r.status === 'approved' ? '已通过' : '已拒绝' }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}
.refresh-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 1rem;
  cursor: pointer;
}
.refresh-btn:hover {
  background: var(--color-primary);
  color: #fff;
}
.loading-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-muted);
}
.score-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}
@media (min-width: 768px) {
  .score-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  align-items: center;
}
.pending-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}
.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}
.recent-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.recent-list, .request-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-muted);
  font-size: 0.875rem;
}
.recent-record-item, .request-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color 0.15s;
}
.recent-record-item:hover, .request-item:hover {
  border-color: var(--color-primary);
}
.record-main, .request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
}
.record-title, .request-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.record-score {
  font-weight: 700;
  flex-shrink: 0;
}
.positive { color: var(--color-success); }
.negative { color: var(--color-danger); }
.record-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.record-user, .request-user {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
.record-status, .request-cost {
  font-size: 0.75rem;
  font-weight: 500;
}
.status-pending { color: var(--color-warning); }
.status-approved { color: var(--color-success); }
.status-rejected { color: var(--color-danger); }
/* Manager info for member */
.manager-info-inner {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.manager-label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
.manager-name {
  font-weight: 600;
  color: var(--color-text);
}
/* Members list for manager */
.members-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.member-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}
.member-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text);
  min-width: 140px;
  transition: border-color 0.15s;
}
.member-card:hover {
  border-color: var(--color-primary);
}
.member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}
.member-detail {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.member-name {
  font-weight: 600;
  font-size: 0.875rem;
}
.member-score {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
</style>
