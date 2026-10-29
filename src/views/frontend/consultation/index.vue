<template>
  <div class="chat-page" :class="{ 'is-collapsed': sidebarCollapsed }">
    <button
      v-if="!sidebarCollapsed"
      type="button"
      class="chat-backdrop"
      aria-label="关闭会话侧栏"
      @click="sidebarCollapsed = true"
    ></button>

    <aside class="chat-sidebar" aria-label="会话与情绪侧栏">
      <div class="sb-brand">
        <div class="sb-brand-lockup">
          <img :src="brandMarkUrl" alt="" />
          <span>心理健康AI助手</span>
        </div>
        <button
          type="button"
          class="icon-button sb-collapse"
          title="收起侧栏"
          aria-label="收起会话侧栏"
          @click="sidebarCollapsed = true"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m14 6-6 6 6 6" />
          </svg>
        </button>
      </div>

      <button type="button" class="sb-new" @click="createNewFrontendSession">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        新对话
      </button>

      <div class="sb-sessions">
        <div class="sb-label">最近对话</div>
        <div
          v-for="session in sessionList"
          :key="session.id"
          class="sb-item-shell"
          :class="{ active: currentSession?.sessionId === `session_${session.id}` }"
        >
          <button
            type="button"
            class="sb-select"
            :title="session.sessionTitle"
            @click="handleSelectSessionClick(session)"
          >
            <span class="sb-title">{{ session.sessionTitle }}</span>
            <span class="sb-meta">{{ session.messageCount || 0 }} 条 · {{ session.startedAt }}</span>
          </button>
          <button
            type="button"
            class="sb-del"
            title="删除会话"
            :aria-label="`删除会话：${session.sessionTitle}`"
            @click.stop="handleDeleteSession(session.id)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
            </svg>
          </button>
        </div>
        <div v-if="!sessionList.length" class="sb-empty">暂无历史对话</div>
      </div>

      <div class="sb-emotion" :class="`is-${emotionLevel}`">
        <div class="emotion-heading">
          <div class="emotion-score" :class="`is-${emotionLevel}`">{{ currentEmotion.emotionScore ?? 50 }}</div>
          <div>
            <strong>情绪指数</strong>
            <span :class="{ concern: currentEmotion.isNegative }">
              {{ currentEmotion.isNegative ? '需要关注' : '状态良好' }}
            </span>
          </div>
        </div>
        <div class="emotion-intensity">
          <span class="intensity-dots" aria-hidden="true">
            <span
              v-for="dot in 3"
              :key="dot"
              class="dot"
              :class="{ active: intensityDots >= dot }"
            ></span>
          </span>
          <span>{{ getRiskText(currentEmotion.riskLevel) }}</span>
        </div>
        <p v-if="currentEmotion.suggestion" class="emotion-suggestion">
          {{ currentEmotion.suggestion }}
        </p>
        <ul v-if="currentEmotion.improvementSuggestions?.length" class="emotion-actions">
          <li
            v-for="action in currentEmotion.improvementSuggestions.slice(0, 2)"
            :key="action"
          >
            {{ action }}
          </li>
        </ul>
        <div v-if="currentEmotion.riskLevel > 1" class="risk-notice">
          <strong>温馨提示</strong>
          <span>{{ currentEmotion.riskDescription }}</span>
        </div>
      </div>
    </aside>

    <main class="chat-main">
      <div class="chat-ambient" aria-hidden="true"></div>

      <header class="chat-topbar">
        <div class="tb-left">
          <button
            v-if="sidebarCollapsed"
            type="button"
            class="icon-button tb-menu"
            title="展开侧栏"
            aria-label="展开会话侧栏"
            @click="sidebarCollapsed = false"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <span class="tb-title">{{ currentSession?.sessionTitle || '新对话' }}</span>
        <div class="tb-right">
          <button type="button" class="tb-new" @click="createNewFrontendSession">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>新对话</span>
          </button>
        </div>
      </header>

      <div ref="chatMessagesRef" class="chat-messages" @scroll.passive="handleScroll">
        <div ref="chatStreamRef" class="chat-stream">
          <section v-if="messages.length === 0" class="chat-welcome" aria-label="欢迎使用心理健康AI助手">
            <div class="welcome-avatar">
              <img :src="iconUrl1" alt="" />
            </div>
            <h1>你好，我是心理健康AI助手</h1>
            <p class="typewriter-line">
              <span aria-hidden="true">{{ typewriterText }}</span>
              <span class="typewriter-caret" aria-hidden="true"></span>
              <span class="sr-only">{{ subtitleSentences[0] }}</span>
            </p>
            <div class="prompt-chips" aria-label="对话建议">
              <button
                v-for="suggestion in promptSuggestions"
                :key="suggestion"
                type="button"
                @click="fillSuggestion(suggestion)"
              >
                {{ suggestion }}
              </button>
            </div>
          </section>

          <div
            v-for="msg in messages"
            :key="msg.id"
            class="msg-row"
            :class="msg.senderType === 1 ? 'row-user' : 'row-ai'"
          >
            <div class="msg-avatar">
              <img
                :src="msg.senderType === 1 ? iconUrl2 : iconUrl1"
                :alt="msg.senderType === 1 ? '用户头像' : '心理健康AI助手头像'"
              />
            </div>
            <div class="message-cluster">
              <!-- 对话内容属敏感信息，Clarity 回放里强制打码（点击热图不受影响） -->
              <div
                class="message-bubble"
                :class="{ 'error-bubble': msg.isError }"
                data-clarity-mask="true"
              >
                <div
                  v-if="msg.senderType === 2 && isAiTyping && !msg.content"
                  class="typing-indicator"
                  aria-label="正在输入"
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div v-else-if="msg.isError" class="error-message">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v6M12 17h.01" />
                  </svg>
                  <p>{{ msg.content }}</p>
                </div>
                <MarkdownRenderer
                  v-else-if="msg.senderType === 2 && !msg.isError"
                  :content="msg.content"
                  :is-ai-message="true"
                />
                <p v-else-if="msg.content" class="plain-text">{{ msg.content }}</p>
              </div>
              <div
                v-if="msg.stopped || msg.error"
                class="stream-status"
                :class="{ 'is-error': msg.error }"
              >
                <span>{{ msg.error || '已停止生成' }}</span>
                <button
                  v-if="msg.error && msg.retryWith"
                  type="button"
                  class="retry-btn"
                  @click="retryMessage(msg)"
                >
                  重新生成
                </button>
              </div>
              <time class="message-time">
                {{ msg.senderType === 2 && isAiTyping ? '正在输入中...' : formatMessageTime(msg.createdAt) }}
              </time>
            </div>
          </div>
        </div>

        <button
          v-if="showJumpToLatest"
          type="button"
          class="jump-latest"
          @click="scrollToBottom({ force: true })"
        >
          回到最新
        </button>
      </div>

      <div class="chat-input-area">
        <div class="input-card" data-clarity-mask="true">
          <el-input
            ref="inputRef"
            v-model="userMessage"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 6 }"
            resize="none"
            maxlength="500"
            placeholder="写下此刻的感受，我会认真听你说..."
            aria-label="输入对话内容"
            @keydown="handleKeyDown"
          />
          <button
            type="button"
            class="send-btn"
            :class="{ active: !isAiTyping && canSubmit, 'is-stop': isAiTyping }"
            :disabled="isAiTyping ? false : !canSubmit"
            :aria-label="isAiTyping ? '停止生成' : '发送消息'"
            @click="isAiTyping ? stopGeneration() : sendMessage()"
          >
            <svg v-if="!isAiTyping" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 19V5M6 11l6-6 6 6" />
            </svg>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true">
              <rect x="8" y="8" width="8" height="8" rx="1.5" />
            </svg>
          </button>
        </div>
        <div class="input-hint">
          <span>Enter 发送 · Shift+Enter 换行</span>
          <span :class="{ warn: userMessage.length > 450 }">{{ userMessage.length }}/500</span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus/es/components/message/index.mjs'
