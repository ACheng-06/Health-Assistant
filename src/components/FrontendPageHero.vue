<template>
  <header class="page-hero" :class="[`is-${variant}`, { 'is-compact': compact, 'is-wide': wide }]">
    <div class="hero-aura" aria-hidden="true"></div>
    <div class="hero-grid" aria-hidden="true"></div>

    <div class="fe-container hero-inner">
      <div class="hero-copy">
        <p v-if="eyebrow" class="hero-eyebrow">{{ eyebrow }}</p>
        <h1 class="hero-title">{{ title }}</h1>
        <p v-if="desc" class="hero-desc">{{ desc }}</p>
        <div v-if="$slots.actions" class="hero-actions">
          <slot name="actions" />
        </div>
      </div>

      <div v-if="$slots.aside" class="hero-aside">
        <slot name="aside" />
      </div>
    </div>
  </header>
</template>

<script setup>
// 前台各页共用的页头：统一渐变、留白与标题层级，避免每个页面各搓一套横幅
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  desc: { type: String, default: '' },
  // brand 走品牌渐变，accent 走副色渐变
  variant: { type: String, default: 'brand' },
  // 详情页这类不需要大留白的场景用紧凑版
  compact: { type: Boolean, default: false },
  // 内容栏较宽的页面（如知识库列表）与正文栏对齐到更宽的容器
  wide: { type: Boolean, default: false }
})
</script>

<style scoped lang="scss">
.page-hero {
  position: relative;
  overflow: hidden;
  background-image: var(--fe-grad-brand);
  background-size: 160% 160%;
  color: #fff;
}

.page-hero.is-accent {
  background-image: var(--fe-grad-accent);
}

.hero-aura {
  position: absolute;
  top: -46%;
  right: -12%;
  width: min(56vw, 640px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.22), transparent 62%);
  pointer-events: none;
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
  background-size: 56px 56px;
  -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), transparent 82%);
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), transparent 82%);
  pointer-events: none;
}

.hero-inner {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: clamp(18px, 4vw, 48px);
  padding-top: clamp(42px, 6vw, 74px);
  padding-bottom: clamp(36px, 5vw, 62px);
}

.page-hero.is-compact {
  .hero-inner {
    padding-top: clamp(30px, 4vw, 48px);
    padding-bottom: clamp(26px, 3.4vw, 42px);
  }
}

/* 与下方内容栏保持一致：默认 1100，宽版用令牌里的 1280 */
.page-hero.is-wide .hero-inner {
  --fe-container: var(--fe-container-wide);
}

.hero-copy {
  max-width: 760px;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.8);

  &::before {
    content: '';
    width: 22px;
    height: 1px;
    background: currentColor;
    opacity: 0.8;
  }
}

.hero-title {
  margin: 0;
  font-size: clamp(1.85rem, 4.2vw, 2.85rem);
  font-weight: 800;
  line-height: 1.16;
  letter-spacing: -0.035em;
  animation: hero-copy-rise 0.85s var(--fe-ease-out) both;
}

.hero-desc {
  max-width: 62ch;
  margin: 16px 0 0;
  font-size: 15.5px;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.82);
  animation: hero-copy-rise 0.85s var(--fe-ease-out) 0.12s both;
}

.hero-actions {
  margin-top: 22px;
  animation: hero-copy-rise 0.85s var(--fe-ease-out) 0.2s both;
}

.hero-aside {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  animation: hero-copy-rise 0.85s var(--fe-ease-out) 0.24s both;
}

@keyframes hero-copy-rise {
  from {
    opacity: 0;
    transform: translate3d(0, 24px, 0);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 720px) {
  .hero-inner {
    align-items: flex-start;
  }

  .hero-aside {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-title,
  .hero-desc,
  .hero-actions,
  .hero-aside {
    animation: none;
  }
}
</style>
