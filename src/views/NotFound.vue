<template>
  <div class="not-found">
    <div class="nf-glow" aria-hidden="true"></div>

    <div class="nf-card">
      <p class="nf-code">404</p>
      <h1>这一页走丢了</h1>
      <p class="nf-text">可能链接过期了，也可能我们把它收起来了。<br />回首页看看，或者直接找我们聊聊。</p>
      <div class="nf-actions">
        <router-link to="/" class="nf-btn nf-primary">回到首页</router-link>
        <router-link to="/consultation" class="nf-btn nf-ghost">去聊聊</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'

// 404 页面独立于前台布局，需要自己挂上主题类才能用到品牌令牌
onMounted(() => {
  document.body.classList.add('fe-theme')
})

onBeforeUnmount(() => {
  document.body.classList.remove('fe-theme')
})
</script>

<style scoped lang="scss">
.not-found {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 32px 24px;
  overflow: hidden;
  background: var(--fe-bg);
  box-sizing: border-box;
}

.nf-glow {
  position: absolute;
  top: -30%;
  left: 50%;
  width: min(80vw, 720px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(46, 191, 145, 0.16), transparent 66%);
  transform: translateX(-50%);
  pointer-events: none;
}

.nf-card {
  position: relative;
  max-width: 520px;
  padding: clamp(32px, 5vw, 56px);
  border: 1px solid var(--fe-border);
  border-radius: var(--fe-radius-lg);
  background: var(--fe-surface);
  box-shadow: var(--fe-shadow-md);
  text-align: center;
}

.nf-code {
  margin: 0;
  font-size: clamp(4.5rem, 16vw, 7rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.06em;
  background: var(--fe-grad-brand);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nf-card h1 {
  margin: 14px 0 10px;
  color: var(--fe-text);
  font-size: clamp(1.35rem, 3vw, 1.75rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.nf-text {
  margin: 0;
  color: var(--fe-text-muted);
  font-size: 14px;
  line-height: 1.8;
}

.nf-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.nf-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 22px;
  border: 1px solid transparent;
  border-radius: var(--fe-radius-md);
  font-size: 14px;
  font-weight: 600;
  transition:
    transform 0.2s var(--fe-ease-out),
    background-color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--fe-brand-ring);
  }
}

.nf-primary {
  background: var(--fe-brand);
  color: #fff;
  box-shadow: var(--fe-shadow-brand);

  &:hover {
    background: var(--fe-brand-deep);
  }
}

.nf-ghost {
  border-color: var(--fe-border-strong);
  background: var(--fe-surface);
  color: var(--fe-text-soft);

  &:hover {
    border-color: var(--fe-brand);
    color: var(--fe-brand-deep);
  }
}

@media (max-width: 480px) {
  .nf-actions {
    flex-direction: column;

    .nf-btn {
      width: 100%;
    }
  }
}
</style>
