<template>
  <div class="article-page">
    <div class="reading-progress" :style="{ transform: `scaleX(${progress})` }" aria-hidden="true"></div>

    <FrontendPageHero
      compact
      :eyebrow="articleDetail.categoryName || 'KNOWLEDGE'"
      :title="articleDetail.title || '正在加载文章…'"
    >
      <template #aside>
        <button type="button" class="back-btn" @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </button>
        <div v-if="articleDetail.id" class="hero-meta">
          <span>{{ articleDetail.authorName || '匿名作者' }}</span>
          <span class="dot">·</span>
          <span>{{ publishDate }}</span>
          <span class="dot">·</span>
          <span>{{ articleDetail.readCount || 0 }} 次阅读</span>
        </div>
      </template>
    </FrontendPageHero>

    <section class="page-body">
      <div class="fe-container">
        <article v-if="articleDetail.id" class="paper">
          <p v-if="articleDetail.summary" class="summary">{{ articleDetail.summary }}</p>

          <div class="rich-content" v-html="formatContent(articleDetail.content)"></div>

          <div v-if="tags.length" class="tags">
            <h2 class="tags-title">相关标签</h2>
            <div class="tags-list">
              <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
        </article>

        <div v-else class="paper">
          <el-skeleton :rows="10" animated />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getArticleDetailAPI } from '@/api/knowledge'
import { sanitizeHtml } from '@/utils/sanitize'
import FrontendPageHero from '@/components/FrontendPageHero.vue'

const route = useRoute()
const router = useRouter()

const articleDetail = ref({})
// 顶部阅读进度，随滚动从 0 到 1
const progress = ref(0)

const publishDate = computed(() => {
  const at = articleDetail.value.publishedAt || articleDetail.value.updatedAt
  return at ? dayjs(at).format('YYYY-MM-DD') : ''
})

const tags = computed(() => {
  const value = articleDetail.value.tagArray
  return Array.isArray(value) ? value.filter(Boolean) : []
})

const formatContent = (content) => {
  if (!content) return ''
  // 正文由富文本编辑器保存为 HTML，直接净化后渲染（不要再做换行/星号转换）
  return sanitizeHtml(content)
}

const loadArticle = async (articleId) => {
  if (!articleId) return
  progress.value = 0
  try {
    const res = await getArticleDetailAPI(articleId)

    if (res.tags && typeof res.tags === 'string') {
      res.tagArray = res.tags.split(',').filter(Boolean)
    } else if (Array.isArray(res.tags)) {
      res.tagArray = res.tags
    }

    articleDetail.value = res
  } catch (err) {
    console.error('获取文章详情失败:', err)
  }
}

const updateProgress = () => {
  const doc = document.documentElement
  const scrollable = Math.max(doc.scrollHeight, document.body.scrollHeight) - window.innerHeight
  if (scrollable <= 0) {
    progress.value = 0
    return
  }
  const top = window.scrollY || doc.scrollTop || 0
  progress.value = Math.min(1, Math.max(0, top / scrollable))
}

// 同一路由切换文章 id 时组件会被复用，需要监听参数变化重新拉取
watch(() => route.params.id, (id) => loadArticle(id), { immediate: true })

onMounted(() => {
  window.addEventListener('scroll', updateProgress, { passive: true })
  updateProgress()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateProgress)
})
</script>

<style lang="scss" scoped>
.article-page {
  background: var(--fe-bg);
}

.reading-progress {
  position: fixed;
  top: var(--fe-nav-h);
  right: 0;
  left: 0;
  z-index: 45;
  height: 3px;
  background: var(--fe-grad-brand);
  transform-origin: left center;
  will-change: transform;
}

// 页头右侧：返回按钮 + 文章信息
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 38px;
  padding: 0 16px;
  border: 1px solid rgba(255, 255, 255, 0.34);
  border-radius: var(--fe-radius-pill);
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font: inherit;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(6px);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.24);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.4);
  }
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.78);
}

.dot {
  opacity: 0.6;
}

