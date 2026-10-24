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
      <div class="fe-container footer-grid">
        <div class="footer-brand">
          <div class="footer-brand-line">
            <img :src="iconUrl" alt="" />
            <strong>心理健康AI助手</strong>
          </div>
          <p>用温暖、清晰且可靠的陪伴，帮助你更了解自己的情绪。</p>
        </div>

        <div class="footer-column">
          <h2>快捷导航</h2>
          <router-link to="/">首页</router-link>
          <router-link v-if="isLoggedIn" to="/consultation">AI 咨询</router-link>
          <router-link v-if="isLoggedIn" to="/emotion-diary">情绪日记</router-link>
          <router-link v-if="isLoggedIn" to="/frontendKnowledge">知识库</router-link>
        </div>

        <div class="footer-column footer-note">
          <h2>使用说明</h2>
          <p>AI 陪伴不能替代专业医疗诊断。</p>
          <p>如遇紧急情况，请及时联系当地专业机构或急救服务。</p>
        </div>
      </div>
      <div class="footer-bottom">© 2026 心理健康AI助手 版权所有</div>
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
  background: var(--fe-surface);
  border-top: 1px solid var(--fe-border);
  color: var(--fe-text-soft);
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 0.8fr 1.2fr;
  gap: 56px;
  padding-top: 48px;
  padding-bottom: 36px;
}

.footer-brand-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;

  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }

  strong {
    color: var(--fe-text);
    font-size: 17px;
  }
}

.footer-brand p,
.footer-note p {
  margin: 0;
  color: var(--fe-text-muted);
  font-size: 14px;
  line-height: 1.75;
}

.footer-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;

  h2 {
    margin: 0 0 4px;
    color: var(--fe-text);
    font-size: 15px;
    font-weight: 700;
  }

  a {
    min-height: 28px;
    color: var(--fe-text-muted);
    font-size: 14px;
    transition: color 0.2s ease;

    &:hover {
      color: var(--fe-brand-deep);
    }

    &:focus-visible {
      outline: none;
      border-radius: 4px;
      box-shadow: 0 0 0 3px var(--fe-brand-ring);
    }
  }
}

.footer-note {
  gap: 8px;
}

.footer-bottom {
  padding: 18px 24px;
  border-top: 1px solid var(--fe-border);
  color: var(--fe-text-faint);
  font-size: 13px;
  text-align: center;
}

@media (max-width: 900px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 36px;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }
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

  .footer-grid {
    grid-template-columns: 1fr;
  }

  .footer-brand {
    grid-column: auto;
  }
}
</style>