import { ElMessageBox } from 'element-plus/es/components/message-box/index.mjs'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import MarkdownRenderer from './MarkdownRenderer.vue'
import {
  startSessionAPI,
  getSessionPageAPI,
  getSessionMessagesAPI,
  getSessionEmotionAPI,
  deleteSessionAPI
} from '@/api/chat'
import { apiBaseUrl } from '@/config'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

const iconUrl1 = new URL('@/assets/images/robot-fill.png', import.meta.url).href
const iconUrl2 = new URL('@/assets/images/users.png', import.meta.url).href
// 侧栏品牌区在白底上，用带颜色的品牌图标；白色描边图标会与背景重合
const brandMarkUrl = new URL('@/assets/images/机器人.png', import.meta.url).href

const currentSession = ref(null)
const sessionList = ref([])
const messages = ref([])
const userMessage = ref('')
const isAiTyping = ref(false)
const chatMessagesRef = ref(null)
const inputRef = ref(null)
const sidebarCollapsed = ref(window.matchMedia('(max-width: 900px)').matches)

// 只判断“内容能不能发”，不再掺生成态：
// 生成中输入框仍可编辑，按钮由模板切换成停止
const canSubmit = computed(
  () => userMessage.value.trim().length > 0 && userMessage.value.length <= 500
)

// 一次多拉一些再本地筛选，避免只取前 10 条时自己的会话被别人的记录挤掉
const SESSION_FETCH_SIZE = 50
const SESSION_LIST_LIMIT = 20

const currentUserIds = computed(() => {
  const info = authStore.userInfo || {}
  return [info.id, info.userId]
    .filter((id) => id !== null && id !== undefined && id !== '')
    .map((id) => String(id))
})

const currentUserNames = computed(() => {
  const info = authStore.userInfo || {}
  return [info.nickname, info.username, info.userNickname]
    .filter(Boolean)
    .map((name) => String(name))
})

// 能确认当前账号身份时，才允许对会话列表做归属校验
const canVerifyOwnership = computed(
  () => currentUserIds.value.length > 0 || currentUserNames.value.length > 0
)

const getSessionOwnerId = (session) => {
  const owner = session?.userId ?? session?.user?.id ?? session?.user?.userId
  return owner === null || owner === undefined || owner === '' ? '' : String(owner)
}

const hasOwnerInfo = (session) =>
  Boolean(
    getSessionOwnerId(session) ||
      session?.userNickname ||
      session?.nickname ||
      session?.username
  )

// 会话可能带着用户 ID，也可能只带昵称，两种都能比对
const isOwnSession = (session) => {
  const ownerId = getSessionOwnerId(session)
  if (ownerId) return currentUserIds.value.includes(ownerId)

  const ownerName = session?.userNickname ?? session?.nickname ?? session?.username
  if (ownerName) return currentUserNames.value.includes(String(ownerName))

  // 既无用户 ID 也无昵称，无法判定归属时不展示，避免泄露他人对话
  return false
}

const subtitleSentences = Object.freeze([
  '今天想从哪里说起？我会认真倾听。',
  '不必急着整理好情绪，我们可以慢慢来。',
  '无论此刻心情如何，这里都有一处安静的空间。',
  '你可以说说最近的困扰，也可以只聊聊今天。',
  '每一次表达，都是照顾自己的开始。'
])
const promptSuggestions = Object.freeze([
  '压力有点大',
  '睡不好，能聊聊吗',
  '我最近很焦虑',
  '只是想找个人说说话'
])

const typewriterText = ref('')
let typewriterTimer = null
let typewriterSentenceIndex = 0
let typewriterCharacterIndex = 0
let typewriterDeleting = false

const stopTypewriter = () => {
  if (typewriterTimer) {
    clearTimeout(typewriterTimer)
    typewriterTimer = null
  }
}

const scheduleTypewriter = (delay) => {
  typewriterTimer = setTimeout(typewriterStep, delay)
}

