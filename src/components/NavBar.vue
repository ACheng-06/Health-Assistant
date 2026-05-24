<template>
  <div class="navbar">
    <div class="flex-box">
      <el-button @click="handleCollapse">
        <el-icon>
          <Expand />
        </el-icon>
      </el-button>
      <p class="page-title">{{ route.meta.title }}</p>
    </div>
    <div class="flex-box">
      <el-dropdown @command="handleCommand">
        <div class="flex-box">
          <el-avatar style="margin-right: 10px;" :src="userImg" alt="logo" />
          <p class="user-name">ACheng</p>
          <el-icon>
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
  import { useRoute, useRouter } from 'vue-router'
  import userImg from '@/assets/images/user.jpg'
  import { useAdminStore } from '@/store/admin'
  const router = useRouter()
  const handleCommand = (command) => {
    if (command === 'logout') {
      // 退出登录逻辑
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      router.push('/auth/login')
    }
  }
  const handleCollapse = () => {
    useAdminStore().toggleCollapse()
  }
  const route = useRoute()
</script>

<style lang="scss" scoped>
.navbar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  border-bottom: 1px solid #e5e7eb;

  .flex-box {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .page-title {
    margin-left: 20px;
    font-size: 26px;
    font-weight: bold;
    color: #1f2937;
  }
}
</style>
