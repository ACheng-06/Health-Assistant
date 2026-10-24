<template>
  <div class="knowledge-page">
    <FrontendPageHero
      wide
      eyebrow="KNOWLEDGE"
      title="知识库"
      desc="关于情绪、关系与自我调节的文章，慢慢读，不着急。"
    >
      <template #aside>
        <div class="hero-metric">
          <span class="metric-value">{{ pagination.total }}</span>
          <span class="metric-label">篇文章</span>
        </div>
      </template>
    </FrontendPageHero>

    <section class="page-body">
      <div class="fe-container knowledge-layout">
        <!-- 文章列表 -->
        <div class="article-column">
          <div v-if="loading" class="skeleton-list">
            <div v-for="n in 3" :key="n" class="skeleton-card">
              <el-skeleton animated>
                <template #template>
                  <div class="skeleton-row">
                    <el-skeleton-item variant="image" class="skeleton-cover" />
                    <div class="skeleton-text">
                      <el-skeleton-item variant="h3" style="width: 55%" />
                      <el-skeleton-item variant="text" style="width: 92%" />
                      <el-skeleton-item variant="text" style="width: 40%" />
                    </div>
                  </div>
                </template>
              </el-skeleton>
            </div>
          </div>

          <template v-else-if="articleList.length">
            <article
              v-for="(item, index) in articleList"
              :key="item.id"
              v-reveal="index % 3"
              class="article-card"
              role="link"
              tabindex="0"
              @click="goToArticle(item.id)"
              @keydown.enter="goToArticle(item.id)"
            >
              <div class="cover-wrap">
                <el-image class="cover" :src="getImage(item.coverImage)" fit="cover" />
              </div>
              <div class="article-body">
                <div class="article-meta-top">
                  <span v-if="item.categoryName" class="category-pill">{{ item.categoryName }}</span>
                  <span v-if="item.publishedAt" class="meta-time">
                    {{ dayjs(item.publishedAt).format('YYYY-MM-DD') }}
                  </span>
                </div>
                <h2 class="article-title">{{ item.title }}</h2>
                <p v-if="item.summary" class="article-summary">{{ item.summary }}</p>
                <div class="article-foot">
                  <span>{{ item.authorName || '匿名作者' }}</span>
                  <span class="dot">·</span>
                  <span>{{ item.readCount || 0 }} 次阅读</span>
                </div>
              </div>
            </article>

            <div class="pagination-wrapper">
              <el-pagination
                background
                layout="prev, pager, next"
                :current-page="pagination.currentPage"
                :page-size="pagination.size"
                :total="pagination.total"
                @current-change="handleChange"
              />
            </div>
          </template>

          <el-empty v-else class="empty-wrap" description="还没有文章，晚点再来看看" />
        </div>

        <!-- 推荐阅读 -->
        <aside class="recommend-column">
          <div class="recommend-card">
            <h2 class="recommend-title">推荐阅读</h2>
            <div v-if="recommendList.length" class="recommend-list">
              <button
                v-for="(item, index) in recommendList"
                :key="item.id"
                type="button"
                class="recommend-item"
                @click="goToArticle(item.id)"
              >
                <span class="recommend-index">{{ String(index + 1).padStart(2, '0') }}</span>
                <span class="recommend-body">
                  <span class="recommend-name">{{ item.title }}</span>
                  <span class="recommend-meta">{{ item.readCount || 0 }} 次阅读</span>
                </span>
              </button>
            </div>
            <p v-else class="recommend-empty">暂无推荐</p>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { getArticlePageAPI } from '@/api/knowledge'
import { fileBaseUrl } from '@/config'
import FrontendPageHero from '@/components/FrontendPageHero.vue'

const router = useRouter()

const loading = ref(true)
const articleList = ref([])
// 推荐阅读列表
const recommendList = ref([])

const pagination = reactive({
  currentPage: 1,
  size: 6,
  total: 0
})