const typewriterStep = () => {
  typewriterTimer = null
  if (messages.value.length > 0) return

  const sentence = subtitleSentences[typewriterSentenceIndex]
  if (!typewriterDeleting) {
    typewriterCharacterIndex += 1
    typewriterText.value = sentence.slice(0, typewriterCharacterIndex)
    if (typewriterCharacterIndex >= sentence.length) {
      typewriterDeleting = true
      scheduleTypewriter(2400)
    } else {
      scheduleTypewriter(72)
    }
    return
  }

  typewriterCharacterIndex -= 1
  typewriterText.value = sentence.slice(0, typewriterCharacterIndex)
  if (typewriterCharacterIndex <= 0) {
    typewriterDeleting = false
    typewriterSentenceIndex = (typewriterSentenceIndex + 1) % subtitleSentences.length
    scheduleTypewriter(320)
  } else {
    scheduleTypewriter(38)
  }
}

const startTypewriter = () => {
  stopTypewriter()
  if (messages.value.length > 0) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    typewriterText.value = subtitleSentences[0]
    return
  }

  typewriterSentenceIndex = 0
  typewriterCharacterIndex = 0
  typewriterDeleting = false
  typewriterText.value = ''
  scheduleTypewriter(220)
}

const currentEmotion = ref({
  primaryEmotion: '中性',
  emotionScore: 50,
  isNegative: false,
  riskLevel: 0,
  suggestion: '情绪状态平稳',
  improvementSuggestions: []
})

let activeStreamController = null
// 当前正在生成的 AI 消息 id：停止、重试都要靠它定位气泡
let activeMessageId = null

// 流式内容逐片更新会引发频繁布局，按 80ms 合并刷新。
const STREAM_FLUSH_INTERVAL = 80
let streamBuffer = ''
let streamFlushTimer = null

const flushStreamBuffer = (messageId) => {
  if (streamFlushTimer) {
    clearTimeout(streamFlushTimer)
    streamFlushTimer = null
  }
  if (!streamBuffer) return
  const targetMsg = messages.value.find((message) => message.id === messageId)
  const pending = streamBuffer
  streamBuffer = ''
  if (!targetMsg) return
  targetMsg.content += pending
  scrollToBottom()
}

const discardStreamBuffer = () => {
  streamBuffer = ''
  if (streamFlushTimer) {
    clearTimeout(streamFlushTimer)
    streamFlushTimer = null
  }
}

// 旧流继续写入会污染新会话，因此切换会话前统一中止并清空缓冲。
const stopActiveStream = () => {
  if (activeStreamController) {
    activeStreamController.abort()
    activeStreamController = null
  }
  discardStreamBuffer()
  activeMessageId = null
  isAiTyping.value = false
}

// 用户主动停止：先保住缓冲里最后一片，再中断连接。
// 顺序不能反——abort 之后 onerror 走 AbortError 分支，内容不再追加。
// 注意：这里只中断前端接收，后端可能仍在生成；再次进入会话以服务端历史为准。
const stopGeneration = () => {
  if (!isAiTyping.value) return

  const messageId = activeMessageId
  if (messageId) flushStreamBuffer(messageId)

  activeStreamController?.abort()
  activeStreamController = null
  activeMessageId = null

  const target = messages.value.find((message) => message.id === messageId)
  if (target) target.stopped = true

  isAiTyping.value = false
  if (currentSession.value?.sessionId) {
    loadSessionEmotion(currentSession.value.sessionId)
  }
}

// 情绪指数是「状态分」，越高越好：低分告急，高分平稳
// 风险等级更高时向上取更严重的档位（先判严重档，避免被高档兜底拉回浅色）
const emotionLevel = computed(() => {
  const score = Number(currentEmotion.value?.emotionScore ?? 50)
  const risk = Number(currentEmotion.value?.riskLevel ?? 0)
  if (score < 30 || risk >= 3) return 'crisis'
  if (score < 50 || risk >= 2) return 'warn'
  if (score < 70 || risk >= 1) return 'watch'
  return 'good'
})

// 小圆点表示需要关注的程度，亮得越多越严重
const intensityDots = computed(() => {
  switch (emotionLevel.value) {
    case 'crisis': return 3
    case 'warn': return 3
    case 'watch': return 2
    default: return 1
  }
})

const getRiskText = (level) => {
  switch (level) {
    case 0: return '正常'
    case 1: return '关注'
    case 2: return '预警'
    case 3: return '危机'
    default: return '正常'
  }
}

const formatMessageTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const loadSessionEmotion = async (sessionId) => {
  const id = sessionId.toString().startsWith('session_') ? sessionId : `session_${sessionId}`
  try {
    const res = await getSessionEmotionAPI(id)
    currentEmotion.value = res
  } catch (err) {
    console.error('获取情绪数据失败', err)
  }
}

const getSessionPage = async () => {
  try {
    // 优先让后端按 userId 过滤；后端若忽略该参数，下面还有一层本地归属校验兜底
    const userId = currentUserIds.value.find((id) => /^\d+$/.test(id)) || ''
    const res = await getSessionPageAPI({
      currentPage: 1,
      size: SESSION_FETCH_SIZE,
      ...(userId ? { userId } : {})
    })

    const records = Array.isArray(res?.records) ? res.records : []
    const ownRecords = canVerifyOwnership.value ? records.filter(isOwnSession) : records

    if (!canVerifyOwnership.value) {
      console.warn('未获取到当前用户身份信息，会话列表无法校验归属')
    } else if (records.length > 0 && !records.some(hasOwnerInfo)) {
      console.warn('会话数据未返回用户归属字段，已按无权查看处理')
    }

    sessionList.value = ownRecords.slice(0, SESSION_LIST_LIMIT)
  } catch (error) {
    console.error('获取会话列表失败:', error)
  }
}

const closeSidebarOnMobile = () => {
  if (window.matchMedia('(max-width: 900px)').matches) {
    sidebarCollapsed.value = true
  }
}

