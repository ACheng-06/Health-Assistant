<template>
  <div class="auth-card">
    <router-link to="/" class="back-home">
      <el-icon><Back /></el-icon>
      <span>返回首页</span>
    </router-link>

    <header class="card-head">
      <p class="card-eyebrow">SIGN UP</p>
      <h2>创建账户</h2>
      <p class="card-sub">填写基本信息，马上开始你的情绪记录</p>
    </header>

    <el-form label-position="top" :model="formData" :rules="rules" ref="submitFormRef" class="auth-form">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" placeholder="请输入用户名" size="large" />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" size="large" placeholder="请输入完整邮箱，如 name@qq.com" />
        <p class="field-hint">支持 @qq.com、@163.com、@gmail.com 三种后缀</p>
      </el-form-item>

      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="formData.nickname" placeholder="请输入昵称" size="large" />
      </el-form-item>

      <el-form-item label="性别" prop="gender">
        <el-select v-model="formData.gender" placeholder="请选择性别" size="large" class="field-full">
          <el-option label="男" :value="1" />
          <el-option label="女" :value="2" />
        </el-select>
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入手机号" size="large" />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input v-model="formData.password" type="password" show-password placeholder="请输入密码" size="large" />
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          show-password
          placeholder="请再次输入密码"
          size="large"
        />
      </el-form-item>

      <el-button class="submit-btn" type="primary" size="large" :loading="loading" @click="submitForm(submitFormRef)">
        注册
      </el-button>
    </el-form>

    <p class="switch-tip">已有账户？<router-link to="/auth/login">去登录</router-link></p>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus/es/components/message/index.mjs'
import { Back } from '@element-plus/icons-vue'
import { registerAPI } from '@/api/auth'

const router = useRouter()

// 只接受站内支持的三种邮箱后缀，一次输入完整地址
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@(?:qq|163|gmail)\.com$/i

const formData = reactive({
  username: '',
  email: '',
  nickname: '',
  phone: '',
  password: '',
  confirmPassword: '',
  gender: 1,
  userType: 1
})

const rules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      pattern: EMAIL_PATTERN,
      message: '邮箱需以 @qq.com、@163.com 或 @gmail.com 结尾',
      trigger: 'blur'
    }
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  phone: [{ pattern: /^1\d{10}$/, required: true, message: '请输入正确的手机号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请再次输入确认密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== formData.password) {
          callback(new Error('两次输入的密码不一致'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ]
})

const submitFormRef = ref(null)
const loading = ref(false)

const submitForm = async (formEl) => {
  if (!formEl || loading.value) return
  const valid = await formEl.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    // confirmPassword 必须一起提交：后端会再次校验两次密码是否一致，
    // 缺失时只会返回笼统的「注册失败，请稍后重试」
    await registerAPI({
      ...formData,
      email: formData.email.trim()
    })
    ElMessage.success('注册成功')
    router.push('/auth/login')
  } catch (error) {
    // 拦截器已统一提示；这里为「注册失败，请稍后重试」补充最可能的原因
    if (error?.message?.includes('注册失败')) {
      ElMessage.warning('该用户名、手机号或邮箱可能已被注册，请更换后重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.auth-card {
  width: min(420px, 100%);
}

.back-home {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: clamp(24px, 4vh, 40px);
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
  margin-bottom: 24px;
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
    margin-bottom: 18px;
  }

  :deep(.el-form-item__label) {
    color: var(--fe-text-soft);
    font-weight: 600;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    border-radius: var(--fe-radius-md);
    padding: 2px 14px;
  }

  /* 表单项内还有提示文字，错误信息改为占位而非绝对定位，避免与提示重叠 */
  :deep(.el-form-item__error) {
    position: static;
    width: 100%;
    padding-top: 4px;
  }
}

// 邮箱接受的后缀提示
.field-hint {
  width: 100%;
  margin: 6px 0 0;
  color: var(--fe-text-faint);
  font-size: 12px;
  line-height: 1.6;
}

.field-full {
  width: 100%;
}

.submit-btn {
  width: 100%;
  min-height: 48px;
  margin-top: 12px;
  border-radius: var(--fe-radius-md);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.02em;
  box-shadow: var(--fe-shadow-brand);
}

.switch-tip {
  margin: 20px 0 0;
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

@media (max-width: 420px) {
  .auth-card {
    width: 100%;
  }
}
</style>
