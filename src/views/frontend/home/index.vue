<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-blob hero-blob-one" aria-hidden="true"></div>
      <div class="hero-blob hero-blob-two" aria-hidden="true"></div>
      <div class="hero-blob hero-blob-three" aria-hidden="true"></div>

      <div class="fe-container hero-grid">
        <div class="hero-copy">
          <div class="hero-badge">
            <span class="hero-badge-dot" aria-hidden="true"></span>
            AI 心理陪伴服务
          </div>
          <h1 class="hero-title">
            <span class="hero-title-line">一次温暖的对话</span>
            <span class="hero-title-line hero-title-highlight">化孤独为慰藉</span>
          </h1>
          <p class="hero-description">
            每个深夜，每个焦虑的时刻，我们都在这里。不必独自承受，让心与心的连结温暖您的每一天
          </p>
          <div class="hero-actions">
            <router-link to="/consultation" class="hero-button hero-button-primary">
              开始倾诉，获得陪伴
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </router-link>
            <router-link to="/emotion-diary" class="hero-button hero-button-secondary">
              记录心情，释放情感
            </router-link>
          </div>
        </div>

        <div class="hero-visual" aria-hidden="true">
          <div class="robot-orbit robot-orbit-outer"></div>
          <div class="robot-orbit robot-orbit-inner"></div>
          <div class="robot-halo"></div>
          <div class="robot-stage">
            <img :src="iconUrl" alt="" />
          </div>
          <span class="orbit-dot orbit-dot-one"></span>
          <span class="orbit-dot orbit-dot-two"></span>
          <div class="robot-caption">
            <span class="robot-status-dot"></span>
            随时倾听你的心声
          </div>
        </div>
      </div>

      <a class="scroll-cue" href="#overview" aria-label="查看下方内容">
        <span>了解我们能做什么</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </a>
    </section>

    <section id="overview" class="fe-section stats-section">
      <div ref="statsRef" class="fe-container stats-grid" aria-label="平台数据概览">
        <div
          v-for="(stat, index) in landingStats"
          :key="stat.label"
          v-reveal
          :style="{ '--stagger': index }"
          class="stat-item"
        >
          <strong>{{ formatCount(statValues[index], stat.suffix) }}</strong>
          <span>{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <section class="fe-section features-section">
      <div class="fe-container">
        <div class="section-heading">
          <h2 v-reveal class="fe-section-title">陪伴，从此刻开始</h2>
          <p v-reveal="1" class="fe-section-sub">选择适合你的方式，让情绪被看见，也让理解慢慢发生。</p>
        </div>

        <div class="feature-grid">
          <article
            v-for="(feature, index) in features"
            :key="feature.title"
            v-reveal
            :style="{ '--stagger': index }"
            class="feature-card"
            role="button"
            tabindex="0"
            :aria-label="`进入${feature.title}`"
            @click="activateFeature(feature)"
            @keydown.enter.prevent="activateFeature(feature)"
            @keydown.space.prevent="activateFeature(feature)"
          >
            <div class="feature-icon">
              <svg v-if="feature.icon === 'chat'" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 12a8 8 0 0 1-8 8H6l-3 2 1-4.5A8 8 0 1 1 21 12Z" />
                <path d="M8 11h.01M12 11h.01M16 11h.01" />
              </svg>
              <svg v-else-if="feature.icon === 'diary'" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                <path d="M8 7h7M8 11h7M8 15h4" />
                <path d="M4 7h2M4 11h2M4 15h2" />
              </svg>
              <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
                <path d="M4 5.5v16M8 7h8M8 11h8" />
              </svg>
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
            <span class="feature-link">
              探索更多
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </article>
        </div>
      </div>
    </section>

    <section class="fe-section process-section">
      <div class="fe-container">
        <div class="section-heading section-heading-centered">
          <h2 v-reveal class="fe-section-title">三步开启心灵对话</h2>
          <p v-reveal="1" class="fe-section-sub">没有复杂流程，只需要给自己一点空间。</p>
        </div>

        <ol class="process-list">
          <li
            v-for="(step, index) in processSteps"
            :key="step.title"
            v-reveal="index"
            class="process-item"
          >
            <span class="process-number">{{ String(index + 1).padStart(2, '0') }}</span>
            <div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section class="fe-section reasons-section">
      <div class="fe-container reasons-grid">
        <div class="reasons-copy">
          <p v-reveal.left class="eyebrow">WHY US</p>
          <h2 v-reveal.left="1" class="fe-section-title">为什么选择我们</h2>
          <p v-reveal.left="2" class="fe-section-sub">
            我们把专业边界、隐私保护与持续陪伴放在同等重要的位置。
          </p>
          <ul class="reason-list">
            <li v-for="(reason, index) in reasons" :key="reason.title" v-reveal.left="index + 2">
              <span class="reason-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m5 12 4 4L19 6" />
                </svg>
              </span>
              <div>
                <h3>{{ reason.title }}</h3>
                <p>{{ reason.description }}</p>
              </div>
            </li>
          </ul>
        </div>

        <div v-reveal.right class="chat-mock" aria-label="AI 对话示例">
          <div class="mock-header">
            <div class="mock-avatar">
              <img :src="iconUrl" alt="" />
            </div>
            <div>
              <strong>心理健康AI助手</strong>
              <span><i></i> 在线陪伴</span>
            </div>
          </div>
          <div class="mock-body">
            <div class="mock-day">今天 23:18</div>
            <div class="mock-bubble">
              听起来今天让你有些疲惫。我们可以先慢下来，一起说说此刻最让你挂心的事。
            </div>
            <div class="mock-typing" aria-label="正在输入">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="mock-input" aria-hidden="true">
            <span>写下你此刻的感受...</span>
            <span class="mock-send">
              <svg viewBox="0 0 24 24">
                <path d="M12 19V5M6 11l6-6 6 6" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <div class="fe-container cta-inner">
        <div v-reveal>
          <p class="cta-kicker">给心一个被听见的机会</p>
          <h2>准备好了吗？</h2>
          <p>立即注册，免费开始你的心灵对话</p>
        </div>
        <div v-reveal="1" class="cta-actions">
          <template v-if="isLoggedIn">
            <router-link to="/consultation" class="cta-button cta-button-light">开始对话</router-link>
            <router-link to="/emotion-diary" class="cta-button cta-button-outline">记录心情</router-link>
          </template>
          <template v-else>
            <router-link to="/auth/register" class="cta-button cta-button-light">免费注册</router-link>
            <router-link to="/frontendKnowledge" class="cta-button cta-button-outline">
              浏览知识库
            </router-link>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const iconUrl = new URL('@/assets/images/robot-fill.png', import.meta.url).href
const router = useRouter()
const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)