const handleDeleteSession = async (sessionId) => {
  try {
    await ElMessageBox.confirm('确认删除该会话吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }

  try {
    await deleteSessionAPI(sessionId)
    ElMessage.success('会话删除成功')
    getSessionPage()
    if (currentSession.value && currentSession.value.sessionId === `session_${sessionId}`) {
      createNewFrontendSession()
    }
  } catch (err) {
    console.error('删除会话失败:', err)
  }
}

const handleKeyDown = (event) => {
  if (event.isComposing) return
  if (event.key !== 'Enter' || event.shiftKey) return
  event.preventDefault()
  // 生成中不发送、也不弹提示：用户可以把下一句先写完
  if (isAiTyping.value) return
  sendMessage()
}

// 距底 80px 内视为“贴底”：只有贴底时才自动跟随新内容
const NEAR_BOTTOM_THRESHOLD = 80
const isNearBottom = ref(true)
const showJumpToLatest = ref(false)
const chatStreamRef = ref(null)

let scrollRafId = null
const scrollToBottom = ({ force = false } = {}) => {
  if (!force && !isNearBottom.value) return
  if (scrollRafId) return
  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = null
    const el = chatMessagesRef.value
    if (!el) return
    el.scrollTop = el.scrollHeight
    isNearBottom.value = true
    showJumpToLatest.value = false
  })
}

const updateNearBottom = () => {
  const el = chatMessagesRef.value
  if (!el) return
  // 内容不足一屏时本来就没得滚，必须视为贴底，否则永远不跟随
  // （.chat-stream 用了 justify-content: flex-end，scrollHeight 会等于 clientHeight）
  const atBottom =
    el.scrollHeight <= el.clientHeight + 1 ||
    el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM_THRESHOLD
  isNearBottom.value = atBottom
  if (atBottom) showJumpToLatest.value = false
}

let scrollRafPending = false
const handleScroll = () => {
  if (scrollRafPending) return
  scrollRafPending = true
  // 先同步算一次：scroll 事件早于 ResizeObserver，晚一步更新会让“上滑”被自动跟随抢回去
  updateNearBottom()
  requestAnimationFrame(() => {
    scrollRafPending = false
    updateNearBottom()
  })
}

// 流式增量是“内容变高”，不是“消息条数变化”：watch(messages.length) 覆盖不到，
// 必须观察 .chat-stream 的尺寸变化
let streamResizeObserver = null
const setupStreamObserver = () => {
  const streamEl = chatStreamRef.value
  if (!streamEl || !('ResizeObserver' in window)) return

  streamResizeObserver = new ResizeObserver(() => {
    if (isNearBottom.value) {
      scrollToBottom({ force: true })
    } else if (isAiTyping.value) {
      // 用户正在往上翻，只在生成时提示；加载历史不打扰
      showJumpToLatest.value = true
    }
  })
  streamResizeObserver.observe(streamEl)
}

const createNewFrontendSession = () => {
  stopActiveStream()
  // 新建会话后从底部重新开始，不能沿用上一条会话的滚动状态
  isNearBottom.value = true
  showJumpToLatest.value = false
  currentSession.value = {
    sessionId: `temp_${Date.now()}`,
    status: 'TEMP',
    sessionTitle: '新对话'
  }
  messages.value = []
  currentEmotion.value = {
    primaryEmotion: '中性',
    emotionScore: 50,
    isNegative: false,
    riskLevel: 0,
    suggestion: '让我们开始一段新的对话吧',
    improvementSuggestions: []
  }
  closeSidebarOnMobile()
}

const handleSelectSessionClick = async (session) => {
  stopActiveStream()
  isNearBottom.value = true
  showJumpToLatest.value = false
  try {
    const res = await getSessionMessagesAPI(session.id)
    messages.value = res || []
    loadSessionEmotion(session.id)
  } catch (err) {
    console.error('加载会话记录失败', err)
  }

  currentSession.value = {
    sessionId: `session_${session.id}`,
    status: 'ACTIVE',
    sessionTitle: session.sessionTitle
  }
  closeSidebarOnMobile()
}

const sendMessage = () => {
  if (!userMessage.value.trim()) return
  if (userMessage.value.length > 500) {
    ElMessage.error('消息不能超过 500 字')
    return
  }
  if (isAiTyping.value) {
    ElMessage.error('心理健康AI助手正在输入中，请稍后再试...')
    return
  }

  const msg = userMessage.value.trim()
  userMessage.value = ''

  if (!currentSession.value || currentSession.value.status === 'TEMP') {
    startNewSession(msg)
  } else {
    messages.value.push({
      id: Date.now(),
      senderType: 1,
      content: msg,
      createdAt: new Date().toISOString()
    })
    scrollToBottom({ force: true })
    startAiResponse(currentSession.value.sessionId, msg)
  }
}

const startNewSession = async (msg) => {
  try {
    const sessionParams = { initialMessage: msg }

    if (currentSession.value && currentSession.value.sessionTitle === '新对话') {
      sessionParams.sessionTitle = `心理健康AI助手 - ${new Date().toLocaleDateString()}`
    } else if (currentSession.value) {
      sessionParams.sessionTitle = currentSession.value.sessionTitle
    }

    const res = await startSessionAPI(sessionParams)
    currentSession.value = {
      sessionId: res.sessionId,
      status: res.status,
      sessionTitle: sessionParams.sessionTitle
    }

    getSessionPage()
    messages.value.push({
      id: Date.now(),
      senderType: 1,
      content: msg,
      createdAt: new Date().toISOString()
    })
    scrollToBottom({ force: true })
    startAiResponse(currentSession.value.sessionId, msg)
  } catch (err) {
    console.error('创建会话失败:', err)
    if (!userMessage.value) {
      userMessage.value = msg
    }
  }
}

