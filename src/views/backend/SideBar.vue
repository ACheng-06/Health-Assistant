<template>
  <el-aside :width="isCollapse ? '64px' : '264px'">
    <el-menu :default-active="activeMenu" class="menu-style" :collapse="isCollapse" :collapse-transition="false">
      <div class="brand">
        <el-image style="width:50px; height:50px; margin-right:10px;" :src="iconURL" alt="brand-icon" />
        <div v-if="!isCollapse" class="info-card">
          <h1 class="brand-title">心理健康AI助手</h1>
          <p class="brand-subtitle">管理后台</p>
        </div>
      </div>

      <el-menu-item @click="selectMenu(item)" v-for="item in menuItems" :key="item.path"
        :index="`${basePath}/${item.path}`">
        <el-icon>
          <component :is="iconMap[item.meta.icon]" />
        </el-icon>
        <span>{{ item.meta.title }}</span>
      </el-menu-item>

    </el-menu>
  </el-aside>

</template>
<script setup>
  import { useRoute, useRouter } from 'vue-router'
  import { useAdminStore } from '@/store/admin'
  import { computed } from 'vue'
  import { PieChart, ChatLineSquare, Message, User } from '@element-plus/icons-vue'
  const router = useRouter()
  const route = useRoute()
  // 路由 meta.icon 保存图标名，这里显式映射为组件，避免依赖全局图标注册
  const iconMap = {
    PieChart,
    ChatLineSquare,
    Message,
    User,
  }
  const backendRoute = router.options.routes[0]
  const basePath = backendRoute.path
  const menuItems = backendRoute.children
  // 完整路径作为菜单 index，当前路由变化时同步高亮
  const activeMenu = computed(() => route.path)
  const iconURL = new URL('@/assets/images/机器人.png', import.meta.url).href
  const selectMenu = (item) => {
    router.push(`${basePath}/${item.path}`)
  }
  const isCollapse = computed(() => useAdminStore().isCollapse)
</script>
<style lang="scss" scoped>
.menu-style {
  height: 100%;
  /* Element Plus 菜单变量接到品牌令牌上，active / hover / 分隔线都跟着走 */
  --el-menu-bg-color: var(--fe-surface);
  --el-menu-text-color: var(--fe-text-soft);
  --el-menu-active-color: var(--fe-brand-deep);
  --el-menu-hover-bg-color: var(--fe-brand-soft);
  --el-menu-border-color: var(--fe-border);
  border-right: 1px solid var(--fe-border);

  .brand {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    background-color: var(--fe-surface);
    border-bottom: 1px solid var(--fe-border);

    .info-card {
      .brand-title {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 5px;
        color: var(--fe-text);
      }

      .brand-subtitle {
        font-size: 14px;
        color: var(--fe-text-muted);
      }
    }
  }

  /* 当前菜单项加一层品牌底色，扫一眼就知道在哪页 */
  :deep(.el-menu-item.is-active) {
    background: var(--fe-brand-soft);
    font-weight: 600;
  }
}
</style>