<template>
  <div class="backend-layout">
    <el-container>
      <SideBar />
      <el-container>
        <NavBar />
        <el-main>
          <router-view />
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
  }

  .navbar {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 15px;
    background: white;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    border-bottom: 1px solid #e5e7eb;
  }

  .main-content {
    flex: 1;

    .content-container {
      padding: 20px;
      background-color: #fff;
      min-height: calc(100% - 74px);
    }
  }
}
</style>