const startAiResponse = async (sessionId, msg, reuseMessage = null) => {
  if (isAiTyping.value) {
    ElMessage.error('心理健康AI助手正在输入中，请稍后再试...')
    return
  }
  isAiTyping.value = true

  // 重试时复用原气泡：不新增消息，避免列表里出现两条重复回复
  const messageId = reuseMessage
    ? reuseMessage.id
    : `ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  activeMessageId = messageId

  if (!reuseMessage) {
    messages.value.push({
      id: messageId,
      senderType: 2,
      content: '',
      createdAt: new Date().toISOString(),
      isError: false,
      error: '',
      stopped: false,
      retryWith: { sessionId, userMessage: msg }
    })
  }
  scrollToBottom({ force: true })

  const ctrl = new AbortController()
  activeStreamController = ctrl

  fetchEventSource(`${apiBaseUrl}/psychological-chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Token': localStorage.getItem('token'),
      'Accept': 'text/event-stream'
    },
    body: JSON.stringify({
      sessionId,
      userMessage: msg
    }),
    signal: ctrl.signal,
    onopen: (response) => {
      if (response.status === 401 || response.status === 403) {
        discardStreamBuffer()
        handleUnauthorized(messageId)
        ctrl.abort()
        return
      }
      const contentType = response.headers.get('Content-Type') || ''
      if (!response.ok || !contentType.includes('text/event-stream')) {
        discardStreamBuffer()
        handleError('服务器响应异常，请稍后重试', messageId)
        ctrl.abort()
      }
    },
    onmessage: (event) => {
      const res = event.data.trim()
      if (!res) return

      if (event.event === 'done') {
        flushStreamBuffer(messageId)
        if (activeStreamController === ctrl) {
          isAiTyping.value = false
        }
        ctrl.abort()
        loadSessionEmotion(sessionId)
        return
      }

      try {
        const payload = JSON.parse(res)
        const ok = String(payload.code) === '200'
        if (ok && payload.data && payload.data.content) {
          streamBuffer += payload.data.content
          if (!streamFlushTimer) {
            streamFlushTimer = setTimeout(() => flushStreamBuffer(messageId), STREAM_FLUSH_INTERVAL)
          }
        } else {
          discardStreamBuffer()
          handleError(payload.message || 'AI回复失败', messageId)
        }
      } catch (error) {
        console.error('解析流式数据异常:', error)
      }
    },
    onerror: (err) => {
      if (err?.name === 'AbortError') return
      console.error('SSE 连接异常:', err)
      discardStreamBuffer()
      handleError('网络连接中断或AI回复失败', messageId)
      ctrl.abort()
      throw err
    },
    onclose: () => {
      flushStreamBuffer(messageId)
      if (activeStreamController === ctrl) {
        isAiTyping.value = false
      }
    }
  }).catch(() => {
    // 中止与错误已由统一回调处理，这里只消费 Promise rejection。
  }).finally(() => {
    flushStreamBuffer(messageId)
    if (activeStreamController === ctrl) {
      activeStreamController = null
      isAiTyping.value = false
    }
    if (activeMessageId === messageId) activeMessageId = null
  })
}

const handleUnauthorized = (messageId = null) => {
  discardStreamBuffer()
  authStore.logout()
  activeMessageId = null
  const target = messageId ? messages.value.find((message) => message.id === messageId) : null
  if (target) {
    target.content = '登录已过期，请重新登录'
    target.isError = true
  }
  isAiTyping.value = false
  ElMessage.error('登录已过期，请重新登录')
  router.push('/auth/login')
}

const handleError = (errorMsg, messageId = null) => {
  // 先落盘再丢弃：已收到的增量必须写进气泡，不能因为报错把正文冲掉
  const targetId = messageId || activeMessageId
  if (targetId) flushStreamBuffer(targetId)
  discardStreamBuffer()

  const target = targetId
    ? messages.value.find((message) => message.id === targetId)
    : messages.value[messages.value.length - 1]

  if (target && target.senderType === 2) {
    if (target.content) {
      // 有正文：只附加一条错误状态，正文继续正常渲染
      target.error = errorMsg || '生成中断，请重试'
    } else {
      // 一个字都没收到：退回原来的错误气泡
      target.content = errorMsg
      target.isError = true
    }
  }
  isAiTyping.value = false
  ElMessage.error(errorMsg || '心理健康AI助手回复失败，请稍后再试...')
}

// 重试复用原气泡：msg 来自 v-for，已经是响应式代理，这里直接改能正常触发更新
const retryMessage = (msg) => {
  if (!msg?.retryWith || isAiTyping.value) return
  const { sessionId, userMessage: retryText } = msg.retryWith

  msg.content = ''
  msg.error = ''
  msg.stopped = false
  msg.isError = false

  startAiResponse(sessionId, retryText, msg)
}

const fillSuggestion = async (suggestion) => {
  userMessage.value = suggestion
  await nextTick()
  inputRef.value?.focus()
}

watch(
  () => messages.value.length,
  (length) => {
    if (length === 0) {
      startTypewriter()
    } else {
      stopTypewriter()
    }
  }
)

onBeforeUnmount(() => {
  stopTypewriter()
  discardStreamBuffer()
  streamResizeObserver?.disconnect()
  streamResizeObserver = null
  if (scrollRafId) {
    cancelAnimationFrame(scrollRafId)
    scrollRafId = null
  }
  if (activeStreamController) {
    activeStreamController.abort()
    activeStreamController = null
  }
  activeMessageId = null
  isAiTyping.value = false
  document.body.classList.remove('fe-noscroll')
})

onMounted(() => {
  document.body.classList.add('fe-noscroll')
  createNewFrontendSession()
  getSessionPage()
  startTypewriter()
  setupStreamObserver()
})
</script>

<style scoped lang="scss">
.chat-page {
  position: relative;
  height: calc(100vh - var(--fe-nav-h));
  height: calc(100dvh - var(--fe-nav-h));
  display: flex;
  overflow: hidden;
  background: var(--fe-bg);
  color: var(--fe-text);
}

/* 项目未设置全局 border-box，此页里 width/height 为 100% 的元素会被 padding、border 撑出容器 */
.chat-page,
.chat-page * {
  box-sizing: border-box;
}

.chat-sidebar {
  position: relative;
  z-index: 20;
  width: 272px;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex-shrink: 0;
  padding: 18px 14px;
  /* 项目没有全局 border-box，不声明会让 height:100% 额外多出 padding，底部情绪卡片被裁掉 */
  box-sizing: border-box;
  /* 屏高不够时侧栏整体可滚，避免底部情绪指数被裁掉 */
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--fe-border-strong) transparent;
  border-right: 1px solid var(--fe-border);
  background: var(--fe-surface);
  opacity: 1;
  transition:
    width 0.3s var(--fe-ease-out),
    opacity 0.3s ease,
    border-color 0.3s ease;
}

