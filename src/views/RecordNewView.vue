<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import CategorySelector from '@/components/business/CategorySelector.vue'
import RuleSelector from '@/components/business/RuleSelector.vue'
import ScorePreview from '@/components/business/ScorePreview.vue'
import PunishmentPreview from '@/components/business/PunishmentPreview.vue'
import { useCategoryStore } from '@/stores/category'
import { useRuleStore } from '@/stores/rule'
import { usePairStore } from '@/stores/pair'
import { useRecordStore } from '@/stores/record'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const categoryStore = useCategoryStore()
const ruleStore = useRuleStore()
const pairStore = usePairStore()
const recordStore = useRecordStore()
const auth = useAuthStore()

const step = ref(1)
const selectedCategoryId = ref('')
const selectedRuleId = ref('')
const remark = ref('')
const submitting = ref(false)
const error = ref('')
const success = ref('')

const selectedRule = computed(() =>
  ruleStore.rules.find((r) => r.id === selectedRuleId.value)
)

const filteredRules = computed(() =>
  ruleStore.rules.filter((r) => r.category_id === selectedCategoryId.value && r.enabled)
)

onMounted(async () => {
  await Promise.all([
    categoryStore.fetchCategories(),
    pairStore.fetchPairs(),
  ])
  // Fetch rules for the current member's pair, or for the manager's first paired member
  const user = auth.user
  if (!user) return
  const isMember = user.role === 'member'
  const isManager = user.role === 'manager'
  let pairId: string | undefined
  if (isMember) {
    const myPair = pairStore.pairs.find(p => p.member_id === user.id)
    if (myPair) pairId = myPair.id
  } else if (isManager) {
    const myPairs = pairStore.pairs.filter(p => p.manager_id === user.id)
    if (myPairs.length > 0) pairId = myPairs[0].id
  }
  if (pairId) {
    await ruleStore.fetchRules({ pair_id: pairId, enabled: true })
  } else {
    await ruleStore.fetchRules()
  }
})

function selectCategory(id: string) {
  selectedCategoryId.value = id
  selectedRuleId.value = ''
  step.value = 2
}

function selectRule(id: string) {
  selectedRuleId.value = id
  step.value = 3
}

async function submit() {
  if (!selectedRuleId.value) return
  submitting.value = true
  error.value = ''
  try {
    await recordStore.createRecord({
      rule_id: selectedRuleId.value,
      remark: remark.value || undefined,
    })
    success.value = '记录已提交，等待审核'
    setTimeout(() => router.push('/records'), 1500)
  } catch (e) {
    error.value = '提交失败，请重试'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <DefaultLayout>
    <div class="record-new">
      <h2 class="page-title">新建记录</h2>

      <div class="steps-indicator">
        <span class="step-dot" :class="{ active: step >= 1 }">1</span>
        <span class="step-line" :class="{ active: step >= 2 }" />
        <span class="step-dot" :class="{ active: step >= 2 }">2</span>
        <span class="step-line" :class="{ active: step >= 3 }" />
        <span class="step-dot" :class="{ active: step >= 3 }">3</span>
      </div>

      <div v-if="step === 1" class="step-content">
        <CategorySelector
          :categories="categoryStore.categories"
          :selected="selectedCategoryId"
          @select="selectCategory"
        />
      </div>

      <div v-if="step === 2" class="step-content">
        <RuleSelector
          :rules="filteredRules"
          :selected="selectedRuleId"
          @select="selectRule"
        />
        <BaseButton variant="ghost" @click="step = 1">返回选择分类</BaseButton>
      </div>

      <div v-if="step === 3" class="step-content">
        <ScorePreview
          :score="selectedRule?.score ?? 0"
          :type="selectedRule?.type ?? 'add'"
        />
        <PunishmentPreview :punishment="selectedRule?.punishment" />
        <BaseInput
          v-model="remark"
          :multiline="true"
          placeholder="备注（可选）"
          label="备注"
        />
        <p v-if="error" class="error-text">{{ error }}</p>
        <p v-if="success" class="success-text">{{ success }}</p>
        <div class="form-actions">
          <BaseButton variant="ghost" @click="step = 2">返回</BaseButton>
          <BaseButton
            variant="primary"
            :loading="submitting"
            @click="submit"
          >
            提交记录
          </BaseButton>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<style scoped>
.record-new {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}
.steps-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}
.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-elevated);
  color: var(--color-text-muted);
  font-size: 0.8125rem;
  font-weight: 600;
  transition: background 0.2s, color 0.2s;
}
.step-dot.active {
  background: var(--color-primary);
  color: #fff;
}
.step-line {
  width: 48px;
  height: 2px;
  background: var(--color-bg-elevated);
  transition: background 0.2s;
}
.step-line.active {
  background: var(--color-primary);
}
.step-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.form-actions {
  display: flex;
  gap: var(--spacing-sm);
}
.form-actions > * {
  flex: 1;
}
.error-text {
  font-size: 0.8125rem;
  color: var(--color-danger);
}
.success-text {
  font-size: 0.8125rem;
  color: var(--color-success);
  text-align: center;
}
</style>
