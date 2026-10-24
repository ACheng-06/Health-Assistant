<template>
  <div class="auth-card">
    <router-link to="/" class="back-home">
      <el-icon><Back /></el-icon>
      <span>返回首页</span>
    </router-link>

    <header class="card-head">
      <p class="card-eyebrow">SIGN IN</p>
      <h2>欢迎回来</h2>
      <p class="card-sub">用你的账号，继续上次没说完的话</p>
    </header>

    <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-position="top" class="auth-form">
      <el-form-item label="用户名或邮箱" prop="username">
        <el-input
          v-model="formData.username"
          size="large"
          placeholder="请输入用户名或邮箱"
          @keyup.enter="submitForm(ruleFormRef)"
        />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input
          v-model="formData.password"
          size="large"
          type="password"
          show-password
          placeholder="请输入密码"
          @keyup.enter="submitForm(ruleFormRef)"
        />
      </el-form-item>

      <el-button class="submit-btn" size="large" type="primary" :loading="loading" @click="submitForm(ruleFormRef)">
        登录
      </el-button>
    </el-form>

    <p class="switch-tip">还没有账户？<router-link to="/auth/register">去注册</router-link></p>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus/es/components/message/index.mjs'
import { Back } from '@element-plus/icons-vue'
import router from '@/router'
import { loginAPI } from '@/api/auth'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()
const route = useRoute()
const ruleFormRef = ref()
const loading = ref(false)
const formData = reactive({ username: '', password: '' })
const rules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

const submitForm = async (formEl) => {
  if (!formEl || loading.value) return
  const valid = await formEl.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const actualData = await loginAPI(formData)
    if (!actualData?.token) {
      ElMessage.error('登录失败，未获取到登录凭证')
      return
    }
    authStore.setAuth(actualData.token, actualData.userInfo)

    // 被守卫拦下时带回来源路径，只允许站内地址，避免开放重定向
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
    const fallback = authStore.isAdmin ? '/back/dashboard' : '/'
    const target = redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : fallback
    router.push(target)
  } catch {
    // 错误提示已由请求拦截器统一处理
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.auth-card {
  width: min(400px, 100%);
}

.back-home {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: clamp(28px, 5vh, 52px);
  padding: 6px 12px 6px 9px;
  border: 1px solid var(--fe-border);
  border-radius: var(--fe-radius-pill);
  color: var(--fe-text-muted);
  font-size: 13px;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    border-color: var(--fe-border-strong);
    background: var(--fe-surface-2);
    color: var(--fe-text-soft);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--fe-brand-ring);
  }
}

.card-head {
  margin-bottom: 26px;
}

.card-eyebrow {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 12px;
  color: var(--fe-brand-deep);
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.18em;

  &::before {
    content: '';
    width: 20px;
    height: 1px;
    background: currentColor;
  }
}

.card-head h2 {
  margin: 0 0 8px;
  color: var(--fe-text);
  font-size: 27px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.25;
}

.card-sub {
  margin: 0;
  color: var(--fe-text-muted);
  font-size: 14px;
  line-height: 1.7;
}

.auth-form {
  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-form-item__label) {
    color: var(--fe-text-soft);
    font-weight: 600;
  }

  :deep(.el-input__wrapper) {
    border-radius: var(--fe-radius-md);
    padding: 2px 14px;
  }
}

.submit-btn {
  width: 100%;
  min-height: 48px;
  margin-top: 10px;
  border-radius: var(--fe-radius-md);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
  box-shadow: var(--fe-shadow-brand);
}

.switch-tip {
  margin: 22px 0 0;
  color: var(--fe-text-muted);
  font-size: 13.5px;
  text-align: center;

  a {
    color: var(--fe-brand-deep);
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
  }
}
</style>