.chat-page.is-collapsed .chat-sidebar {
  width: 0;
  border-right-color: transparent;
  opacity: 0;
  pointer-events: none;
}

.sb-brand {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.sb-brand-lockup {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--fe-text);
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;

  img {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    border-radius: 11px;
    object-fit: contain;
  }
}

.icon-button {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border: 0;
  border-radius: var(--fe-radius-sm);
  background: transparent;
  color: var(--fe-text-muted);
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.9;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &:hover {
    background: var(--fe-surface-2);
    color: var(--fe-text);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--fe-brand-ring);
  }
}

.sb-new {
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-shrink: 0;
  border: 1.5px solid var(--fe-brand);
  border-radius: var(--fe-radius-sm);
  background: var(--fe-brand-soft);
  color: var(--fe-brand-deep);
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }

  &:hover {
    background: var(--fe-brand);
    color: var(--fe-surface);
    box-shadow: var(--fe-shadow-brand);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--fe-brand-ring);
  }
}

.sb-sessions {
  min-height: 88px;
  flex: 1 1 auto;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--fe-border-strong) transparent;
}

.sb-label {
  padding: 4px 8px 10px;
  color: var(--fe-text-faint);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.sb-item-shell {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  border-radius: var(--fe-radius-sm);
  transition: background-color 0.2s ease;

  &::before {
    content: '';
    position: absolute;
    top: 10px;
    bottom: 10px;
    left: 0;
    width: 3px;
    border-radius: var(--fe-radius-pill);
    background: var(--fe-brand);
    opacity: 0;
  }

  &:hover {
    background: var(--fe-surface-2);
  }

  &.active {
    background: var(--fe-brand-soft);

    &::before {
      opacity: 1;
    }

    .sb-title {
      color: var(--fe-brand-deep);
    }
  }
}

.sb-select {
  min-width: 0;
  min-height: 58px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 5px;
  padding: 10px 38px 10px 12px;
  border: 0;
  border-radius: inherit;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--fe-brand);
  }
}

.sb-title {
  width: 100%;
  overflow: hidden;
  color: var(--fe-text-soft);
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sb-meta {
  width: 100%;
  overflow: hidden;
  color: var(--fe-text-faint);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sb-del {
  position: absolute;
  top: 50%;
  right: 7px;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--fe-danger);
  opacity: 0;
  cursor: pointer;
  transform: translateY(-50%);
  transition:
    opacity 0.2s ease,
    background-color 0.2s ease;

  svg {
    width: 15px;
    height: 15px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &:hover {
    background: var(--fe-danger-soft);
  }

  &:focus-visible {
    opacity: 1;
    outline: none;
    box-shadow: 0 0 0 3px var(--fe-danger-ring);
  }
}

.sb-item-shell:hover .sb-del,
.sb-item-shell:focus-within .sb-del {
  opacity: 1;
}

.sb-empty {
  padding: 28px 12px;
  color: var(--fe-text-faint);
  font-size: 12px;
  text-align: center;
}

.sb-emotion {
  flex: 0 0 auto;
  padding: 14px;
  border: 1px solid var(--fe-border);
  border-radius: var(--fe-radius-md);
  background: var(--fe-surface-2);
}

/* 短屏（笔记本 / 分屏）下收缩间距，让情绪指数整块完整可见 */
@media (max-height: 780px) {
  .chat-sidebar {
    gap: 10px;
    padding: 12px 12px 14px;
  }

  .sb-brand {
    min-height: 40px;
  }

  .sb-new {
    min-height: 40px;
  }

  .sb-select {
    min-height: 52px;
  }

  .sb-emotion {
    padding: 12px;
  }

  .emotion-intensity {
    margin-top: 9px;
  }
}

.emotion-heading {
  display: flex;
  align-items: center;
  gap: 10px;

  strong,
  span {
    display: block;
  }

  strong {
    margin-bottom: 3px;
    color: var(--fe-text);
    font-size: 13px;
  }

  span {
    color: var(--fe-brand-deep);
    font-size: 11px;
    font-weight: 600;
  }

  span.concern {
    color: var(--fe-danger);
  }
}

.emotion-score {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 13px;
  background: var(--fe-grad-brand);
  box-shadow: var(--fe-shadow-brand);
  color: var(--fe-surface);
  font-size: 16px;
  font-weight: 800;
  transition:
    background-color 0.35s ease,
    box-shadow 0.35s ease;

  /* 底色跟随情绪状态变化：分数低告急、分数高平稳 */
  &.is-good {
    background-image: var(--fe-grad-good);
    box-shadow: var(--fe-shadow-good);
  }

  &.is-watch {
    background-image: var(--fe-grad-accent);
    box-shadow: 0 6px 16px rgba(92, 107, 192, 0.3);
  }

  &.is-warn {
    background-image: var(--fe-grad-warn);
    box-shadow: var(--fe-shadow-warn);
  }

  &.is-crisis {
    background-image: var(--fe-grad-crisis);
    box-shadow: var(--fe-shadow-crisis);
  }
}

.emotion-intensity {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  color: var(--fe-text-muted);
  font-size: 11px;
}

.intensity-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--fe-border-strong);
  transition: background-color 0.35s ease;

  &.active {
    background: var(--fe-brand);
  }
}

/* 强度小圆点跟徽标同色，避免一红一绿 */
.sb-emotion.is-good .dot.active {
  background: var(--fe-success-deep);
}

.sb-emotion.is-watch .dot.active {
  background: var(--fe-accent-deep);
}

.sb-emotion.is-warn .dot.active {
  background: var(--fe-warn-deep);
}

.sb-emotion.is-crisis .dot.active {
  background: var(--fe-danger-deep);
}

.emotion-suggestion {
  margin: 11px 0 0;
  color: var(--fe-text-muted);
  font-size: 11px;
  line-height: 1.6;
}

