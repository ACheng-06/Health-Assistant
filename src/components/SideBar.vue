<template>
  <el-menu default-active="2" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose">

    <div class="brand">
      <el-image :src="iconURL" alt="brand-icon" />
      <div class="info-card">
        <h1 class="brand-title">心理健康AI助手</h1>
        <p class="brand-subtitle">管理后台</p>
      </div>
    </div>

    <el-menu-item v-for="item in router.options.routes[0].children" :key="item.path" :index="item.path">
      <el-icon>
        <component :is="item.meta.icon" />
      </el-icon>
      <span>{{ item.meta.title }}</span>
    </el-menu-item>

  </el-menu>
</template>
<script setup>
  import { useRouter } from 'vue-router'
  const router = useRouter()

  const iconURL = new URL('@/assets/images/机器人.png', import.meta.url).href
  const handleOpen = (key) => {

  }
  const handleClose = (key) => {

  }
</script>
