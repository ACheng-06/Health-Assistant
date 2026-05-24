<template>
  <div class="container">
    <div class="title">
      <div class="title-text">
        <h2>创建您的账户</h2>
        <p>请填写注册信息</p>
      </div>
    </div>

    <div class="form-container">
      <el-form label-position="top" :model="formData" :rules="rules" ref="submitFormRef">
        <el-form-item label="用户名或邮箱" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" size="large"></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-row :gutter="10">
            <el-col :span="16">
              <el-input v-model="formData.email" size="large" placeholder="请输入邮箱前缀" />
            </el-col>
            <el-col :span="8">
              <el-select v-model="emailSuffix" size="large" placeholder="选择后缀" style="width: 140px;">
                <el-option label="@qq.com" value="@qq.com" />
                <el-option label="@163.com" value="@163.com" />
                <el-option label="@gmail.com" value="@gmail.com" />
              </el-select>
            </el-col>
          </el-row>
        </el-form-item>


        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入昵称" size="large"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="formData.gender" placeholder="请选择性别" size="large">
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" size="large"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" type="password" show-password placeholder="请输入密码"
            size="large"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="formData.confirmPassword" type="password" show-password placeholder="请再次输入密码"
            size="large"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button class="btn" type="primary" size="large" @click="submitForm(submitFormRef)">注册</el-button>
        </el-form-item>
      </el-form>
      <div class="footer">
        <p>已有账户？<router-link to="/auth/login">去登录</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue'
  import { getRegisterAPI } from '@/api/frontend'
  import { ElMessage } from 'element-plus'
  import { useRouter } from 'vue-router'
  const router = useRouter()
  const emailSuffix = ref('@qq.com')
  const formData = reactive({
    username: "",
    email: "",
    nickname: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: 1,
    userType: 1
  })




  const rules = reactive({
    "username": [
      { required: true, message: "请输入用户名", trigger: "blur" }
    ],
    "email": [
      { required: true, message: "请输入邮箱", trigger: "blur" }
    ],
    "nickname": [
      { required: true, message: "请输入昵称", trigger: "blur" }
    ],
    "gender": [
      { required: true, message: "请选择性别", trigger: "change" }
    ],
    "phone": [
      { pattern: /^1\d{10}$/, required: true, message: "请输入正确的手机号", trigger: "blur" },

    ],
    "password": [
      { required: true, message: "请输入密码", trigger: "blur" }
    ],
    "confirmPassword": [
      { required: true, message: "请再次输入确认密码", trigger: "blur" },
    ]
  })

  const submitFormRef = ref(null)
  const submitForm = async (formEl) => {
    if (!formEl) return
    await formEl.validate()
    formData.email = formData.email + emailSuffix.value
    const res = await getRegisterAPI(formData)
    if (res.data.code === 'BUSINESS_ERROR') {
      ElMessage.error(res.data.message)
      formEl.resetFields()
      return
    }
    if (res) {
      ElMessage.success('注册成功')
      router.push('/auth/login')
    }
  }
</script>
<style scoped lang="scss">
.container {
  width: 384px;

  .flex-box {
    display: flex;
    align-items: center;
  }

  .title {
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
    margin-top: 30px;

    .btn {
      margin-top: 40px;
      width: 100%;
    }

    .footer {
      padding: 30px;
      text-align: center;

      a {
        color: #409EFF;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>