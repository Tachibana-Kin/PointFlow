<script setup lang="ts">
import { onMounted, computed } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useStatsStore } from '@/stores/stats'

const stats = useStatsStore()

const maxTrendScore = computed(() =>
  Math.max(...stats.dailyTrend.map((d) => d.score), 1)
)
const maxCategoryScore = computed(() =>
  Math.max(...stats.categoryBreakdown.map((c) => c.score), 1)
)
const maxMonthlyScore = computed(() =>
  Math.max(...stats.monthlyStats.map((m) => m.score), 1)
)
const topCategory = computed(() =>
  stats.categoryBreakdown.slice(0, 5)
)

onMounted(async () => {
  await stats.fetchAll()
})
</script>

<template>
  <DefaultLayout>
    <div class="stats-page">
      <h2 class="page-title">统计</h2>

      <div v-if="stats.loading && stats.dailyTrend.length === 0" class="loading-state">
        加载中...
      </div>
      <template v-else>
        <section class="chart-section">
          <h3 class="section-title">每日积分趋势</h3>
          <div class="chart-area">
            <div v-if="stats.dailyTrend.length === 0" class="chart-empty">暂无数据</div>
            <div v-else class="bar-chart horizontal">
              <div
                v-for="item in stats.dailyTrend.slice(-14)"
                :key="item.date"
                class="bar-item"
              >
                <div class="bar-label">{{ item.date.slice(5) }}</div>
                <div class="bar-track">
                  <div
                    class="bar-fill"
                    :style="{ width: (item.score / maxTrendScore) * 100 + '%' }"
                  />
                </div>
                <div class="bar-value">{{ item.score }}</div>
              </div>
            </div>
          </div>
        </section>

        <section class="chart-section">
          <h3 class="section-title">分类占比（前5）</h3>
          <div class="chart-area">
            <div v-if="topCategory.length === 0" class="chart-empty">暂无数据</div>
            <div v-else class="bar-chart">
              <div
                v-for="item in topCategory"
                :key="item.category"
                class="bar-item"
              >
                <div class="bar-label">{{ item.category }}</div>
                <div class="bar-track">
                  <div
                    class="bar-fill category-bar"
                    :style="{ width: (item.score / maxCategoryScore) * 100 + '%' }"
                  />
                </div>
                <div class="bar-value">{{ item.score }}</div>
              </div>
            </div>
          </div>
        </section>

        <section class="chart-section">
          <h3 class="section-title">月度统计</h3>
          <div class="chart-area">
            <div v-if="stats.monthlyStats.length === 0" class="chart-empty">暂无数据</div>
            <div v-else class="bar-chart">
              <div
                v-for="item in stats.monthlyStats.slice(-6)"
                :key="item.month"
                class="bar-item"
              >
                <div class="bar-label">{{ item.month }}</div>
                <div class="bar-track">
                  <div
                    class="bar-fill monthly-bar"
                    :style="{ width: (item.score / maxMonthlyScore) * 100 + '%' }"
                  />
                </div>
                <div class="bar-value">{{ item.score }}</div>
              </div>
            </div>
          </div>
        </section>

        <section class="chart-section">
          <h3 class="section-title">排行榜</h3>
          <div class="leaderboard">
            <div v-if="stats.leaderboard.length === 0" class="chart-empty">暂无数据</div>
            <div
              v-for="(user, index) in stats.leaderboard"
              :key="user.user_id"
              class="leaderboard-item"
              :class="{ top: index < 3 }"
            >
              <span class="rank">#{{ index + 1 }}</span>
              <span class="user-name">{{ user.user_name }}</span>
              <span class="user-score">{{ user.score }}</span>
            </div>
          </div>
        </section>
      </template>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.stats-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}
.loading-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--color-text-muted);
}
.chart-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}
.chart-area {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
}
.chart-empty {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--color-text-muted);
  font-size: 0.875rem;
}
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.bar-chart.horizontal {
  overflow-x: auto;
  flex-direction: row;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) 0;
  min-height: 120px;
  align-items: flex-end;
}
.bar-chart.horizontal .bar-item {
  flex-direction: column;
  align-items: center;
  min-width: 40px;
}
.bar-chart.horizontal .bar-track {
  width: 24px;
  height: 80px;
}
.bar-chart.horizontal .bar-fill {
  width: 100%;
  height: auto;
  bottom: 0;
  left: 0;
  position: absolute;
}
.bar-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.bar-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  min-width: 50px;
  flex-shrink: 0;
}
.bar-track {
  flex: 1;
  height: 20px;
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  position: relative;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-sm);
  transition: width 0.5s ease;
}
.category-bar {
  background: linear-gradient(90deg, #6366f1, #a855f7);
}
.monthly-bar {
  background: linear-gradient(90deg, #22c55e, #06b6d4);
}
.bar-value {
  font-size: 0.75rem;
  color: var(--color-text);
  font-weight: 600;
  min-width: 30px;
  text-align: right;
}
.leaderboard {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.leaderboard-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: background 0.2s;
}
.leaderboard-item.top {
  background: rgba(99, 102, 241, 0.08);
}
.rank {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-text-muted);
  min-width: 28px;
}
.leaderboard-item:nth-child(1) .rank { color: #f59e0b; }
.leaderboard-item:nth-child(2) .rank { color: #94a3b8; }
.leaderboard-item:nth-child(3) .rank { color: #d97706; }
.user-name {
  flex: 1;
  font-size: 0.875rem;
  color: var(--color-text);
}
.user-score {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-primary);
}
</style>