// 获取列表方法
const getPageList = async () => {
  loading.value = true
  const params = {
    sortField: 'publishedAt',
    sortDirection: 'desc',
    ...pagination
  }
  try {
    const res = await getArticlePageAPI(params)
    articleList.value = res?.records || []
    pagination.total = res?.total || 0
  } catch (error) {
    console.error('获取文章列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取封面图片
const getImage = (url) => {
  if (!url) return 'https://file.itndedu.com/psychology_ai.png'
  return url.startsWith('http') ? url : `${fileBaseUrl}${url}`
}

const handleChange = (page) => {
  pagination.currentPage = page
  getPageList()
}

// 跳转到详情页面
const goToArticle = (id) => {
  router.push(`/knowledge/article/${id}`)
}

// 挂载钩子
onMounted(async () => {
  getPageList()
  try {
    const res = await getArticlePageAPI({
      sortField: '',
      sortDirection: '',
      currentPage: 1,
      size: 5
    })
    recommendList.value = res?.records || []
  } catch (error) {
    console.error('获取推荐阅读失败:', error)
  }
})
</script>

<style lang="scss" scoped>
.knowledge-page {
  background: var(--fe-bg);
}

.hero-metric {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 12px 20px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: var(--fe-radius-md);
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(6px);
}

.metric-value {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.metric-label {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.75);
}

.page-body {
  padding: clamp(24px, 3.4vw, 40px) 0 clamp(56px, 7vw, 88px);
}

.knowledge-layout {
  /* 列表页信息密度高，容器单独放宽一档 */
  --fe-container: var(--fe-container-wide);
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: clamp(20px, 2.6vw, 32px);
  align-items: start;
}

.article-column {
  min-width: 0;
}

// 文章卡
.article-card {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 18px;
  margin-bottom: 18px;
  padding: 14px;
  border: 1px solid var(--fe-border);
  border-radius: var(--fe-radius-lg);
  background: var(--fe-surface);
  box-shadow: var(--fe-shadow-sm);
  cursor: pointer;
  transition:
    transform 0.3s var(--fe-ease-out),
    box-shadow 0.3s ease,
    border-color 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: var(--fe-border-strong);
    box-shadow: var(--fe-shadow-md);
  }

  &:hover .article-title {
    color: var(--fe-brand-deep);
  }

  &:hover .cover {
    transform: scale(1.04);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--fe-brand-ring);
  }
}

.cover-wrap {
  overflow: hidden;
  aspect-ratio: 4 / 3;
  border-radius: var(--fe-radius-md);
  background: var(--fe-surface-2);
}

.cover {
  display: block;
  width: 100%;
  height: 100%;
  transition: transform 0.5s var(--fe-ease-out);

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.article-body {
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
  padding: 4px 8px 4px 0;
}

.article-meta-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-pill {
  padding: 3px 10px;
  border-radius: var(--fe-radius-pill);
  background: var(--fe-brand-soft);
  color: var(--fe-brand-deep);
  font-size: 12px;
  font-weight: 600;
}

.meta-time {
  color: var(--fe-text-faint);
  font-size: 12.5px;
}

.article-title {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: var(--fe-text);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.45;
  letter-spacing: -0.01em;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  transition: color 0.2s ease;
}

.article-summary {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: var(--fe-text-muted);
  font-size: 13.5px;
  line-height: 1.7;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.article-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding-top: 4px;
  color: var(--fe-text-faint);
  font-size: 12.5px;
}

.dot {
  opacity: 0.6;
}

// 骨架屏
.skeleton-card {
  margin-bottom: 18px;
  padding: 14px;
  border: 1px solid var(--fe-border);
  border-radius: var(--fe-radius-lg);
  background: var(--fe-surface);
}

.skeleton-row {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 18px;
  align-items: center;
}

.skeleton-cover {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: var(--fe-radius-md);
}

.skeleton-text {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 24px 0 8px;
}

.empty-wrap {
  padding: 48px 0;
  border: 1px dashed var(--fe-border-strong);
  border-radius: var(--fe-radius-lg);
  background: var(--fe-surface);
}

// 推荐阅读（桌面端固定左侧，移动端落到列表下方）
.recommend-column {
  order: -1;
  position: sticky;
  top: calc(var(--fe-nav-h) + 20px);
}

.recommend-card {
  padding: 20px;
  border: 1px solid var(--fe-border);
  border-radius: var(--fe-radius-lg);
  background: var(--fe-surface);
  box-shadow: var(--fe-shadow-sm);
}

.recommend-title {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 12px;
  color: var(--fe-text);
  font-size: 15px;
  font-weight: 700;

  &::before {
    content: '';
    width: 3px;
    height: 14px;
    border-radius: 2px;
    background: var(--fe-grad-brand);
  }
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.recommend-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 10px 10px 12px;
  border: 0;
  border-left: 2px solid transparent;
  border-radius: 0 var(--fe-radius-sm) var(--fe-radius-sm) 0;
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.22s ease,
    border-color 0.22s ease;

  &:hover {
    border-left-color: var(--fe-brand);
    background: var(--fe-brand-soft);
  }

  &:hover .recommend-name {
    color: var(--fe-brand-deep);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--fe-brand-ring);
  }
}

.recommend-index {
  padding-top: 1px;
  color: var(--fe-text-faint);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.6;
}

.recommend-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.recommend-name {
  display: -webkit-box;
  overflow: hidden;
  color: var(--fe-text-soft);
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  transition: color 0.2s ease;
}

.recommend-meta {
  color: var(--fe-text-faint);
  font-size: 12px;
}

.recommend-empty {
  margin: 0;
  padding: 12px 0;
  color: var(--fe-text-faint);
  font-size: 13px;
}

@media (max-width: 960px) {
  .knowledge-layout {
    grid-template-columns: 1fr;
  }

  .recommend-column {
    order: 0;
    position: static;
  }
}

@media (max-width: 700px) {
  .article-card {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .cover-wrap {
    aspect-ratio: 16 / 9;
  }

  .article-body {
    padding: 0 6px 6px;
  }

  .skeleton-row {
    grid-template-columns: 1fr;
  }

  .article-title {
    font-size: 16.5px;
  }
}
</style>
