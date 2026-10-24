<template>
  <div class="auth-layout">
    <!-- 左：品牌区 -->
    <aside class="brand-pane">
      <div class="pane-grid" aria-hidden="true"></div>
      <div class="orb orb-one" aria-hidden="true"></div>
      <div class="orb orb-two" aria-hidden="true"></div>

      <div class="brand-row">
        <img class="brand-logo" :src="logoUrl" alt="" />
        <span class="brand-name">心理健康AI助手</span>
      </div>

      <div class="pane-content">
        <p class="pane-eyebrow">WELCOME</p>
        <h1 class="pane-title">慢一点，<br />先照顾好自己</h1>
        <p class="pane-text">AI 陪你梳理情绪、记录心情，白天或深夜，都在。</p>

        <div class="robot-stage">
          <span class="robot-glow" aria-hidden="true"></span>
          <span class="robot-glass">
            <el-image class="robot-img" :src="robotUrl" fit="contain" alt="心理健康助手" />
          </span>
        </div>
      </div>

      <p class="pane-foot">AI 陪伴不能替代专业医疗诊断</p>
    </aside>

    <!-- 右：表单区 -->
    <main class="form-pane">
      <div class="mobile-brand">
        <img :src="logoUrl" alt="" />
        <span>心理健康AI助手</span>
      </div>
      <div class="form-slot">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'

const logoUrl = new URL('@/assets/images/机器人.png', import.meta.url).href
const robotUrl = new URL('@/assets/images/robot-fill.png', import.meta.url).href

// 登录/注册页独立于前台布局，需要自己挂上主题类，表单控件才会跟随品牌色
onMounted(() => {
  document.body.classList.add('fe-theme')
})

onBeforeUnmount(() => {
  document.body.classList.remove('fe-theme')
})
</script>

<style lang="scss" scoped>
.auth-layout {
  display: flex;
  min-height: 100vh;
  background: var(--fe-surface);
}

// ---------- 左侧品牌区 ----------
.brand-pane {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 0 0 46%;
  max-width: 620px;
  padding: clamp(26px, 3.2vw, 46px);
  overflow: hidden;
  background-image: var(--fe-grad-brand);
  background-size: 150% 150%;
  color: #fff;
}

.pane-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
  background-size: 52px 52px;
  -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.85), transparent 88%);
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.85), transparent 88%);
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.orb-one {
  top: -140px;
  right: -110px;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent 70%);
  animation: pane-float 14s ease-in-out infinite;
}

.orb-two {
  bottom: -130px;
  left: -90px;
  width: 340px;
  height: 340px;
  background: radial-gradient(circle, rgba(149, 239, 216, 0.26), transparent 70%);
  animation: pane-float 18s ease-in-out -6s infinite reverse;
}

.brand-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  z-index: 1;
}

.brand-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.14);
  padding: 4px;
  box-sizing: border-box;
}

.brand-name {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.pane-content {
  position: relative;
  z-index: 1;
  padding: 12px 0;
  text-align: center;
}

.pane-eyebrow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 0 16px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.76);

  &::before {
    content: '';
    width: 22px;
    height: 1px;
    background: currentColor;
  }
}

.pane-title {
  margin: 0 0 14px;
  font-size: clamp(1.9rem, 3.4vw, 2.6rem);
  font-weight: 800;
  line-height: 1.24;
  letter-spacing: -0.035em;
}

.pane-text {
  max-width: 34ch;
  margin: 0 auto;
  font-size: 15px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.78);
}

.robot-stage {
  position: relative;
  width: 168px;
  height: 168px;
  margin: clamp(28px, 4vw, 46px) auto 0;
}

.robot-glow {
  position: absolute;
  inset: -18%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.22), transparent 68%);
  animation: glow-breathe 4.5s ease-in-out infinite;
}

.robot-glass {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.04));
  backdrop-filter: blur(16px);
  animation: robot-float 5s ease-in-out infinite;
}

.robot-img {
  width: 86px;
  height: 86px;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.pane-foot {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

// ---------- 右侧表单区 ----------
.form-pane {
  position: relative;
  flex: 1;
  min-height: 100vh;
  overflow-y: auto;
  background: var(--fe-surface);
  box-sizing: border-box;
}

.form-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: clamp(24px, 4vw, 56px);
  box-sizing: border-box;
}

.mobile-brand {
  display: none;
  align-items: center;
  gap: 8px;
  padding: 16px 20px 0;
  color: var(--fe-text);
  font-size: 15px;
  font-weight: 700;

  img {
    width: 28px;
    height: 28px;
    object-fit: contain;
  }
}

@keyframes pane-float {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    transform: translate3d(-24px, 22px, 0) scale(1.06);
  }
}

@keyframes glow-breathe {
  0%,
  100% {
    opacity: 0.55;
    transform: scale(0.94);
  }

  50% {
    opacity: 0.9;
    transform: scale(1.08);
  }
}

@keyframes robot-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@media (max-width: 900px) {
  .brand-pane {
    display: none;
  }

  .mobile-brand {
    display: flex;
  }

  .form-slot {
    min-height: auto;
    padding-top: 28px;
    padding-bottom: 40px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .orb,
  .robot-glow,
  .robot-glass {
    animation: none;
  }
}
</style>
