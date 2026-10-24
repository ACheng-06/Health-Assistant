<template>
  <div class="backend-layout">
    <el-container class="main-container">
      <SideBar />
      <el-container>
        <el-header>
          <NavBar />
        </el-header>
        <el-main class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="page-fade">
              <div class="route-page-shell" :key="route.fullPath">
                <component :is="Component" />
              </div>
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
  import { useRoute } from 'vue-router'
  import SideBar from './SideBar.vue'
  import NavBar from './NavBar.vue'

  const route = useRoute()
</script>

<style lang="scss" scoped>
.backend-layout {
  height: 100vh;

  .el-header {
    height: 74px !important;
    padding: 0;
  }

  .main-container {
    height: 100%;
  }

  /* 内容区跟前台同一套浅色层次，卡片和表格才是白的 */
  .main-content {
    position: relative;
    padding: 20px;
    background: var(--fe-surface-2);
  }

  .route-page-shell {
    min-height: 100%;
  }
}
</style>
