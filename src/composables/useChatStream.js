import { computed, ref } from 'vue'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { apiBaseUrl } from '@/config'

// 增量文本逐片更新会引发频繁布局，按 80ms 合并刷新
export const STREAM_FLUSH_INTERVAL = 80

// 六个状态覆盖一次生成的全部落点，没有“未知态”，UI 可以完全由状态派生
export const STREAM_STATUS = Object.freeze({
  IDLE: 'idle',
  CONNECTING: 'connecting',
  STREAMING: 'streaming',
  DONE: 'done',
  ABORTED: 'aborted',
  ERROR: 'error'
})

// 迁移白名单：只有表里写明的边才允许走，其余一律拦截。
// 终态之间不允许互跳（已被停止的不会因为迟到的 onclose 又变成 done），
// 只允许重新发起连接——这让“停止后又收到完成回调”这类竞态在状态层就断掉。
const TRANSITIONS = Object.freeze({
  [STREAM_STATUS.IDLE]: [STREAM_STATUS.CONNECTING],
  [STREAM_STATUS.CONNECTING]: [
    STREAM_STATUS.STREAMING,
    STREAM_STATUS.DONE,
    STREAM_STATUS.ABORTED,
    STREAM_STATUS.ERROR
  ],
  [STREAM_STATUS.STREAMING]: [
    STREAM_STATUS.DONE,
    STREAM_STATUS.ABORTED,
    STREAM_STATUS.ERROR
  ],
  [STREAM_STATUS.DONE]: [STREAM_STATUS.CONNECTING],
  [STREAM_STATUS.ABORTED]: [STREAM_STATUS.CONNECTING],
  [STREAM_STATUS.ERROR]: [STREAM_STATUS.CONNECTING]
})

/**
 * 一次流式生成的生命周期：连接、聚合、停止、失败。
 *
 * 边界：不碰消息列表、不碰滚动、不碰情绪面板、不碰 DOM。
 * 组件只通过回调拿到"当前累计文本 / 结束 / 中止 / 失败"。
 *
 * 状态机：idle -> connecting -> streaming -> done | aborted | error
 * 每次迁移都要过白名单，叠加 generation 代数守卫：
 * 白名单管“这个迁移合不合法”，代数管“这个回调是不是上一代的”。
 */
export function useChatStream({
  transport = fetchEventSource,
  endpoint = `${apiBaseUrl}/psychological-chat/stream`
} = {}) {
  const status = ref(STREAM_STATUS.IDLE)
  const content = ref('')
  const error = ref(null)

  const isActive = computed(
    () =>
      status.value === STREAM_STATUS.CONNECTING || status.value === STREAM_STATUS.STREAMING
  )
  const isSettled = computed(
    () =>
      status.value === STREAM_STATUS.DONE ||
      status.value === STREAM_STATUS.ABORTED ||
      status.value === STREAM_STATUS.ERROR
  )

  // 状态迁移的唯一入口：非法边直接丢弃，开发态告警便于尽早发现回调顺序错乱
  const transition = (next) => {
    const from = status.value
    if (from === next) return true
    if (!TRANSITIONS[from]?.includes(next)) {
      if (import.meta.env?.DEV) {
        console.warn(`[useChatStream] 非法状态迁移已拦截: ${from} -> ${next}`)
      }
      return false
    }
    status.value = next
    return true
  }

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
    transition(STREAM_STATUS.ERROR)
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
    transition(STREAM_STATUS.CONNECTING)
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
          transition(STREAM_STATUS.ERROR)
          currentHandlers.onUnauthorized?.()
          currentController.abort()
          return
        }

        const contentType = response.headers.get('Content-Type') || ''
        if (!response.ok || !contentType.includes('text/event-stream')) {
          fail(currentGeneration, '服务器响应异常，请稍后重试')
          currentController.abort()
        } else {
          transition(STREAM_STATUS.STREAMING)
        }
      },
      onmessage: (event) => {
        if (currentGeneration !== generation) return

        const raw = event.data.trim()
        if (!raw) return

        if (event.event === 'done') {
          flush()
          transition(STREAM_STATUS.DONE)
          currentHandlers.onDone?.()
          currentController.abort()
          return
        }

        try {
          const payload = JSON.parse(raw)
          const ok = String(payload.code) === '200'
          if (ok && payload.data && payload.data.content) {
            // 已进入终态的流不再接受增量，避免停止后又被追加内容
            if (!isActive.value) return
            buffer += payload.data.content
            transition(STREAM_STATUS.STREAMING)
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
        // 只有还在进行中的流才需要被 onclose 收尾，终态一律不动
        if (!isActive.value) return
        flush()
        transition(STREAM_STATUS.DONE)
      }
    }).catch(() => {
      // 中止与错误已由统一回调处理，这里只消费 Promise rejection
    }).finally(() => {
      if (currentGeneration !== generation) return
      if (isActive.value) {
        flush()
        transition(STREAM_STATUS.DONE)
      }
      if (controller === currentController) controller = null
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
    transition(STREAM_STATUS.ABORTED)
    handlers.onAbort?.(content.value)
    return true
  }

  // 静默中止：切换会话、卸载组件时用，不触发任何回调
  const abort = () => {
    // 已经是终态就没有需要中止的流，避免把 done/error 误改成 aborted
    if (!isActive.value) return

    const currentController = controller
    controller = null
    generation += 1
    discardBuffer()
    currentController?.abort()
    transition(STREAM_STATUS.ABORTED)
  }

  const reset = () => {
    abort()
    content.value = ''
    error.value = null
    // 硬重置是唯一绕过迁移表的路径，用于组件初始化
    status.value = STREAM_STATUS.IDLE
    handlers = {}
  }

  return {
    status,
    content,
    error,
    isActive,
    isSettled,
    start,
    stop,
    abort,
    reset
  }
}