.emotion-actions {
  display: grid;
  gap: 6px;
  margin-top: 10px;

  li {
    position: relative;
    padding-left: 11px;
    color: var(--fe-text-soft);
    font-size: 11px;
    line-height: 1.5;

    &::before {
      content: '';
      position: absolute;
      top: 6px;
      left: 0;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--fe-brand);
    }
  }
}

.risk-notice {
  display: grid;
  gap: 3px;
  margin-top: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  background: var(--fe-danger-soft);
  color: var(--fe-danger);
  font-size: 10px;
  line-height: 1.5;

  strong {
    font-size: 11px;
  }
}

.chat-main {
  position: relative;
  min-width: 0;
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-ambient {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(circle at 16% 22%, rgba(46, 191, 145, 0.07), transparent 32%),
    radial-gradient(circle at 86% 36%, rgba(129, 146, 242, 0.08), transparent 36%),
    radial-gradient(circle at 68% 88%, rgba(46, 191, 145, 0.055), transparent 32%);
  animation: ambient-drift 16s ease-in-out infinite alternate;
}

.chat-topbar {
  position: relative;
  z-index: 1;
  min-height: 56px;
  display: grid;
  grid-template-columns: 1fr minmax(0, auto) 1fr;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  padding: 0 18px;
  border-bottom: 1px solid var(--fe-border);
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(14px);
}

.tb-left,
.tb-right {
  min-width: 0;
  display: flex;
  align-items: center;
}

.tb-right {
  justify-content: flex-end;
}

.tb-title {
  max-width: min(46vw, 480px);
  overflow: hidden;
  color: var(--fe-text);
  font-size: 14px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tb-new {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 13px;
  border: 1px solid var(--fe-border);
  border-radius: var(--fe-radius-pill);
  background: var(--fe-surface);
  color: var(--fe-text-soft);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  svg {
    width: 15px;
    height: 15px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }

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

.chat-messages {
  position: relative;
  z-index: 1;
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 24px clamp(16px, 4vw, 32px);
  scrollbar-width: thin;
  scrollbar-color: var(--fe-border-strong) transparent;
}

/* 用户上翻阅读时贴在可视区底部，不跟着内容滚走（sticky 而非 absolute） */
.jump-latest {
  position: sticky;
  bottom: 8px;
  z-index: 3;
  display: flex;
  align-items: center;
  width: fit-content;
  min-height: 36px;
  margin: 12px auto 0;
  padding: 0 16px;
  border: 1px solid var(--fe-border);
  border-radius: var(--fe-radius-pill);
  background: var(--fe-surface);
  box-shadow: var(--fe-shadow-md);
  color: var(--fe-text-soft);
  font: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    border-color: var(--fe-brand);
    color: var(--fe-brand-deep);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--fe-brand-ring);
  }
}

.chat-stream {
  width: 100%;
  max-width: 820px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 20px;
  margin: 0 auto;
}

.chat-welcome {
  margin: auto;
  padding: 34px 0 18px;
  text-align: center;
}

.welcome-avatar {
  width: 80px;
  height: 80px;
  display: grid;
  place-items: center;
  margin: 0 auto 22px;
  border-radius: 26px;
  /* 素材是白色描边图标，必须垫一层品牌色才看得见 */
  background: var(--fe-grad-brand);
  box-shadow: var(--fe-shadow-brand);

  img {
    width: 58px;
    height: 58px;
    object-fit: contain;
  }
}

.chat-welcome h1 {
  margin: 0;
  color: var(--fe-text);
  font-size: clamp(1.4rem, 3vw, 1.9rem);
  font-weight: 800;
  letter-spacing: -0.03em;
}

.typewriter-line {
  min-height: 1.6em;
  margin: 12px auto 0;
  color: var(--fe-text-muted);
  font-size: 14px;
  line-height: 1.6;
}

.typewriter-caret {
  display: inline-block;
  width: 1px;
  height: 1.15em;
  margin-left: 2px;
  vertical-align: -0.17em;
  background: var(--fe-brand);
  animation: caret-blink 0.8s steps(1) infinite;
}

.prompt-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 28px;
}

.prompt-chips button {
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid var(--fe-border);
  border-radius: var(--fe-radius-pill);
  background: rgba(255, 255, 255, 0.82);
  color: var(--fe-text-soft);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    color: var(--fe-brand-deep);
    border-color: var(--fe-brand);
    background: var(--fe-brand-soft);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--fe-brand-ring);
  }
}

.msg-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  animation: msg-in 0.35s var(--fe-ease-out) both;
}

.msg-avatar {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 10px;
  /* 头像素材是白色描边图标，下面垫品牌色才能与白底区分 */
  background-image: var(--fe-grad-brand);
  box-shadow: 0 4px 10px rgba(46, 191, 145, 0.22);

  img {
    width: 74%;
    height: 74%;
    object-fit: contain;
  }
}

/* 用户侧换成副色，一眼分得清谁在说话 */
.row-user .msg-avatar {
  background-image: var(--fe-grad-accent);
  box-shadow: 0 4px 10px rgba(92, 107, 192, 0.22);
}

.row-user {
  flex-direction: row-reverse;
}

.row-user .message-cluster {
  align-items: flex-end;
}

.message-cluster {
  min-width: 0;
  max-width: 78%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.message-bubble {
  max-width: 100%;
  padding: 11px 15px;
  border: 1px solid var(--fe-border);
  border-radius: 4px 18px 18px;
  background: var(--fe-surface);
  box-shadow: var(--fe-shadow-sm);
  color: var(--fe-text-soft);
  font-size: 14.5px;
  line-height: 1.75;
  overflow-wrap: anywhere;
}

.row-user .message-bubble {
  border: 0;
  border-radius: 18px 4px 18px 18px;
  background: var(--fe-grad-accent);
  box-shadow: var(--fe-shadow-brand);
  color: var(--fe-surface);
}

.plain-text {
  margin: 0;
  white-space: pre-wrap;
}

/* 气泡下方的附加状态：已停止 / 生成失败 + 重试入口 */
.stream-status {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--fe-text-muted);
  font-size: 12px;
  line-height: 1.5;

  &.is-error {
    color: var(--fe-danger);
  }
}