// 示例数据，可按实际替换
const landingStats = Object.freeze([
  { label: '注册用户', value: 12800, suffix: '+' },
  { label: '累计对话', value: 86000, suffix: '+' },
  { label: '情绪记录', value: 45000, suffix: '+' },
  { label: '心理知识文章', value: 320, suffix: '+' }
])

const features = Object.freeze([
  {
    title: 'AI 心理咨询',
    description: '在安全、不带评判的对话里梳理情绪，找到更适合自己的下一步。',
    icon: 'chat',
    path: '/consultation'
  },
  {
    title: '情绪日记',
    description: '用记录捕捉情绪变化，在回望中看见自己的感受与需要。',
    icon: 'diary',
    path: '/emotion-diary'
  },
  {
    title: '心理知识库',
    description: '从可靠内容中理解压力、睡眠与关系，积累可持续的自助力量。',
    icon: 'book',
    path: '/frontendKnowledge'
  }
])

const processSteps = Object.freeze([
  { title: '注册账号', description: '完成简单注册，建立只属于你的私密空间。' },
  { title: '开始对话', description: '从当下的感受说起，AI 会认真倾听并温和回应。' },
  { title: '获得洞察', description: '在持续交流与记录中，看见情绪背后的线索。' }
])

const reasons = Object.freeze([
  { title: '7×24 小时在线', description: '无论清晨还是深夜，都能找到一处安放情绪的空间。' },
  { title: '隐私安全保护', description: '尊重每一次表达，让对话在安全边界内发生。' },
  { title: '专业导向支持', description: '以专业心理健康知识为参考，保持清晰而负责的边界。' },
  { title: '持续自助学习', description: '将对话、记录和知识连接起来，形成长期自助习惯。' }
])