.page-body {
  padding: clamp(24px, 3.4vw, 40px) 0 clamp(56px, 7vw, 88px);
}

.paper {
  max-width: 800px;
  margin: 0 auto;
  padding: clamp(24px, 3.4vw, 44px);
  border: 1px solid var(--fe-border);
  border-radius: var(--fe-radius-lg);
  background: var(--fe-surface);
  box-shadow: var(--fe-shadow-sm);
}

// 摘要：品牌浅底 + 左侧强调线
.summary {
  margin: 0 0 28px;
  padding: 16px 20px;
  border-left: 3px solid var(--fe-brand);
  border-radius: 0 var(--fe-radius-md) var(--fe-radius-md) 0;
  background: var(--fe-brand-soft);
  color: var(--fe-text-soft);
  font-size: 14.5px;
  line-height: 1.8;
}

// 正文排版
.rich-content {
  color: var(--fe-text-soft);
  font-size: 16px;
  line-height: 1.9;
  word-break: break-word;

  :deep(p) {
    margin: 0 0 18px;
  }

  :deep(h1),
  :deep(h2) {
    margin: 34px 0 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--fe-border);
    color: var(--fe-text);
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.4;
  }

  :deep(h3) {
    margin: 26px 0 10px;
    color: var(--fe-text);
    font-size: 18px;
    font-weight: 700;
    line-height: 1.5;
  }

  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin: 20px 0 8px;
    color: var(--fe-text);
    font-size: 16px;
    font-weight: 700;
  }

  :deep(img) {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 22px auto;
    border-radius: var(--fe-radius-md);
  }

  :deep(blockquote) {
    margin: 22px 0;
    padding: 14px 18px;
    border-left: 3px solid var(--fe-brand);
    border-radius: 0 var(--fe-radius-sm) var(--fe-radius-sm) 0;
    background: var(--fe-surface-2);
    color: var(--fe-text-muted);
  }

  :deep(ul),
  :deep(ol) {
    margin: 0 0 18px;
    padding-left: 22px;
  }

  :deep(li) {
    margin-bottom: 8px;
  }

  :deep(a) {
    color: var(--fe-brand-deep);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  :deep(table) {
    width: 100%;
    margin: 22px 0;
    border-collapse: collapse;
    font-size: 14.5px;
  }

  :deep(th),
  :deep(td) {
    padding: 10px 12px;
    border: 1px solid var(--fe-border);
    text-align: left;
  }

  :deep(th) {
    background: var(--fe-surface-2);
    color: var(--fe-text);
    font-weight: 600;
  }

  :deep(pre) {
    overflow-x: auto;
    margin: 20px 0;
    padding: 16px;
    border: 1px solid var(--fe-border);
    border-radius: var(--fe-radius-md);
    background: var(--fe-surface-2);
    font-size: 13.5px;
    line-height: 1.7;
  }

  :deep(code) {
    padding: 2px 6px;
    border: 1px solid var(--fe-border);
    border-radius: 6px;
    background: var(--fe-surface-2);
    font-size: 0.9em;
  }

  :deep(pre code) {
    padding: 0;
    border: 0;
    background: none;
  }

  :deep(hr) {
    margin: 30px 0;
    border: 0;
    border-top: 1px solid var(--fe-border);
  }
}

// 标签
.tags {
  margin-top: 36px;
  padding-top: 20px;
  border-top: 1px solid var(--fe-border);
}

.tags-title {
  margin: 0 0 12px;
  color: var(--fe-text-muted);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 5px 12px;
  border: 1px solid var(--fe-border);
  border-radius: var(--fe-radius-pill);
  background: var(--fe-surface-2);
  color: var(--fe-text-muted);
  font-size: 12.5px;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    border-color: var(--fe-brand);
    background: var(--fe-brand-soft);
    color: var(--fe-brand-deep);
  }
}

@media (max-width: 700px) {
  .rich-content {
    font-size: 15.5px;
    line-height: 1.85;

    :deep(h1),
    :deep(h2) {
      font-size: 20px;
    }
  }

  .hero-meta {
    font-size: 12.5px;
  }
}
</style>
