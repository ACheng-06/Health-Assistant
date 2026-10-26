<template>
  <div class="emotion-page">
    <FrontendPageHero
      eyebrow="EMOTION DIARY"
      title="情绪日志"
      desc="每天花一分钟，把当下的感受写下来。看得见的情绪，才更容易被安放。"
    >
      <template #aside>
        <div class="today-chip">
          <span class="today-date">{{ todayText }}</span>
          <span class="today-label">今天</span>
        </div>
      </template>
    </FrontendPageHero>

    <section class="page-body">
      <div class="fe-container">
        <el-form ref="formRef" :model="diaryForm" :rules="rules" label-position="top">
          <!-- 情绪评分 -->
          <!-- 以下三张卡片涉及情绪与日记内容，Clarity 回放里强制打码（点击热图不受影响） -->
          <div v-reveal class="diary-card" data-clarity-mask="true">
            <div class="card-head">
              <h2>今日情绪评分</h2>
              <span class="card-hint">1 分很难受 · 10 分很舒展</span>
            </div>
            <el-form-item prop="moodScore">
              <el-rate v-model="diaryForm.moodScore" :max="10" size="large" />
            </el-form-item>
            <p class="score-feedback" :class="{ 'is-empty': !diaryForm.moodScore }">
              {{ scoreFeedback }}
            </p>
          </div>

          <!-- 主要情绪 -->
          <div v-reveal="1" class="diary-card" data-clarity-mask="true">
            <div class="card-head">
              <h2>主要情绪</h2>
              <span class="card-hint">选一个最贴近此刻的</span>
            </div>
            <el-form-item prop="dominantEmotion">
              <div class="emotion-grid">
                <button
                  v-for="emotion in emotionOptions"
                  :key="emotion.name"
                  type="button"
                  class="emotion-item"
                  :class="{ 'is-selected': emotion.name === diaryForm.dominantEmotion }"
                  :aria-pressed="emotion.name === diaryForm.dominantEmotion"
                  @click="selectEmotion(emotion.name)"
                >
                  <el-image class="emotion-icon" :src="emotion.url" fit="contain" />
                  <span class="emotion-name">{{ emotion.name }}</span>
                  <span class="emotion-check" aria-hidden="true">✓</span>
                </button>
              </div>
            </el-form-item>
          </div>

          <!-- 详情记录 -->
          <div v-reveal="2" class="diary-card" data-clarity-mask="true">
            <div class="card-head">
              <h2>详细记录</h2>
              <span class="card-hint">写下来的那一刻，就已经在照顾自己了</span>
            </div>

            <div class="detail-form">
              <el-form-item label="主要情绪触发因素" prop="emotionTriggers">
                <el-input
                  v-model="diaryForm.emotionTriggers"
                  type="textarea"
                  :rows="3"
                  maxlength="1000"
                  show-word-limit
                  placeholder="今天什么事情导致了你的主要情绪？"
                />
              </el-form-item>

              <el-form-item label="今日感想" prop="diaryContent">
                <el-input
                  v-model="diaryForm.diaryContent"
                  type="textarea"
                  :rows="5"
                  maxlength="2000"
                  show-word-limit
                  placeholder="写下您今天的想法、感受，或发生的事…"
                />
              </el-form-item>

              <div class="life-indicators">
                <el-form-item label="睡眠质量" prop="sleepQuality">
                  <el-select v-model="diaryForm.sleepQuality" placeholder="请选择睡眠质量">
                    <el-option label="很差" value="1" />
                    <el-option label="较差" value="2" />
                    <el-option label="一般" value="3" />
                    <el-option label="良好" value="4" />
                    <el-option label="优秀" value="5" />
                  </el-select>
                </el-form-item>
                <el-form-item label="压力水平" prop="stressLevel">
                  <el-select v-model="diaryForm.stressLevel" placeholder="请选择压力水平">
                    <el-option label="很低" value="1" />
                    <el-option label="较低" value="2" />
                    <el-option label="中等" value="3" />
                    <el-option label="较高" value="4" />
                    <el-option label="很高" value="5" />
                  </el-select>
                </el-form-item>
              </div>

              <div class="action-buttons">
                <el-button class="btn-reset" @click="resetForm">重置</el-button>
                <el-button type="primary" :loading="submitting" @click="submit">保存今天的记录</el-button>
              </div>
            </div>
          </div>
        </el-form>
      </div>
    </section>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus/es/components/message/index.mjs'
import { computed, reactive, ref } from 'vue'
import { addEmotionDiaryAPI } from '@/api/emotion'
import FrontendPageHero from '@/components/FrontendPageHero.vue'

// 情绪评分对应的文字描述，索引 0 对应 1 分
const emotionStatus = ['绝望崩溃', '消沉抑郁', '焦虑烦躁', '低落不悦', '平静淡然', '轻松惬意', '愉悦舒心', '欢欣满足', '兴奋欣喜', '极致幸福']

const todayText = dayjs().format('YYYY 年 M 月 D 日')

// 情绪选项
const emotionOptions = [
  { name: '开心', url: new URL('@/assets/images/开心.png', import.meta.url).href },
  { name: '平静', url: new URL('@/assets/images/平静.png', import.meta.url).href },
  { name: '焦虑', url: new URL('@/assets/images/焦虑.png', import.meta.url).href },
  { name: '悲伤', url: new URL('@/assets/images/悲伤.png', import.meta.url).href },
  { name: '兴奋', url: new URL('@/assets/images/兴奋.png', import.meta.url).href },
  { name: '疲惫', url: new URL('@/assets/images/疲惫.png', import.meta.url).href },
  { name: '惊讶', url: new URL('@/assets/images/惊讶.png', import.meta.url).href },
  { name: '困惑', url: new URL('@/assets/images/困惑.png', import.meta.url).href }
]