const statValues = ref(landingStats.map(() => 0))
const statsRef = ref(null)
let statsObserver = null
let countAnimationFrame = null

const formatCount = (value, suffix = '') => `${Math.round(value).toLocaleString('zh-CN')}${suffix}`

const runCountUp = () => {
  const startedAt = performance.now()
  const duration = 1200

  const tick = (now) => {
    const progress = Math.min((now - startedAt) / duration, 1)
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
    statValues.value = landingStats.map((stat) => stat.value * eased)
    if (progress < 1) {
      countAnimationFrame = requestAnimationFrame(tick)
    } else {
      statValues.value = landingStats.map((stat) => stat.value)
      countAnimationFrame = null
    }
  }

  countAnimationFrame = requestAnimationFrame(tick)
}

const setupStatsObserver = () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion || !('IntersectionObserver' in window)) {
    statValues.value = landingStats.map((stat) => stat.value)
    return
  }

  statsObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return
    runCountUp()
    statsObserver?.disconnect()
    statsObserver = null
  }, { threshold: 0.35 })

  if (statsRef.value) statsObserver.observe(statsRef.value)
}

const activateFeature = (feature) => {
  router.push(feature.path)
}

onMounted(setupStatsObserver)

onBeforeUnmount(() => {
  statsObserver?.disconnect()
  if (countAnimationFrame) cancelAnimationFrame(countAnimationFrame)
})
</script>

<style scoped lang="scss">
.home-page {
  overflow: hidden;
  background: var(--fe-surface);
  color: var(--fe-text);
}

.hero-section {
  position: relative;
  min-height: min(760px, calc(100svh - var(--fe-nav-h)));
  display: flex;
  align-items: center;
  overflow: hidden;
  background-image:
    linear-gradient(120deg, rgba(92, 107, 192, 0.18), transparent 45%),
    var(--fe-grad-brand);
  background-size: 180% 180%;
  color: var(--fe-surface);
  animation: hero-gradient-drift 14s ease-in-out infinite alternate;
}

.hero-grid {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(360px, 0.9fr);
  align-items: center;
  gap: clamp(40px, 8vw, 96px);
  padding-top: 72px;
  padding-bottom: 112px;
}

.hero-copy {
  max-width: 650px;
}

.hero-badge,
.hero-description,
.hero-actions {
  animation: hero-rise 0.9s var(--fe-ease-out) both;
}

.hero-badge {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 8px 14px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--fe-radius-pill);
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.94);
  font-size: 14px;
  font-weight: 600;
  backdrop-filter: blur(12px);
  animation-delay: 0.06s;
}

.hero-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8ff1c9;
  box-shadow: 0 0 0 5px rgba(143, 241, 201, 0.16);
}

.hero-title {
  margin: 26px 0 22px;
  display: flex;
  flex-direction: column;
  font-size: clamp(2.75rem, 5.3vw, 4.5rem);
  font-weight: 800;
  line-height: 1.14;
  letter-spacing: -0.045em;
}

/* 两行标题分开入场，比整块淡入更有层次 */
.hero-title-line {
  display: block;
  animation: hero-rise 1s var(--fe-ease-out) both;

  &:first-child {
    animation-delay: 0.16s;
  }

  &:last-child {
    animation-delay: 0.3s;
  }
}

.hero-title-highlight {
  width: fit-content;
  padding-bottom: 8px;
  /* 渐变字与 filter 同时作用在部分浏览器上会渲染异常，这里换成不含失焦的入场 */
  animation-name: hero-rise-soft;
  background: linear-gradient(90deg, #ffffff 10%, #b8ffe1 55%, #e7dcff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  max-width: 590px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 17px;
  line-height: 1.85;
  animation-delay: 0.44s;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 34px;
  animation-delay: 0.56s;
}

.hero-button {
  min-height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 24px;
  border: 1px solid transparent;
  border-radius: var(--fe-radius-md);
  font-size: 15px;
  font-weight: 700;
  transition:
    transform 0.25s var(--fe-ease-out),
    box-shadow 0.25s ease,
    background-color 0.25s ease,
    border-color 0.25s ease;

  svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &:hover {
    transform: translateY(-3px);
  }

  &:active {
    transform: translateY(-1px) scale(0.985);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px var(--fe-brand-ring);
  }
}

.hero-button-primary {
  background: var(--fe-surface);
  color: var(--fe-brand-deep);
  box-shadow: 0 14px 32px rgba(15, 52, 44, 0.18);

  &:hover {
    box-shadow: 0 18px 38px rgba(15, 52, 44, 0.24);
  }
}

.hero-button-secondary {
  border-color: rgba(255, 255, 255, 0.42);
  background: rgba(255, 255, 255, 0.12);
  color: var(--fe-surface);
  backdrop-filter: blur(12px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.64);
  }
}

