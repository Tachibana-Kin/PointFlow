<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const name = ref('')
const password = ref('')
const submitted = ref(false)

async function handleSubmit() {
  if (!name.value.trim() || !password.value.trim()) return
  submitted.value = true
  try {
    const user = await auth.login(name.value.trim(), password.value)
    if (user.role === 'super_admin') {
      router.push('/admin/users')
    } else {
      router.push('/dashboard')
    }
  } catch (e) {
    submitted.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="logo-section">
        <h1 class="logo">PointFlow</h1>
        <p class="subtitle">积分管理系统</p>
      </div>
      <form class="login-form" @submit.prevent="handleSubmit">
        <BaseInput
          v-model="name"
          placeholder="请输入用户名"
          label="用户名"
        />
        <BaseInput
          v-model="password"
          type="password"
          placeholder="请输入密码"
          label="密码"
        />
        <p v-if="auth.error" class="error-text">{{ auth.error }}</p>
        <BaseButton
          type="submit"
          variant="primary"
          :loading="auth.loading"
          :disabled="!name.trim() || !password.trim()"
          block
        >
          登录
        </BaseButton>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  background: var(--color-bg);
}
.login-card {
  width: 100%;
  max-width: 380px;
  background: var(--color-bg-card, var(--color-bg-surface));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl) var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
.logo-section {
  text-align: center;
}
.logo {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: -0.02em;
}
.subtitle {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: var(--spacing-xs);
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.error-text {
  font-size: 0.8125rem;
  color: var(--color-danger);
  text-align: center;
}
</style>
