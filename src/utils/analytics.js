/**
 * 轻量埋点：业务自定义事件 + 可选上报到自建接口。
 * 未配置 VITE_ANALYTICS_ENDPOINT 时不发请求，只在 DEV 打 console。
 * 注意：不要上报密码、聊天正文、日记内容等敏感字段。
 */

const RAW_ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT?.trim()

// 差异 1：相对地址归一化。
// history 模式下 sendBeacon('/api/x') 会以当前页面路径为基准，
// 在 /knowledge/article/1 里会变成 /knowledge/article/api/x。
// 绝对地址传给 new URL 不会被改写，所以两种写法都安全。
const ENDPOINT = RAW_ENDPOINT ? new URL(RAW_ENDPOINT, window.location.origin).href : ''

function sendPayload(payload) {
  if (!ENDPOINT) return
  try {
    const json = JSON.stringify(payload)
    // text/plain 属于 CORS 安全类型，不触发预检，beacon 才能真正一次发完
    if (navigator.sendBeacon?.(ENDPOINT, json)) return
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: json,
      keepalive: true
    }).catch(() => {})
  } catch {
    /* 埋点绝不能影响业务流程 */
  }
}

export function track(event, props = {}, path = window.location.pathname) {
  const payload = {
    event,
    props,
    path,
    ts: Date.now()
  }
  if (import.meta.env.DEV) console.log('[analytics]', payload)
  sendPayload(payload)
}

// ── 页面停留时长 ─────────────────────────────────────
// 状态放在模块级而不是组件里：停留时长是路由级概念，与具体页面组件无关
let pageEnterTs = 0
let pagePath = ''

// 结算当前页。幂等靠"清零"实现：重复调用时 pageEnterTs 已是 0，直接返回
function endPageView() {
  if (!pageEnterTs) return

  const duration = Date.now() - pageEnterTs
  const path = pagePath

  pageEnterTs = 0
  pagePath = ''

  // duration_ms 而不是 duration：单位写进字段名，避免半年后有人当成秒
  track('page_leave', { duration_ms: duration }, path)
}

export function trackPageView(to) {
  // 先结算上一个页面，再开始新页面计时
  endPageView()

  pageEnterTs = Date.now()
  pagePath = to.path

  track('page_view', {
    route_name: to.name ?? '',
    path: to.path,
    title: typeof to.meta?.title === 'string' ? to.meta.title : ''
  })
}

// 真正关闭/刷新标签页时结算。此刻页面正在销毁，
// 任何异步请求都会丢——只有 beacon 发得出去
window.addEventListener('pagehide', () => endPageView())