.hero-visual {
  position: relative;
  min-height: 430px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: hero-zoom-in 1.15s var(--fe-ease-out) 0.34s both;
}

.robot-orbit,
.robot-halo,
.robot-stage,
.robot-caption,
.orbit-dot {
  position: absolute;
}

.robot-orbit {
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
}

.robot-orbit::before,
.robot-orbit::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.72);
}

.robot-orbit-outer {
  width: 360px;
  height: 360px;
  animation: orbit-rotate 22s linear infinite;

  &::before {
    top: 42px;
    right: 62px;
  }

  &::after {
    bottom: 62px;
    left: 42px;
  }
}

.robot-orbit-inner {
  width: 292px;
  height: 292px;
  border-style: dashed;
  opacity: 0.7;
  animation: orbit-rotate 18s linear infinite reverse;
}

.robot-halo {
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(223, 255, 243, 0.42), rgba(223, 255, 243, 0));
  filter: blur(10px);
  animation: halo-breathe 4.5s ease-in-out infinite;
}

.robot-stage {
  width: 250px;
  height: 250px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.08));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.55),
    0 26px 70px rgba(37, 42, 94, 0.24);
  backdrop-filter: blur(18px);
  animation: robot-float 5s ease-in-out infinite;

  img {
    width: 170px;
    height: 170px;
    object-fit: contain;
    filter: drop-shadow(0 16px 22px rgba(31, 42, 38, 0.16));
  }
}

.orbit-dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: var(--fe-surface);
  box-shadow: 0 0 0 9px rgba(255, 255, 255, 0.12);
}

.orbit-dot-one {
  top: 24%;
  left: 5%;
}

.orbit-dot-two {
  right: 8%;
  bottom: 28%;
  width: 9px;
  height: 9px;
}

.robot-caption {
  bottom: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: var(--fe-radius-pill);
  background: rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.92);
  font-size: 13px;
  backdrop-filter: blur(14px);
}

.robot-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #8ff1c9;
}

.hero-blob {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(60px);
  will-change: transform;
}

.hero-blob-one {
  top: -90px;
  right: 12%;
  width: 330px;
  height: 330px;
  background: rgba(255, 255, 255, 0.18);
  animation: blob-drift 18s ease-in-out infinite;
}

.hero-blob-two {
  bottom: -110px;
  left: -40px;
  width: 380px;
  height: 380px;
  background: rgba(129, 146, 242, 0.26);
  animation: blob-drift 24s ease-in-out -7s infinite;
}

.hero-blob-three {
  top: 38%;
  left: 48%;
  width: 190px;
  height: 190px;
  background: rgba(183, 255, 223, 0.2);
  animation: blob-drift 15s ease-in-out -3s infinite;
}

.scroll-cue {
  position: absolute;
  left: 50%;
  bottom: 28px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  letter-spacing: 0.04em;
  animation: cue-bounce 1.8s ease-in-out infinite;

  svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &:focus-visible {
    outline: none;
    border-radius: 6px;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.48);
  }
}

.stats-section {
  padding-top: 0;
  padding-bottom: 0;
  background: var(--fe-surface);
}

.stats-grid {
  position: relative;
  z-index: 4;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-top: -42px;
  border: 1px solid var(--fe-border);
  border-radius: var(--fe-radius-lg);
  background: var(--fe-surface);
  box-shadow: var(--fe-shadow-lg);
}

