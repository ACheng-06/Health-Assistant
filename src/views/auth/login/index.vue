<template>
  <div class="container">
    <div class="title">
      <div class="back-home">
        <el-icon>
          <Back />
        </el-icon>
        <router-link to="/" class="back-home">
          <span>返回首页</span>
        </router-link>
      </div>
      <div class="title-text">
        <h2>登录您的账户</h2>
        <p>请输入您的登录信息</p>
      </div>
    </div>
    <div class="form-container">
      <el-form ref="ruleFormRef" :model="formData" :rules="rules" label-position="top">
        <el-form-item label="用户名或邮箱" prop="username">
          <el-input v-model="formData.username" size="large" placeholder="请输入用户名或邮箱"
            @keyup.enter="submitForm(ruleFormRef)" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" size="large" placeholder="请输入密码" type="password" show-password
            @keyup.enter="submitForm(ruleFormRef)" />
        </el-form-item>
        <el-button class="btn" size="large" type="primary" @click="submitForm(ruleFormRef)">登录</el-button>
      </el-form>
      <div class="footer">
        <p>还没有账户？<router-link to="/auth/register">去注册</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue'
  import { ElMessage } from 'element-plus'
  import router from '@/router'
  import { loginAPI } from '@/api/auth'
  import { useAuthStore } from '@/store/auth'

  const authStore = useAuthStore()
  const ruleFormRef = ref()
  const formData = reactive({ username: '', password: '' })
  const rules = reactive({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
  })

  const submitForm = async (formEl) => {
    if (!formEl) return
    const valid = await formEl.validate().catch(() => false)
    if (!valid) return
    try {
      const actualData = await loginAPI(formData)
      if (!actualData?.token) {
        ElMessage.error('登录失败，未获取到登录凭证')
        return
      }
      authStore.setAuth(actualData.token, actualData.userInfo)
      router.push(authStore.isAdmin ? '/back/dashboard' : '/')
    } catch {
      // 错误提示已由请求拦截器统一处理
    }
  }
</script>
<style scoped lang="scss">
.container {
  width: 384px;

  .title {
    .back-home {
      margin-bottom: 60px;
    }

    .title-text {
      text-align: center;

      h2 {
        font-size: 36px;
        margin-bottom: 10px;
      }

      p {
        font-size: 18px;
        color: #6b7280;
      }
    }
  }

  .form-container {
    .btn {
      margin-top: 40px;
      width: 100%;
    }

    .footer {
      text-align: center;
      margin-top: 40px;
    }
  }
}

.back-home,
.footer {
  a {
    color: #333;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
      color: #409eff;
    }
  }
}
</style>