.retry-btn {
  min-height: 28px;
  padding: 0 12px;
  border: 1px solid currentColor;
  border-radius: var(--fe-radius-pill);
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background: var(--fe-danger-soft);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--fe-danger-ring);
  }
}

.error-bubble {
  border-color: var(--fe-danger-ring);
  background: var(--fe-danger-soft);
  color: var(--fe-danger);
}

.error-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--fe-danger);

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    margin-top: 3px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  p {
    margin: 0;
  }
}

.message-time {
  color: var(--fe-text-faint);
  font-size: 11px;
}

.typing-indicator {
  display: flex;
  gap: 5px;
  padding: 5px 1px;
}

.typing-indicator span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--fe-text-faint);
  animation: ds-bounce 1.4s ease-in-out infinite;

  &:nth-child(2) {
    animation-delay: 0.18s;
  }

  &:nth-child(3) {
    animation-delay: 0.36s;
  }
}

.chat-input-area {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  padding: 12px clamp(16px, 4vw, 32px) 16px;
}

.input-card,
.input-hint {
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
}

.input-card {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 10px 10px 10px 16px;
  border: 1.5px solid var(--fe-border);
  border-radius: var(--fe-radius-md);
  background: var(--fe-surface);
  box-shadow: var(--fe-shadow-sm);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.input-card:focus-within {
  border-color: var(--fe-brand);
  box-shadow: 0 0 0 3px var(--fe-brand-ring);
}

:deep(.el-textarea__inner) {
  min-height: 38px !important;
  padding: 9px 0 !important;
  border: 0 !important;
  border-radius: 0;
  background: transparent !important;
  box-shadow: none !important;
  color: var(--fe-text);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
}

:deep(.el-textarea__inner::placeholder) {
  color: var(--fe-text-faint);
}

:deep(.el-textarea__inner:disabled) {
  cursor: not-allowed;
  opacity: 0.7;
}

.send-btn {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border: 0;
  border-radius: 10px;
  background: var(--fe-border);
  color: var(--fe-text-faint);
  cursor: not-allowed;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;

  svg {
    width: 19px;
    height: 19px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &.active {
    background: var(--fe-grad-brand);
    box-shadow: var(--fe-shadow-brand);
    color: var(--fe-surface);
    cursor: pointer;

    &:hover {
      transform: translateY(-1px);
    }

    &:focus-visible {
      outline: none;
      box-shadow:
        0 0 0 3px var(--fe-brand-ring),
        var(--fe-shadow-brand);
    }
  }

  /* 生成中切换为停止：中性深色，避免与“发送”的品牌绿混淆 */
  &.is-stop {
    background: var(--fe-text-soft);
    box-shadow: none;
    color: var(--fe-surface);
    cursor: pointer;

    svg {
      /* 基础规则里有 fill: none，这里必须覆盖，否则方块只剩描边 */
      fill: currentColor;
      stroke: none;
    }

    &:hover {
      transform: scale(1.04);
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px var(--fe-brand-ring);
    }
  }
}

.input-hint {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-top: 7px;
  color: var(--fe-text-faint);
  font-size: 10px;

  .warn {
    color: var(--fe-danger);
  }
}

.chat-backdrop {
  display: none;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes ds-bounce {
  0%,
  100% {
    opacity: 0.4;
    transform: translateY(0);
    background: var(--fe-text-faint);
  }

  50% {
    opacity: 1;
    transform: translateY(-4px);
    background: var(--fe-brand);
  }
}

@keyframes msg-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes ambient-drift {
  from {
    transform: scale(1) translate3d(0, 0, 0);
  }

  to {
    transform: scale(1.04) translate3d(10px, -8px, 0);
  }
}

@keyframes caret-blink {
  50% {
    opacity: 0;
  }
}

@media (max-width: 900px) {
  .chat-backdrop {
    position: absolute;
    inset: 0;
    z-index: 29;
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    background: rgba(31, 42, 38, 0.26);
    cursor: pointer;
    backdrop-filter: blur(2px);
  }

  .chat-sidebar {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 30;
    width: min(300px, 84vw);
    box-shadow: var(--fe-shadow-lg);
  }

  .chat-page.is-collapsed .chat-sidebar {
    width: min(300px, 84vw);
    opacity: 0;
    visibility: hidden;
    transform: translateX(-100%);
    transition:
      transform 0.3s var(--fe-ease-out),
      opacity 0.25s ease,
      visibility 0.3s;
  }

  .chat-page:not(.is-collapsed) .chat-sidebar {
    transform: translateX(0);
  }

  .chat-topbar {
    padding: 0 12px;
  }

  .tb-title {
    max-width: 52vw;
  }

  .chat-welcome {
    padding-top: 20px;
  }
}

@media (max-width: 600px) {
  .chat-topbar {
    min-height: 52px;
  }

  .tb-new span {
    display: none;
  }

  .tb-new {
    width: 38px;
    justify-content: center;
    padding: 0;
  }

  .tb-title {
    max-width: 52vw;
    font-size: 13px;
  }

  .chat-messages {
    padding-top: 18px;
  }

  .welcome-avatar {
    width: 70px;
    height: 70px;
    border-radius: 22px;

    img {
      width: 50px;
      height: 50px;
    }
  }

  .chat-welcome h1 {
    font-size: 1.4rem;
  }

  .prompt-chips {
    gap: 8px;
    margin-top: 22px;
  }

  .prompt-chips button {
    min-height: 40px;
    padding: 0 12px;
    font-size: 12px;
  }

  .message-cluster {
    max-width: 84%;
  }

  .chat-input-area {
    padding-bottom: 10px;
  }

  .input-hint {
    font-size: 9px;
  }
}

@media (hover: none) {
  .sb-del {
    opacity: 0.7;
  }
}

@media (prefers-contrast: high) {
  .chat-ambient {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .chat-ambient,
  .msg-row,
  .typewriter-caret,
  .typing-indicator span {
    animation: none;
  }
}
</style>