.stat-item {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 30px 18px;
  text-align: center;

  & + & {
    border-left: 1px solid var(--fe-border);
  }

  strong {
    color: var(--fe-brand-deep);
    font-size: clamp(1.55rem, 2.7vw, 2rem);
    line-height: 1.1;
    letter-spacing: -0.025em;
    font-variant-numeric: tabular-nums;
  }

  span {
    color: var(--fe-text-muted);
    font-size: 13px;
  }
}

.features-section {
  background: var(--fe-surface);
}

.section-heading {
  max-width: 650px;
  margin-bottom: 38px;

  .fe-section-title,
  .fe-section-sub {
    margin: 0;
  }

  .fe-section-sub {
    margin-top: 12px;
  }
}

.section-heading-centered {
  margin-right: auto;
  margin-left: auto;
  text-align: center;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.feature-card {
  min-height: 280px;
  padding: 28px;
  border: 1px solid var(--fe-border);
  border-radius: var(--fe-radius-lg);
  background: var(--fe-surface-2);
  cursor: pointer;
  transition:
    transform 0.28s var(--fe-ease-out),
    border-color 0.28s ease,
    box-shadow 0.28s ease,
    background-color 0.28s ease;

  h3 {
    margin: 24px 0 11px;
    color: var(--fe-text);
    font-size: 20px;
  }

  p {
    margin: 0;
    color: var(--fe-text-muted);
    font-size: 14px;
    line-height: 1.75;
  }

  &:hover {
    transform: translateY(-6px);
    border-color: var(--fe-brand);
    background: var(--fe-surface);
    box-shadow: var(--fe-shadow-lg);
  }

  &:hover .feature-icon {
    background: var(--fe-brand);
    color: var(--fe-surface);
    transform: translateY(-2px) scale(1.06);
  }

  &:focus-visible {
    outline: none;
    border-color: var(--fe-brand);
    box-shadow: 0 0 0 3px var(--fe-brand-ring);
  }
}

.feature-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: var(--fe-brand-soft);
  color: var(--fe-brand-deep);
  transition:
    transform 0.32s var(--fe-ease-out),
    background-color 0.28s ease,
    color 0.28s ease;

  svg {
    width: 27px;
    height: 27px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}

.feature-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 24px;
  color: var(--fe-brand-deep);
  font-size: 14px;
  font-weight: 700;

  svg {
    width: 17px;
    height: 17px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: transform 0.2s ease;
  }
}

.feature-card:hover .feature-link svg {
  transform: translateX(3px);
}

.process-section {
  background: var(--fe-bg);
}

.process-list {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 34px;

  &::before {
    content: '';
    position: absolute;
    top: 25px;
    left: 15%;
    right: 15%;
    height: 2px;
    background: linear-gradient(90deg, var(--fe-accent), var(--fe-brand));
  }
}

.process-item {
  position: relative;
  text-align: center;

  h3 {
    margin: 20px 0 8px;
    color: var(--fe-text);
    font-size: 17px;
  }

  p {
    max-width: 280px;
    margin: 0 auto;
    color: var(--fe-text-muted);
    font-size: 14px;
    line-height: 1.7;
  }
}

.process-number {
  position: relative;
  z-index: 1;
  width: 52px;
  height: 52px;
  display: inline-grid;
  place-items: center;
  border: 5px solid var(--fe-bg);
  border-radius: 50%;
  background: var(--fe-surface);
  box-shadow: var(--fe-shadow-sm);
  color: var(--fe-brand-deep);
  font-size: 13px;
  font-weight: 800;
}

.reasons-section {
  background: var(--fe-surface);
}

.reasons-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(380px, 1.1fr);
  align-items: center;
  gap: clamp(44px, 8vw, 104px);
}

.eyebrow {
  margin: 0 0 14px;
  color: var(--fe-brand-deep);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.reasons-copy .fe-section-title,
.reasons-copy .fe-section-sub {
  margin: 0;
}

.reasons-copy .fe-section-sub {
  margin-top: 13px;
}

.reason-list {
  display: grid;
  gap: 18px;
  margin-top: 30px;

  li {
    display: flex;
    align-items: flex-start;
    gap: 13px;
  }

  h3 {
    margin: 0 0 5px;
    color: var(--fe-text);
    font-size: 15px;
  }

  p {
    margin: 0;
    color: var(--fe-text-muted);
    font-size: 13px;
    line-height: 1.65;
  }
}

.reason-icon {
  width: 29px;
  height: 29px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--fe-brand-soft);
  color: var(--fe-brand-deep);

  svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}

