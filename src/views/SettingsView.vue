<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { useAuthStore } from '@/stores/auth'
import { changePassword } from '@/api/auth'

const auth = useAuthStore()
const router = useRouter()

const showPwdModal = ref(false)
const pwdForm = ref({ old: '', new: '', confirm: '' })
const pwdError = ref('')
const pwdSubmitting = ref(false)

function roleLabel(role: string | null) {
  const labels: Record<string, string> = {
    super_admin: '超级管理员',
    manager: '管理员',
    member: '成员',
  }
  return role ? labels[role] ?? role : '未知'
}

async function handleChangePwd() {
  pwdError.value = ''
  if (!pwdForm.value.new) { pwdError.value = '请输入新密码'; return }
  if (pwdForm.value.new.length < 6) { pwdError.value = '新密码至少6位'; return }
  if (pwdForm.value.new !== pwdForm.value.confirm) { pwdError.value = '两次密码不一致'; return }
  pwdSubmitting.value = true
  try {
    await changePassword(pwdForm.value.old, pwdForm.value.new)
    showPwdModal.value = false
    pwdForm.value = { old: '', new: '', confirm: '' }
  } catch (e: any) {
    pwdError.value = e.message || '修改失败'
  } finally {
    pwdSubmitting.value = false
  }
}

async function handleLogout() {
  try {
    await auth.logout()
    router.push('/login')
  } catch (e) {
    console.error('Logout failed', e)
  }
}
</script>

<template>
  <DefaultLayout>
    <div class="settings-page">
      <h2 class="page-title">设置</h2>

      <section class="settings-section">
        <h3 class="section-title">用户信息</h3>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">邮箱</span>
            <span class="info-value">{{ auth.user?.email ?? '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">姓名</span>
            <span class="info-value">{{ auth.user?.name ?? auth.user?.email ?? '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">角色</span>
            <span class="info-value role-badge">{{ roleLabel(auth.userRole) }}</span>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h3 class="section-title">安全</h3>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">密码</span>
            <BaseButton size="sm" variant="ghost" @click="showPwdModal = true">修改密码</BaseButton>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h3 class="section-title">外观</h3>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">主题</span>
            <span class="info-value">深色模式（当前固定）</span>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h3 class="section-title">关于</h3>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">应用名称</span>
            <span class="info-value">PointFlow</span>
          </div>
          <div class="info-row">
            <span class="info-label">版本</span>
            <span class="info-value">1.0.0</span>
          </div>
        </div>
      </section>

      <div class="logout-section">
        <BaseButton
          variant="danger"
          block
          :loading="auth.loading"
          @click="handleLogout"
        >
          退出登录
        </BaseButton>
      </div>
    </div>

    <BaseModal :open="showPwdModal" title="修改密码" @close="showPwdModal = false">
      <div class="form-group">
        <label>当前密码</label>
        <input v-model="pwdForm.old" class="form-input" type="password" placeholder="输入当前密码" />
      </div>
      <div class="form-group">
        <label>新密码</label>
        <input v-model="pwdForm.new" class="form-input" type="password" placeholder="至少6位" />
      </div>
      <div class="form-group">
        <label>确认新密码</label>
        <input v-model="pwdForm.confirm" class="form-input" type="password" placeholder="再次输入新密码" />
      </div>
      <p v-if="pwdError" class="error-text">{{ pwdError }}</p>
      <template #footer>
        <BaseButton variant="secondary" @click="showPwdModal = false">取消</BaseButton>
        <BaseButton variant="primary" :loading="pwdSubmitting" @click="handleChangePwd">确认修改</BaseButton>
      </template>
    </BaseModal>
  </DefaultLayout>
</template>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}
.settings-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.section-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.info-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.info-label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
.info-value {
  font-size: 0.875rem;
  color: var(--color-text);
}
.role-badge {
  padding: 2px var(--spacing-sm);
  background: rgba(99, 102, 241, 0.15);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}
.logout-section {
  padding-top: var(--spacing-md);
}
.form-group {
  margin-bottom: var(--spacing-md);
}
.form-group label {
  display: block;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-xs);
}
.form-input {
  width: 100%;
  padding: 8px 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: var(--color-primary);
}
.error-text {
  font-size: 0.8125rem;
  color: var(--color-danger);
  margin-top: var(--spacing-xs);
}
</style>
