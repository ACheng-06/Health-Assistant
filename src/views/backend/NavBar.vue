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
          <el-avatar style="margin-right: 10px;" :size="32">{{ userInitial }}</el-avatar>
          <p class="user-name">{{ userDisplayName }}</p>
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
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { logoutAPI } from '@/api/auth'
  import { useAdminStore } from '@/store/admin'
  import { useAuthStore } from '@/store/auth'
  import { Expand, ArrowDown } from '@element-plus/icons-vue'
  const router = useRouter()
  const authStore = useAuthStore()
  // 头像改用昵称首字兜底，不再依赖独立图片资源
  const userDisplayName = computed(
    () => authStore.userInfo?.nickname || authStore.userInfo?.username || '管理员'
  )
  const userInitial = computed(() => userDisplayName.value.slice(0, 1))
  const handleCommand = async (command) => {
    if (command === 'logout') {
      // 退出登录逻辑
      try {
        await logoutAPI()
      } catch (e) {
      } finally {
        authStore.logout()
        router.push('/auth/login')
      }
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
  background: var(--fe-surface);
  box-shadow: var(--fe-shadow-sm);
  border-bottom: 1px solid var(--fe-border);

  .flex-box {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .page-title {
    margin: 0 0 0 16px;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--fe-text);
  }

  .user-name {
    margin: 0 6px 0 0;
    color: var(--fe-text-soft);
    font-size: 14px;
  }
}
</style>
