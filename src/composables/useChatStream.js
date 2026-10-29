import { computed, ref } from 'vue'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { apiBaseUrl } from '@/config'

// 增量文本逐片更新会引发频繁布局，按 80ms 合并刷新
export const STREAM_FLUSH_INTERVAL = 80

/**
 * 一次流式生成的生命周期：连接、聚合、停止、失败。
 *
 * 边界：不碰消息列表、不碰滚动、不碰情绪面板、不碰 DOM。
 * 组件只通过回调拿到"当前累计文本 / 结束 / 中止 / 失败"。
 *
 * 状态机：idle -> connecting -> streaming -> done | aborted | error
 */
export function useChatStream({
  transport = fetchEventSource,
  endpoint = `${apiBaseUrl}/psychological-chat/stream`
} = {}) {
  const status = ref('idle')
  const content = ref('')
  const error = ref(null)

  const isActive = computed(
    () => status.value === 'connecting' || status.value === 'streaming'
  )

  let controller = null
  let buffer = ''
  let flushTimer = null
  // 代数守卫：停止或切换会话后，旧流的回调与已排队的 flush 一律失效。
  // 只靠 controller 判断挡不住已经排进定时器的那一片增量。
  let generation = 0
  let handlers = {}

  const clearFlushTimer = () => {
    if (flushTimer) {
      clearTimeout(flushTimer)
      flushTimer = null
    }
  }

  const flush = () => {
    clearFlushTimer()
    if (!buffer) return
    const pending = buffer
    buffer = ''
    content.value += pending
    handlers.onUpdate?.(content.value)
  }

  const discardBuffer = () => {
    buffer = ''
    clearFlushTimer()
  }

  // 失败但保留已生成内容：先把缓冲落盘，再通知组件
  const fail = (generationAtStart, message) => {
    if (generationAtStart !== generation) return
    flush()
    error.value = message
    status.value = 'error'
    handlers.onError?.(message, content.value)
  }

  const start = ({
    sessionId,
    userMessage,
    token,
    onUpdate,
    onDone,
    onAbort,
    onError,
    onUnauthorized
  }) => {
    // 上一代还在跑就先静默掐掉，避免两代同时写 content
    if (controller) abort()

    const currentGeneration = ++generation
    const currentController = new AbortController()
    const currentHandlers = { onUpdate, onDone, onAbort, onError, onUnauthorized }

    controller = currentController
    handlers = currentHandlers
    content.value = ''
    error.value = null
    status.value = 'connecting'
    discardBuffer()

    transport(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Token: token,
        Accept: 'text/event-stream'
      },
      body: JSON.stringify({ sessionId, userMessage }),
      signal: currentController.signal,
      onopen: (response) => {
        if (currentGeneration !== generation) return

        if (response.status === 401 || response.status === 403) {
          discardBuffer()
          status.value = 'error'
          currentHandlers.onUnauthorized?.()
          currentController.abort()
          return
        }

        const contentType = response.headers.get('Content-Type') || ''
        if (!response.ok || !contentType.includes('text/event-stream')) {
          fail(currentGeneration, '服务器响应异常，请稍后重试')
          currentController.abort()
        } else {
          status.value = 'streaming'
        }
      },
      onmessage: (event) => {
        if (currentGeneration !== generation) return

        const raw = event.data.trim()
        if (!raw) return

        if (event.event === 'done') {
          flush()
          status.value = 'done'
          currentHandlers.onDone?.()
          currentController.abort()
          return
        }

        try {
          const payload = JSON.parse(raw)
          const ok = String(payload.code) === '200'
          if (ok && payload.data && payload.data.content) {
            buffer += payload.data.content
            if (status.value !== 'streaming') status.value = 'streaming'
            if (!flushTimer) {
              flushTimer = setTimeout(() => {
                flushTimer = null
                if (currentGeneration === generation) flush()
              }, STREAM_FLUSH_INTERVAL)
            }
          } else {
            fail(currentGeneration, payload.message || 'AI回复失败')
            // 已经判定失败，不再接受后续增量
            currentController.abort()
          }
        } catch (err) {
          console.error('解析流式数据异常:', err)
        }
      },
      onerror: (err) => {
        if (currentGeneration !== generation) return
        // 主动中止不是错误：由 stop() / abort() 负责收尾
        if (err?.name === 'AbortError') return
        console.error('SSE 连接异常:', err)
        fail(currentGeneration, '网络连接中断或AI回复失败')
        currentController.abort()
        throw err
      },
      onclose: () => {
        if (currentGeneration !== generation) return
        flush()
        if (status.value !== 'error') status.value = 'done'
      }
    }).catch(() => {
      // 中止与错误已由统一回调处理，这里只消费 Promise rejection
    }).finally(() => {
      if (currentGeneration !== generation) return
      flush()
      if (controller === currentController) controller = null
      if (status.value === 'connecting' || status.value === 'streaming') status.value = 'done'
    })
  }

  // 用户主动停止：保留已生成内容，通知组件收尾
  const stop = () => {
    if (!isActive.value) return false

    const currentController = controller
    controller = null
    flush()
    generation += 1
    currentController?.abort()
    status.value = 'aborted'
    handlers.onAbort?.(content.value)
    return true
  }

  // 静默中止：切换会话、卸载组件时用，不触发任何回调
  const abort = () => {
    const currentController = controller
    controller = null
    generation += 1
    discardBuffer()
    currentController?.abort()
    status.value = 'aborted'
  }

  const reset = () => {
    abort()
    content.value = ''
    error.value = null
    status.value = 'idle'
    handlers = {}
  }

  return { status, content, error, isActive, start, stop, abort, reset }
}