.chat-mock {
  overflow: hidden;
  border: 1px solid var(--fe-border);
  border-radius: 26px;
  background: var(--fe-surface);
  box-shadow: var(--fe-shadow-lg);
}

.mock-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--fe-border);
  background: rgba(255, 255, 255, 0.9);

  strong,
  span {
    display: flex;
  }

  strong {
    color: var(--fe-text);
    font-size: 14px;
  }

  span {
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    color: var(--fe-text-muted);
    font-size: 11px;
  }

  i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--fe-brand);
  }
}

.mock-avatar {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: var(--fe-brand-soft);

  img {
    width: 29px;
    height: 29px;
    object-fit: contain;
  }
}

.mock-body {
  min-height: 260px;
  padding: 22px 20px;
  background:
    radial-gradient(circle at 90% 10%, rgba(129, 146, 242, 0.09), transparent 34%),
    var(--fe-surface-2);
}

.mock-day {
  margin-bottom: 20px;
  color: var(--fe-text-faint);
  font-size: 11px;
  text-align: center;
}

.mock-bubble {
  max-width: 88%;
  padding: 15px 17px;
  border: 1px solid var(--fe-border);
  border-radius: 4px 18px 18px;
  background: var(--fe-surface);
  box-shadow: var(--fe-shadow-sm);
  color: var(--fe-text-soft);
  font-size: 14px;
  line-height: 1.75;
}

.mock-typing {
  width: fit-content;
  display: flex;
  gap: 5px;
  margin-top: 14px;
  padding: 11px 14px;
  border-radius: var(--fe-radius-pill);
  background: var(--fe-surface);
  box-shadow: var(--fe-shadow-sm);

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--fe-text-faint);
    animation: mock-dot 1.4s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.18s;
    }

    &:nth-child(3) {
      animation-delay: 0.36s;
    }
  }
}

.mock-input {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 16px 16px;
  padding: 9px 9px 9px 16px;
  border: 1px solid var(--fe-border);
  border-radius: var(--fe-radius-md);
  background: var(--fe-surface);
  color: var(--fe-text-faint);
  font-size: 13px;

  > span:first-child {
    flex: 1;
  }
}

.mock-send {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 11px;
  background: var(--fe-grad-accent);
  color: var(--fe-surface);

  svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}

.cta-section {
  padding: 20px 24px 72px;
  background: var(--fe-surface);
}

.cta-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: clamp(34px, 5vw, 54px);
  overflow: hidden;
  border-radius: 28px;
  background:
    radial-gradient(circle at 90% 10%, rgba(255, 255, 255, 0.2), transparent 38%),
    var(--fe-grad-brand);
  box-shadow: var(--fe-shadow-lg);
  color: var(--fe-surface);

  h2 {
    margin: 5px 0 7px;
    font-size: clamp(1.8rem, 3.4vw, 2.65rem);
    letter-spacing: -0.035em;
  }

  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.7;
  }

  .cta-kicker {
    color: rgba(255, 255, 255, 0.72);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
  }
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.cta-button {
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 22px;
  border: 1px solid transparent;
  border-radius: var(--fe-radius-md);
  font-size: 14px;
  font-weight: 700;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.3);
  }
}

.cta-button-light {
  background: var(--fe-surface);
  color: var(--fe-brand-deep);
}

.cta-button-outline {
  border-color: rgba(255, 255, 255, 0.44);
  background: rgba(255, 255, 255, 0.12);
  color: var(--fe-surface);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

@keyframes robot-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-12px);
  }
}

@keyframes halo-breathe {
  0%,
  100% {
    opacity: 0.65;
    transform: scale(0.94);
  }

  50% {
    opacity: 1;
    transform: scale(1.08);
  }
}

@keyframes orbit-rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes hero-gradient-drift {
  from {
    background-position: 0% 50%;
  }

  to {
    background-position: 100% 50%;
  }
}

@keyframes cue-bounce {
  0%,
  100% {
    transform: translate(-50%, 0);
  }

  50% {
    transform: translate(-50%, 7px);
  }
}

