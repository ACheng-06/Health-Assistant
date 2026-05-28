<template>
  <div class="consultation-container">
    <!-- 左侧边栏 -->
    <div class="sidebar">
      <!-- AI助手信息 -->
      <div class="ai-assistant-info">
        <div class="breathing-circle">
          <el-image :src="iconUrl1" style="width: 60px; height: 60px" alt="AI助手" />
        </div>
        <h3 class="assistant-name">AI助手</h3>
        <div class="online-status">
          <div class="status-dot"></div>
          在线服务中
        </div>
      </div>

      <!-- 情绪花园 -->
      <div class="emotion-garden">
        <div class="garden-header">
          <div class="garden-title">情绪花园</div>
        </div>
        <div class="emotion-info">
          <div class="emotion-name">{{ currentEmotion.primaryEmotion || '中性' }}</div>
          <div class="emotion-score">{{ currentEmotion.emotionScore || 50 }}</div>
        </div>
        <div class="warm-tips">
          <div class="emotion-status-text">
            <span class="status-label">今天感觉</span>
            <span class="status-emotion">{{ currentEmotion.isNegative ? '需要关注' : '很不错' }}</span>
          </div>
          <div class="emotion-intensity">
            <span class="intensity-dots">
              <span v-for="dot in 3" :key="dot" class="dot"
                :class="{ 'active': getIntensityClass(currentEmotion.emotionScore) >= dot }"></span>
            </span>
            <span class="intensity-label">
              {{ getRiskText(currentEmotion.riskLevel) }}
            </span>
          </div>
          <!-- 温暖建议卡片 -->
          <div class="warm-suggestion" v-if="currentEmotion.suggestion">
            <div class="suggestion-icon">💝</div>
            <div class="suggestion-content">
              <div class="suggestion-title">给你一个小建议</div>
              <div class="suggestion-text">{{ currentEmotion.suggestion }}</div>
            </div>
          </div>
          <!-- 治愈行动 -->

          <div class="healing-actions" v-if="currentEmotion.improvementSuggestions?.length > 0">
            <div class="actions-title">治愈小行动</div>
            <div class="actions-list">
              <div class="action-item" v-for="action in currentEmotion.improvementSuggestions" :key="action">
                <div class="actions-icon">✨</div>
                <div class="action-text">{{ action }}</div>
              </div>
            </div>
          </div>
          <!-- 风险提示 -->
          <div class="risk-notice" v-if="currentEmotion.isNegative && currentEmotion.riskLevel > 1">
            <div class="notice-icon">🤗</div>
            <div class="notice-content">
              <div class="notice-title">温馨提示</div>
              <div class="notice-text">{{ currentEmotion.riskDescription }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 会话列表 -->
      <div class="session-history">
        <h4 class="section-title">会话列表</h4>
        <div class="session-list">
          <div class="session-item" v-for="session in sessionList" :key="session.id"
            @click="handleSelectSessionClick(session)"
            :class="{ active: currentSession?.sessionId === 'session_' + session.id }">
            <div class="session-info">
              <div class="session-title">
                <span>{{ session.sessionTitle }}</span>
                <div class="session-meta">
                  <span class="session-time">{{ session.startedAt }}</span>
                </div>
                <div class="session-stats">
                  <span>
                    <el-icon>
                      <ChatRound />
                    </el-icon>
                    {{ session.messageCount || 0 }}
                  </span>
                  <span>
                    <el-icon>
                      <Clock />
                    </el-icon>
                    {{ Math.floor((session.durationMinutes || 0) / 60) }}小时前
                  </span>
                </div>
              </div>
              <div class="session-actions">
                <el-button text type="danger" size="small" @click.stop="handleDeleteSession(session.id)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="chat-main">
      <!-- 头部信息 -->
      <div class="chat-header">
        <div class="header-left">
          <div class="chat-avatar">
            <el-image :src="iconUrl1" style="width: 50px; height: 50px" />
          </div>
          <div class="chat-info">
            <h2>豆包AI助手</h2>
            <p> 您贴心的AI心理健康助手</p>
          </div>
        </div>

        <el-button circle @click="createNewFrontendSession" title="新建会话">
          <el-icon>
            <Plus />
          </el-icon>
        </el-button>
      </div>

      <!-- 聊天记录展示区 -->
      <div class="chat-messages" ref="chatMessagesRef" :class="{ 'lock-scroll': isAiTyping }">
        <!-- 默认欢迎语（仅在没有消息时显示） -->
        <div class="message-item ai-message" v-if="messages.length === 0">
          <div class="message-avatar">
            <el-image :src="iconUrl1" style="width: 32px; height: 32px" alt="AI助手" />
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <p>您好！我是豆包，您的AI心理健康助手，很高兴陪伴您，为您提供温暖的心理支持，请告诉我，今天您感觉怎么样？有什么想要分享的吗？</p>
            </div>
            <div class="message-time">刚刚</div>
          </div>
        </div>

        <!-- 动态消息列表 -->
        <div class="message-item" v-for="msg in messages" :key="msg.id"
          :class="msg.senderType === 1 ? 'user-message' : 'ai-message'">
          <div class="message-avatar">
            <el-image v-if="msg.senderType === 1" :src="iconUrl2" style="width: 32px; height: 32px" alt="用户" />
            <el-image v-if="msg.senderType === 2" :src="iconUrl1" style="width: 32px; height: 32px" alt="AI助手" />
          </div>
          <div class="message-content">
            <div class="message-bubble">

              <!-- AI 思考中（加载动画） -->
              <div v-if="msg.senderType === 2 && isAiTyping && !msg.content" class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
              </div>
              <!-- 错误提示 -->
              <div v-else-if="msg.isError" class="error-message">
                <p>{{ msg.content }}</p>
              </div>
              <!-- 正常渲染的 AI 回复（支持 Markdown） -->
              <MarkdownRenderer v-else-if="msg.senderType === 2 && !msg.isError" :content="msg.content"
                :is-ai-message="true" />

              <p v-else-if="msg.content" v-html="formatMessageContent(msg.content)"></p>
            </div>

            <!-- 时间展示 -->
            <div class="message-time">{{ msg.senderType === 2 && isAiTyping ? '正在输入中...' : msg.createdAt }}</div>
          </div>
        </div>
      </div>
      <!-- 底部输入框 -->
      <div class="chat-input">
        <div class="input-container">
          <el-input type="textarea" v-model="userMessage" placeholder="请输入您的问题" clearable :rows="3"
            @keydown="handleKeyDown" :disabled="isAiTyping" />
          <div class="input-footer">
            <span>按Enter发送,Shift+Enter换行</span>
            <span>{{ userMessage.length }} / 500</span>
          </div>
        </div>
        <el-button :disabled="!userMessage.trim() || userMessage.length > 500" type="primary" class="send-btn"
          @click="sendMessage">
          <el-icon>
            <Promotion />
          </el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import MarkdownRenderer from './MarkdownRenderer.vue'
  import { ref, onMounted, nextTick } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { fetchEventSource } from '@microsoft/fetch-event-source'
  import { startSessionAPI, getSessionListAPI, getSessionDetailAPI, getSessionEmotionAPI, deleteSessionAPI } from '@/api/frontend'
  // 静态图片资源

  const iconUrl1 = new URL('@/assets/images/logo.png', import.meta.url).href
  const iconUrl2 = new URL('@/assets/images/user.png', import.meta.url).href

  // 定义响应式变量
  const currentSession = ref(null)
  const sessionList = ref([])
  const messages = ref([])
  const userMessage = ref('')
  const isAiTyping = ref(false)
  const chatMessagesRef = ref(null)

  const currentEmotion = ref({
    primaryEmotion: '中性',
    emotionScore: 50,
    isNegative: false,
    riskLevel: 0,
    suggestion: '情绪状态平稳',
    improvementSuggestions: []
  })

  const getIntensityClass = (score) => {
    if (score >= 61) return 3
    if (score >= 31) return 2
    return 1
  }

  // 映射方法
  const getRiskText = (level) => {
    switch (level) {
      case 0: return '正常'
      case 1: return '关注'
      case 2: return '预警'
      case 3: return '危机'
      default: return '正常'
    }
  }

  // 加载当前会话的情绪状态
  const loadSessionEmotion = async (sessionId) => {
    const id = sessionId.toString().startsWith('session_') ? sessionId : `session_${sessionId}`
    try {
      const res = await getSessionEmotionAPI(id)
      currentEmotion.value = res
    } catch (err) {
      console.error('获取情绪数据失败', err)
    }
  }


  // 分页获取历史会话列表
  const getSessionPage = async () => {
    try {
      const res = await getSessionListAPI({
        page: 1,
        size: 10
      })

      sessionList.value = res?.records || []
    } catch (error) {
      console.error('获取会话列表失败:', error)
    }
  }

  // 删除会话逻辑
  const handleDeleteSession = async (sessionId) => {
    try {
      // 确认删除
      await ElMessageBox.confirm('确认删除该会话吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
    } catch {
      ElMessage.error('已取消删除操作')
      return
    }

    try {
      await deleteSessionAPI(sessionId)
      ElMessage.success('会话删除成功')
      getSessionPage()
      if (currentSession.value && currentSession.value.sessionId === ("session_" + sessionId)) {
        createNewFrontendSession()
      }
    } catch (err) {
      console.error('删除会话失败:', err)
      ElMessage.error('删除会话失败，请重试')
    }
  }

  // 回车发送，Shift+Enter 换行
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }



  const scrollToBottom = () => {
    nextTick(() => {
      if (chatMessagesRef.value) {
        chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
      }
    })
  }

  // 初始化新建会话
  const createNewFrontendSession = () => {
    const newSession = {
      sessionId: `temp_${Date.now()}`,
      status: 'TEMP',
      sessionTitle: '新对话'
    }
    currentSession.value = newSession
    messages.value = [] // 切换到新对话时清空右侧消息
    // 重置左侧情绪卡片
    currentEmotion.value = {
      primaryEmotion: '中性',
      emotionScore: 50,
      isNegative: false,
      riskLevel: 0,
      suggestion: '让我们开始一段新的对话吧',
      improvementSuggestions: []
    }
  }

  // 处理会话点击事件
  const handleSelectSessionClick = async (session) => {
    try {
      const res = await getSessionDetailAPI(session.id)
      messages.value = res
      loadSessionEmotion(session.id)
    } catch (err) {
      console.error('加载会话记录失败', err)
      ElMessage.error('加载会话记录失败')
    }

    // 更新当前会话追踪状态
    currentSession.value = {
      sessionId: "session_" + session.id,
      status: "ACTIVE",
      sessionTitle: session.sessionTitle
    }
  }

  const sendMessage = () => {
    if (!userMessage.value.trim()) return
    if (isAiTyping.value) {
      ElMessage.error('AI助手正在输入中，请稍后再试...')
      return
    }

    const msg = userMessage.value.trim()
    userMessage.value = ''  // 清空输入框

    if (!currentSession.value || currentSession.value.status === 'TEMP') {
      startNewSession(msg)
    } else {
      messages.value.push({
        id: Date.now(),
        senderType: 1,          // 1 = 用户
        content: msg,
        createdAt: new Date().toISOString()
      })
      scrollToBottom()
      startAiResponse(currentSession.value.sessionId, msg)
    }

  }

  const startNewSession = async (msg) => {
    try {
      // 新建会话内容
      const sessionParams = { initialMessage: msg }

      if (currentSession.value && currentSession.value.sessionTitle === '新对话') {
        sessionParams.sessionTitle = `豆包AI助手 - ${new Date().toLocaleDateString()}`
      } else if (currentSession.value) {
        sessionParams.sessionTitle = currentSession.value.sessionTitle
      }

      const res = await startSessionAPI(sessionParams)
      const sessionData = {
        sessionId: res.sessionId,
        status: res.status,
        sessionTitle: sessionParams.sessionTitle
      }
      currentSession.value = sessionData

      getSessionPage() // 刷新左侧会话列表

      messages.value.push({
        id: Date.now(),
        senderType: 1,
        content: msg,
        createdAt: new Date().toISOString()
      })
      scrollToBottom()
      startAiResponse(currentSession.value.sessionId, msg)
    } catch (err) {
      console.error('创建会话失败:', err)
      ElMessage.error('创建会话失败，请重试')
    }
  }

  const startAiResponse = async (sessionId, msg) => {
    if (isAiTyping.value) {
      ElMessage.error('AI助手正在输入中，请稍后再试...')
      return
    }
    isAiTyping.value = true

    const messageId = `ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    const aiMessage = {
      id: messageId,
      senderType: 2,
      content: '',
      createdAt: new Date().toISOString(),
      isError: false
    }
    messages.value.push(aiMessage)
    scrollToBottom()

    const ctrl = new AbortController()

    fetchEventSource('/api/psychological-chat/stream', {
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
        const contentType = response.headers.get('Content-Type') || ''
        if (!contentType.includes('text/event-stream')) {
          ElMessage.error('服务器类型错误')
        }
      },
      onmessage: (event) => {
        const res = event.data.trim()
        if (!res) return

        if (event.event === 'done') {
          isAiTyping.value = false
          ctrl.abort()
          // 单次对话结束后，刷新当前会话的情绪卡片数据
          loadSessionEmotion(currentSession.value.sessionId)
          return
        }

        try {
          const payload = JSON.parse(res)
          const ok = String(payload.code) === '200'
          if (ok && payload.data && payload.data.content) {
            const targetMsg = messages.value.find(m => m.id === messageId)
            if (targetMsg) {
              targetMsg.content += payload.data.content
              scrollToBottom()
            }
          } else {
            handleError(payload.message || 'AI回复失败')
          }
        } catch (e) {
          console.error("解析流式数据异常:", e)
        }
      },
      onerror: (err) => {
        console.error('SSE 连接异常:', err)
        handleError('网络连接中断或AI回复失败')
        ctrl.abort()
        throw err
      },
      onclose: () => {
        isAiTyping.value = false
      }
    })
  }

  // 统一错误处理
  const handleError = (errorMsg) => {
    const aiMessage = messages.value[messages.value.length - 1]
    if (aiMessage && aiMessage.senderType === 2) {
      aiMessage.content = errorMsg
      aiMessage.isError = true
    }
    isAiTyping.value = false
    ElMessage.error(errorMsg || 'AI助手失败，请稍后再试...')
  }

  // 简单的文本格式化
  const formatMessageContent = (content) => {
    return content ? content.replace(/\n/g, '<br>') : ''
  }


  onMounted(() => {
    createNewFrontendSession()
    getSessionPage()
  })
</script>
<style lang="scss">
.consultation-container {
  margin: 0 auto;
  width: 1200px;
  display: flex;
  gap: 20px;
  padding: 20px;

  .sidebar {
    width: 320px;

    /* --- 原有样式保留 --- */
    .ai-assistant-info {
      margin-bottom: 20px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(185, 184, 184, 0.8);
      border: 1px solid rgba(251, 146, 60, 0.08);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      .breathing-circle {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #76c3d4 0%, #c0dcf2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
        animation: breathing 4s ease-in-out infinite;
        box-shadow: 0 6px 24px rgba(144, 199, 224, 0.25);
        position: relative;
      }

      .assistant-name {
        font-size: 16px;
        font-weight: 700;
        background: linear-gradient(135deg, #0596689e, #059669);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        background-clip: text;
        margin: 0 0 12px;
      }

      .online-status {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #059669;
        font-size: 12px;
        font-weight: 600;

        .status-dot {
          width: 8px;
          height: 8px;
          background: #059669;
          border-radius: 50%;
          margin-right: 8px;
          animation: pulse 2s infinite;
          box-shadow: 0 0 8px rgba(5, 150, 105, 0.4);
        }
      }
    }

    .emotion-garden {
      background: linear-gradient(135deg, #fffffffd 0%, #ffffff 50%, #fffefd 100%);
      border-radius: 20px;
      padding: 16px;
      margin-bottom: 20px;
      box-shadow: 0 8px 32px rgba(185, 184, 184, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
      min-height: 300px;

      .garden-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        position: relative;
        z-index: 2;

        .garden-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #8b4513;
        }
      }

      .emotion-info {
        margin: 0 auto;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.8);
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
        color: #fff;

        .emotion-name {
          font-size: 15px;
          font-weight: 600;
          line-height: 1;
          margin-bottom: 2px;
        }

        .emotion-score {
          font-size: 14px;
          font-weight: 700;
          opacity: 0.9;
        }
      }

      .warm-tips {
        text-align: center;
        margin-bottom: 16px;

        .emotion-status-text {
          margin-bottom: 12px;

          .status-label {
            font-size: 14px;
            color: #8b7355;
            margin-right: 8px;
          }

          .status-emotion {
            font-size: 16px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 16px;
            display: inline-block;
          }
        }

        .emotion-intensity {
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          .intensity-dots {
            display: flex;
            gap: 4px;

            .dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #e0e0e0;
              transition: all 0.3s ease;

              &.active {
                background: linear-gradient(135deg, #ff9a9e, #fecfef);
                transform: scale(1.2);
                box-shadow: 0 2px 8px rgba(255, 154, 158, 0.4);
              }
            }
          }

          .intensity-label {
            font-size: 12px;
            color: #8b7355;
            font-weight: 500;
          }
        }

        .warm-suggestion {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
          border-radius: 16px;
          padding: 12px;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 6px 20px rgba(185, 184, 184, 0.8);

          .suggestion-icon {
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .suggestion-content {
            text-align: left;
            flex: 1;

            .suggestion-title {
              font-size: 14px;
              font-weight: 600;
              color: #8b7355;
              margin-bottom: 6px;
            }

            .suggestion-text {
              font-size: 13px;
              color: #6b5b47;
              line-height: 1.5;
            }
          }
        }

        .healing-actions {
          margin-bottom: 16px;

          .actions-title {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #8b7355;
            margin-bottom: 16px;
          }

          .actions-list {
            display: flex;
            flex-direction: column;
            gap: 10px;

            .action-item {
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
              border-radius: 12px;
              padding: 12px;
              display: flex;
              align-items: center;
              gap: 10px;
              border: 1px solid rgba(255, 255, 255, 0.5);
              box-shadow: 0 4px 12px rgba(185, 184, 184, 0.8);
              text-align: left;

              .actions-icon {
                font-size: 14px;
                color: #ffd700;
                flex-shrink: 0;
              }

              .action-text {
                font-size: 12px;
                color: #6b5b47;
                line-height: 1.4;
                flex: 1;
              }
            }
          }
        }

        .risk-notice {
          background: linear-gradient(172deg, #ffe6e6, #ffa7a7);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border: 1px solid #ffffff;
          box-shadow: 0 6px 20px rgb(199 160 171 / 30%);

          .notice-icon {
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .notice-content {
            flex: 1;

            .notice-title {
              font-size: 14px;
              font-weight: 600;
              color: #f07171;
              margin-bottom: 6px;
            }

            .notice-text {
              font-size: 13px;
              color: #f07171;
              line-height: 1.5;
            }
          }
        }
      }
    }

    .session-history {
      background: white;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(185, 184, 184, 0.8);

      min-height: 250px;
      display: flex;
      flex-direction: column;

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .session-list {
        overflow-y: auto;
        max-height: 290px;
        scrollbar-width: thin;
        scrollbar-color: rgba(64, 150, 255, 0.3) transparent;

        .session-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;

          &:hover {
            background: #f8f9ff;
            border-color: #e6f0ff;
          }

          &.active {
            background: #e6f0ff;
            border-color: #4096ff;
          }

          .session-info {
            flex: 1;

            .session-title {
              font-weight: 500;
              font-size: 14px;
              color: #333;
              margin-bottom: 4px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;

              .session-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;

                .session-time {
                  font-size: 12px;
                  color: #999;
                }
              }

              .session-stats {
                display: flex;
                align-items: center;
                gap: 12px;

                span {
                  font-size: 12px;
                  color: #999;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                }
              }
            }

            .session-actions {
              position: absolute;
              top: 10px;
              right: 12px;
            }
          }
        }
      }
    }
  }

  .chat-main {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 252, 250, 0.98) 100%);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(185, 184, 184, 0.8);
    border: 1px solid rgba(251, 146, 60, 0.1);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;

    .chat-header {
      background: linear-gradient(135deg, #c3e5ff 0%, #c3e5ff 100%);
      color: white;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      flex-shrink: 0;

      .header-left {
        display: flex;
        align-items: center;

        .chat-avatar {
          width: 48px;
          height: 48px;
          background: transparent;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          position: relative;
          z-index: 1;
        }

        .chat-info {
          h2 {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 4px;
          }

          p {
            font-size: 14px;
          }
        }
      }
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 252, 248, 0.05) 100%);
      min-height: 0;
      max-height: calc(100vh - 200px);
      scrollbar-width: thin;
      scrollbar-color: rgba(141, 170, 232, 0.3) transparent;

      &.lock-scroll {
        overflow-y: hidden !important;
        touch-action: none;
      }

      .message-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          flex-shrink: 0;
        }

        &.ai-message {
          .message-avatar {

            box-shadow: 0 4px 12px rgba(171, 235, 242, 0.943);
          }
        }

        &.user-message {
          flex-direction: row-reverse;

          .message-avatar {
            background: linear-gradient(135deg, #6b7280, #4b5563);
            box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
          }
        }

        .message-content {
          max-width: 70%;

          .message-bubble {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
            border-radius: 16px;
            padding: 12px 16px;
            position: relative;
            animation: fadeInUp 0.4s ease-out;
            border: 1px solid rgba(251, 146, 60, 0.1);
            box-shadow: 0 4px 16px rgba(251, 146, 60, 0.05);

            .typing-indicator {
              display: flex;
              gap: 4px;
              padding: 8px 0;

              .typing-dot {
                width: 8px;
                height: 8px;
                background: #ccc;
                border-radius: 50%;
                animation: typing 1.5s ease-in-out infinite;

                &:nth-child(2) {
                  animation-delay: 0.2s;
                }

                &:nth-child(3) {
                  animation-delay: 0.4s;
                }
              }
            }
          }

          .message-time {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
            text-align: right;
          }
        }
      }
    }

    .chat-input {
      border-top: 1px solid rgba(251, 146, 60, 0.1);
      padding: 20px 24px;
      display: flex;
      gap: 12px;
      align-items: flex-end;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 252, 248, 0.7) 100%);
      backdrop-filter: blur(10px);
      flex-shrink: 0;

      .input-container {
        flex: 1;

        .input-footer {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #999;
          margin-top: 8px;
        }
      }

      .send-btn {
        height: 60px;
        width: 60px;
        color: #272626;
        border-radius: 16px;
        background: linear-gradient(135deg, #ffffff 0%, #ffffff 100%) !important;
        border: none !important;
        box-shadow: 0 6px 20px rgba(56, 57, 59, 0.25);
        transition: all 0.3s ease;
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {

  0%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }

  50% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

@keyframes breathing {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }

  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(5, 150, 105, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(5, 150, 105, 0);
  }
}
</style>