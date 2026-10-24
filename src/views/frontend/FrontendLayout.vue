<template>
  <div class="frontend-layout">
    <header class="navbar-container">
      <div class="navbar-inner">
        <router-link to="/" class="brand-section" aria-label="心理健康AI助手首页">
          <img :src="iconUrl" alt="" class="brand-logo" />
          <span class="brand-name">心理健康AI助手</span>
        </router-link>

        <nav class="nav-section" aria-label="主导航">
          <router-link
            to="/"
            class="nav-link"
            :class="{ 'is-active': navActive.home }"
            :aria-current="navActive.home ? 'page' : undefined"
          >
            首页
          </router-link>
          <router-link
            v-if="isLoggedIn"
            to="/consultation"
            class="nav-link"
            :class="{ 'is-active': navActive.consult }"
            :aria-current="navActive.consult ? 'page' : undefined"
            @mouseenter="prefetchConsultation"
            @focus="prefetchConsultation"
          >
            AI咨询
          </router-link>
          <router-link
            v-if="isLoggedIn"
            to="/emotion-diary"
            class="nav-link"
            :class="{ 'is-active': navActive.diary }"
            :aria-current="navActive.diary ? 'page' : undefined"
            @mouseenter="prefetchEmotionDiary"
            @focus="prefetchEmotionDiary"
          >
            情绪日记
          </router-link>
          <router-link
            v-if="isLoggedIn"
            to="/frontendKnowledge"
            class="nav-link"
            :class="{ 'is-active': navActive.knowledge }"
            :aria-current="navActive.knowledge ? 'page' : undefined"
            @mouseenter="prefetchKnowledge"
            @focus="prefetchKnowledge"
          >
            知识库
          </router-link>

          <button v-if="isLoggedIn" type="button" class="logout-btn" @click="handleLogout">
            退出登录
          </button>
          <template v-else>
            <router-link to="/auth/login" class="nav-link">登录</router-link>
            <router-link to="/auth/register" class="nav-link nav-link-cta">注册</router-link>
          </template>
        </nav>
      </div>
    </header>

    <main class="main-container">
      <router-view v-slot="{ Component }">
        <transition name="page-fade">
          <div class="route-page-shell" :key="route.fullPath">
            <component :is="Component" />
          </div>
        </transition>
      </router-view>
    </main>

    <footer v-if="!isChatRoute" class="footer-container">
      <p class="footer-copyright">© 2026 心理健康AI助手. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { logoutAPI } from '@/api/auth'
import { useAuthStore } from '@/store/auth'

const iconUrl = new URL('@/assets/images/机器人.png', import.meta.url).href

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)

const navActive = computed(() => {
  const path = route.path
  return {
    home: path === '/',
    consult: path === '/consultation',
    diary: path === '/emotion-diary',
    knowledge: path.startsWith('/frontendKnowledge') || path.startsWith('/knowledge')
  }
})

const isChatRoute = computed(() => route.path === '/consultation')

let consultationPreloaded = false
let emotionDiaryPreloaded = false
let knowledgePreloaded = false

const prefetchConsultation = () => {
  if (consultationPreloaded) return
  consultationPreloaded = true
  void import('@/views/frontend/consultation/index.vue')
}

const prefetchEmotionDiary = () => {
  if (emotionDiaryPreloaded) return
  emotionDiaryPreloaded = true
  void import('@/views/frontend/emotion/index.vue')
}

const prefetchKnowledge = () => {
  if (knowledgePreloaded) return
  knowledgePreloaded = true
  void import('@/views/frontend/knowledge/index.vue')
}

const handleLogout = async () => {
  try {
    await logoutAPI()
  } catch {
    // 服务端登出失败也要清理本地登录态，避免用户卡在过期会话中
  } finally {
    authStore.logout()
    router.push('/auth/login')
  }
}

onMounted(() => {
  document.body.classList.add('fe-theme')
})

onBeforeUnmount(() => {
  document.body.classList.remove('fe-theme', 'fe-noscroll')
})
</script>

<style scoped lang="scss">
.frontend-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--fe-bg);
  color: var(--fe-text);
}

.navbar-container {
  position: sticky;
  top: 0;
  z-index: 50;
  min-height: var(--fe-nav-h);
  background: rgba(255, 255, 255, 0.86);
  border-bottom: 1px solid var(--fe-border);
  backdrop-filter: blur(14px);
}

.navbar-inner {
  width: 100%;
  min-height: var(--fe-nav-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  /* 导航栏通栏两端对齐：品牌贴左、菜单贴右，不再被中间容器挤到正中 */
  padding: 0 clamp(18px, 3.2vw, 56px);
  box-sizing: border-box;
}

.brand-section {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  color: var(--fe-text);
  border-radius: var(--fe-radius-sm);

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--fe-brand-ring);
  }
}

.brand-logo {
  width: 38px;
  height: 38px;
  display: block;
  object-fit: contain;
  border-radius: 10px;
}

.brand-name {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.nav-section {
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 24px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.nav-link {
  position: relative;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--fe-text-soft);
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 2px;
    height: 2px;
    border-radius: var(--fe-radius-pill);
    background: linear-gradient(90deg, var(--fe-accent), var(--fe-brand));
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.28s var(--fe-ease-out);
  }

  &:hover,
  &.is-active {
    color: var(--fe-brand-deep);
  }

  &:hover::after,
  &.is-active::after {
    transform: scaleX(1);
  }

  &:focus-visible {
    outline: none;
    border-radius: 6px;
    box-shadow: 0 0 0 3px var(--fe-brand-ring);
  }
}

.nav-link-cta {
  padding: 0 18px;
  border: 1px solid var(--fe-brand);
  border-radius: var(--fe-radius-pill);
  background: var(--fe-brand-soft);
  color: var(--fe-brand-deep);

  &::after {
    display: none;
  }

  &:hover {
    background: var(--fe-brand);
    color: var(--fe-surface);
  }
}

.logout-btn {
  min-height: 44px;
  padding: 0 16px;
  flex-shrink: 0;
  border: 1px solid var(--fe-border-strong);
  border-radius: var(--fe-radius-pill);
  background: var(--fe-surface);
  color: var(--fe-text-soft);
  font: inherit;
  font-size: 14px;
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    color: var(--fe-brand-deep);
    border-color: var(--fe-brand);
    background: var(--fe-brand-soft);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--fe-brand-ring);
  }
}

.main-container {
  position: relative;
  flex: 1;
  width: 100%;
  max-width: none;
  padding: 0;
  overflow: clip;
}

.route-page-shell {
  width: 100%;
}

.footer-container {
  margin-top: auto;
  padding: 20px 24px;
  border-top: 1px solid var(--fe-border);
  background: var(--fe-surface);
  text-align: center;
}

.footer-copyright {
  margin: 0;
  color: var(--fe-text-muted);
  font-size: 13px;
  line-height: 1.6;
  letter-spacing: 0.01em;
}

@media (max-width: 768px) {
  .navbar-inner {
    gap: 12px;
    padding-right: 16px;
    padding-left: 16px;
  }

  .brand-name {
    font-size: 16px;
  }

  .brand-logo {
    width: 34px;
    height: 34px;
  }

  .nav-section {
    gap: 12px;
    justify-content: flex-start;
  }

  .nav-link {
    font-size: 14px;
  }

  .logout-btn {
    padding: 0 12px;
  }
}

@media (max-width: 600px) {
  .brand-name {
    display: none;
  }
}
</style>
