<template>
  <div class="backend-layout">
    <el-container class="main-container">
      <SideBar />
      <el-container>
        <el-header>
          <NavBar />
        </el-header>
        <el-main class="main-content">
          <router-view class="content-container" />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
  import SideBar from './SideBar.vue'
  import NavBar from './NavBar.vue' 
</script>

<style lang="scss" scoped>
.backend-layout {
  height: 100vh;

  .el-header {
    height: 74px !important;
  }

  .main-container {
    height: 100%;

    .content-container {
      padding: 20px;
      background-color: #fff;
      min-height: calc(100% - 74px);
    }
  }
}
</style>