const formRef = ref(null)
const submitting = ref(false)

const diaryForm = reactive({
  diaryDate: dayjs().format('YYYY-MM-DD'),
  moodScore: null,
  dominantEmotion: '',
  emotionTriggers: '',
  diaryContent: '',
  sleepQuality: null,
  stressLevel: null
})

// 表单校验规则
const rules = {
  moodScore: [{ required: true, message: '请选择情绪评分', trigger: 'change' }],
  dominantEmotion: [{ required: true, message: '请选择主要情绪', trigger: 'change' }],
  sleepQuality: [{ required: true, message: '请选择睡眠质量', trigger: 'change' }],
  stressLevel: [{ required: true, message: '请选择压力水平', trigger: 'change' }]
}

// 打分后立刻回显分值与对应的情绪词
const scoreFeedback = computed(() => {
  const score = diaryForm.moodScore
  if (!score) return '点一下星星，给今天的状态打个分'
  return `${score} 分 · ${emotionStatus[score - 1]}`
})

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(diaryForm, {
    diaryDate: dayjs().format('YYYY-MM-DD'),
    moodScore: null,
    dominantEmotion: '',
    emotionTriggers: '',
    diaryContent: '',
    sleepQuality: null,
    stressLevel: null
  })
}

// 选择主要情绪
const selectEmotion = (emotion) => {
  diaryForm.dominantEmotion = emotion
}

// 提交逻辑
const submit = async () => {
  if (submitting.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    await addEmotionDiaryAPI(diaryForm)
    ElMessage.success('今天的记录已保存')
    resetForm()
  } catch {
    // 错误提示已由请求拦截器统一处理
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.emotion-page {
  background: var(--fe-bg);
}

.today-chip {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 18px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: var(--fe-radius-md);
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(6px);
}

.today-date {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.today-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
}

.page-body {
  padding: clamp(28px, 4vw, 44px) 0 clamp(56px, 7vw, 88px);
}

.diary-card {
  margin-bottom: 20px;
  padding: clamp(20px, 2.6vw, 30px);
  border: 1px solid var(--fe-border);
  border-radius: var(--fe-radius-lg);
  background: var(--fe-surface);
  box-shadow: var(--fe-shadow-sm);

  &:last-child {
    margin-bottom: 0;
  }
}

.card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin-bottom: 18px;

  h2 {
    margin: 0;
    color: var(--fe-text);
    font-size: 19px;
    font-weight: 700;
    letter-spacing: -0.01em;
  }
}

.card-hint {
  color: var(--fe-text-muted);
  font-size: 12.5px;
}

// 评分：星级 + 即时反馈
:deep(.el-rate) {
  --el-rate-icon-margin: 4px;
}

:deep(.el-rate__icon) {
  font-size: 26px;
}

.score-feedback {
  margin: 10px 0 0;
  color: var(--fe-brand-deep);
  font-size: 14px;
  font-weight: 600;

  &.is-empty {
    color: var(--fe-text-muted);
    font-weight: 400;
  }
}

// 情绪九宫格
.emotion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(104px, 1fr));
  gap: 12px;
  width: 100%;
}

.emotion-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 10px 12px;
  border: 1.5px solid var(--fe-border);
  border-radius: var(--fe-radius-md);
  background: var(--fe-surface-2);
  font: inherit;
  cursor: pointer;
  transition:
    transform 0.24s var(--fe-ease-out),
    border-color 0.24s ease,
    background-color 0.24s ease,
    box-shadow 0.24s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: var(--fe-brand);
    box-shadow: var(--fe-shadow-md);
  }

  &.is-selected {
    border-color: var(--fe-brand);
    background: var(--fe-brand-soft);
    transform: translateY(-3px);
    box-shadow: 0 0 0 3px var(--fe-brand-ring);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--fe-brand-ring);
  }
}

.emotion-icon {
  width: 46px;
  height: 46px;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.emotion-name {
  color: var(--fe-text-soft);
  font-size: 14px;
  font-weight: 600;
}

.emotion-check {
  position: absolute;
  top: 8px;
  right: 8px;
  display: grid;
  place-items: center;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: var(--fe-brand);
  color: #fff;
  font-size: 10px;
  line-height: 1;
  opacity: 0;
  transform: scale(0.6);
  transition:
    opacity 0.2s ease,
    transform 0.2s var(--fe-ease-out);
}

.emotion-item.is-selected .emotion-check {
  opacity: 1;
  transform: scale(1);
}

// 详细记录
.detail-form {
  :deep(.el-form-item__label) {
    color: var(--fe-text-soft);
    font-weight: 600;
  }

  :deep(.el-textarea__inner) {
    border-radius: var(--fe-radius-md);
    line-height: 1.75;
  }

  :deep(.el-select__wrapper) {
    border-radius: var(--fe-radius-md);
  }
}

.life-indicators {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 20px;

  :deep(.el-select) {
    width: 100%;
  }
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;

  :deep(.el-button) {
    min-height: 44px;
    padding: 0 22px;
    border-radius: var(--fe-radius-md);
    font-weight: 600;
  }

  /* 按钮间距由 gap 控制，抵消 Element 默认的相邻左边距 */
  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}

@media (max-width: 680px) {
  .life-indicators {
    grid-template-columns: 1fr;
  }

  .emotion-grid {
    grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
    gap: 10px;
  }

  .emotion-icon {
    width: 40px;
    height: 40px;
  }

  .action-buttons {
    flex-direction: column-reverse;

    :deep(.el-button) {
      width: 100%;
      margin-left: 0;
    }
  }
}
</style>