@keyframes mock-dot {
  0%,
  100% {
    opacity: 0.45;
    transform: translateY(0);
    background: var(--fe-text-faint);
  }

  50% {
    opacity: 1;
    transform: translateY(-3px);
    background: var(--fe-brand);
  }
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translate3d(0, 42px, 0) scale(0.98);
    filter: blur(10px);
  }

  to {
    opacity: 1;
    transform: none;
    filter: none;
  }
}

@keyframes hero-rise-soft {
  from {
    opacity: 0;
    transform: translate3d(0, 42px, 0) scale(0.98);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes hero-zoom-in {
  from {
    opacity: 0;
    transform: scale(0.86);
    filter: blur(14px);
  }

  to {
    opacity: 1;
    transform: none;
    filter: none;
  }
}

@keyframes blob-drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    transform: translate3d(-30px, 24px, 0) scale(1.08);
  }
}

@media (max-width: 900px) {
  .hero-section {
    min-height: auto;
  }

  .hero-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    padding-top: 48px;
    padding-bottom: 108px;
    text-align: center;
  }

  .hero-copy {
    max-width: 680px;
    margin: 0 auto;
  }

  .hero-badge {
    margin: 0 auto;
  }

  .hero-title-highlight {
    margin: 0 auto;
  }

  .hero-description {
    margin: 0 auto;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-visual {
    min-height: 360px;
    order: -1;
  }

  .robot-stage {
    width: 220px;
    height: 220px;

    img {
      width: 148px;
      height: 148px;
    }
  }

  .robot-orbit-outer {
    width: 310px;
    height: 310px;
  }

  .robot-orbit-inner {
    width: 260px;
    height: 260px;
  }

  .robot-halo {
    width: 240px;
    height: 240px;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .feature-card {
    min-height: 0;
  }

  .process-list {
    grid-template-columns: 1fr;
    gap: 30px;

    &::before {
      top: 0;
      bottom: 0;
      left: 25px;
      right: auto;
      width: 2px;
      height: auto;
      background: linear-gradient(180deg, var(--fe-accent), var(--fe-brand));
    }
  }

  .process-item {
    display: grid;
    grid-template-columns: 52px 1fr;
    gap: 16px;
    text-align: left;

    h3 {
      margin-top: 7px;
    }

    p {
      max-width: none;
      margin: 0;
    }
  }

  .reasons-grid {
    grid-template-columns: 1fr;
  }

  .chat-mock {
    max-width: 580px;
    width: 100%;
    margin: 0 auto;
  }

  .cta-inner {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 600px) {
  .hero-grid {
    padding-top: 30px;
    padding-right: 18px;
    padding-left: 18px;
  }

  .hero-visual {
    min-height: 300px;
  }

  .robot-stage {
    width: 180px;
    height: 180px;

    img {
      width: 120px;
      height: 120px;
    }
  }

  .robot-orbit-outer {
    width: 250px;
    height: 250px;
  }

  .robot-orbit-inner {
    width: 212px;
    height: 212px;
  }

  .robot-halo {
    width: 200px;
    height: 200px;
  }

  .robot-caption {
    bottom: 0;
  }

  .hero-title {
    margin-top: 20px;
    font-size: 1.75rem;
    line-height: 1.25;
  }

  .hero-description {
    font-size: 15px;
  }

  .hero-actions {
    flex-direction: column;
  }

  .hero-button {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-item {
    padding: 22px 12px;

    &:nth-child(3) {
      border-left: 0;
      border-top: 1px solid var(--fe-border);
    }

    &:nth-child(4) {
      border-top: 1px solid var(--fe-border);
    }
  }

  .feature-card {
    padding: 23px;
  }

  .cta-section {
    padding: 10px 16px 56px;
  }

  .cta-actions {
    width: 100%;
    flex-direction: column;
  }

  .cta-button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-section,
  .hero-blob,
  .hero-badge,
  .hero-title-line,
  .hero-description,
  .hero-actions,
  .hero-visual,
  .robot-orbit,
  .robot-halo,
  .robot-stage,
  .scroll-cue,
  .mock-typing span {
    animation: none;
  }
}
</style>
