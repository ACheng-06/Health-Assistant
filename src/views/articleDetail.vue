<template>
  <div class="articleDetail-container">
    <div class="header-section">
      <div class="header-content">
        <el-button class="back-btn" @click="router.back()">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          返回
        </el-button>
        <el-image :src="iconUrl" style="width: 60px; height: 60px"></el-image>
        <h1>知识文章详情</h1>
      </div>
    </div>


    <div class="content" v-if="articleDetail.id">
      <div class="diary-card">
        <p class="title">文章信息</p>
        <div class="sub-title">
          <el-tag size="large" class="category-tag" v-if="articleDetail.categoryName">
            {{ articleDetail.categoryName }}
          </el-tag>
          <div class="flex-box">
            <el-icon>
              <List />
            </el-icon>
            <!-- 确保有时间字段才进行格式化 -->

            <span v-if="articleDetail.publishedAt || articleDetail.updateAt">
              {{ dayjs(articleDetail.publishedAt || articleDetail.updateAt).format('YYYY-MM-DD') }}
            </span>
          </div>
        </div>
        <h1 class="article-title">{{ articleDetail.title }}</h1>

        <div class="summary-content" v-if="articleDetail.summary">
          <p>{{ articleDetail.summary }}</p>
        </div>

        <div :style="{ marginTop: '20px' }" class="flex-box">
          <div class="item flex-box">
            <el-icon>
              <Avatar />
            </el-icon>
            <span>{{ articleDetail.authorName }}</span>
          </div>
          <div class="item flex-box">
            <el-icon>
              <Platform />
            </el-icon>
            <span>{{ articleDetail.readCount || 0 }} 次阅读</span>
          </div>
        </div>
      </div>

      <div class="diary-card">
        <div class="title">正文内容</div>
        <div class="content-wrapper">
          <div v-html="formatContent(articleDetail.content)"></div>

          <!-- 标签渲染区域 -->
          <div class="tags-content" v-if="articleDetail.tagArray && articleDetail.tagArray.length">
            <h4 class="tags-title">相关标签</h4>
            <div class="tags-list">
              <el-tag v-for="tag in articleDetail.tagArray" :key="tag" type="info" effect="light" class="tag-item">
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据加载时的占位 -->
    <div v-else class="content" style="text-align: center; padding-top: 50px;">
      <el-empty description="正在加载文章内容..." />
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router' // 
  import { getKnowledgeDetailAPI } from '@/api/frontend'
  import { dayjs } from 'element-plus'


  const iconUrl = new URL('@/assets/images/book.png', import.meta.url).href


  const route = useRoute()
  const router = useRouter()
  const articleId = route.params.id

  const articleDetail = ref({})

  const formatContent = (content) => {
    if (!content) return ''

    // 基本的HTML清理和格式化
    let formatted = content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')

    return formatted
  }

  onMounted(() => {
    if (articleId) {
      getKnowledgeDetailAPI(articleId).then(res => {

        if (res.tags && typeof res.tags === 'string') {
          res.tagArray = res.tags.split(',')
        } else if (Array.isArray(res.tags)) {
          res.tagArray = res.tags
        }

        articleDetail.value = res
      }).catch(err => {
        console.error("获取文章详情失败:", err)
      })
    }
  })
</script>

<style lang="scss" scoped>
.articleDetail-container {
  background: linear-gradient(135deg, #fafbfc 0%, #f7f9fc 50%, #f2f6fa 100%);

  .flex-box {
    display: flex;
    align-items: center;

    .item {
      margin-right: 20px;

      span {
        margin-left: 5px;
      }
    }
  }

  .header-section {
    background: linear-gradient(135deg, #965bdf 0%, #5c6bc0 100%);
    color: white;
    padding: 48px;
    border-radius: 20px;

    .header-content {
      display: flex;
      align-items: center;

      .back-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.4);
        color: white;
        margin-right: 16px;

        &:hover {
          background: rgba(255, 255, 255, 0.35);
        }
      }

      gap: 12px;
    }
  }

  .content {
    margin: 0 auto;
    width: 980px;
    padding: 20px;

    .diary-card {
      margin-bottom: 20px;
      background: white;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 8px 24px rgba(185, 184, 184, 0.5);

      .title {
        margin-bottom: 15px;
        font-size: 20px;
        font-weight: 600;
        color: #374151;
      }

      .sub-title {
        margin-top: 20px;
        display: flex;
        align-items: center;

        .category-tag {
          margin-right: 20px;
        }
      }

      .article-title {
        font-size: 28px;
        font-weight: bold;
        color: #111827;
        margin-top: 30px;
        margin-bottom: 10px;
      }

      .summary-content {
        background: rgba(126, 211, 33, 0.1);
        border-left: 4px solid #7ED321;
        padding: 10px 15px;
        border-radius: 0 8px 8px 0;
        position: relative;
      }

      .content-wrapper {
        font-size: 15px;
        color: #374151;
        line-height: 1.6;

        :deep(p) {
          margin-bottom: 10px;
        }

        :deep(h1),
        :deep(h2),
        :deep(h3),
        :deep(h4),
        :deep(h5),
        :deep(h6) {
          margin: 15px 0 10px;
          color: #111827;
          font-weight: 600;
        }

        :deep(h2) {
          font-size: 15px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 5px;
        }

        :deep(h3) {
          font-size: 13px;
        }

        :deep(ul),
        :deep(ol) {
          padding-left: 15px;
          margin-bottom: 10px;
        }

        :deep(li) {
          margin-bottom: 5px;
        }
      }

      .tags-content {
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid #e5e7eb;

        .tags-title {
          margin-bottom: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
      }
    }
  }
}
</style>