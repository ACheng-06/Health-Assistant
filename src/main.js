import { createApp } from 'vue'
import router from './router'
import App from './App.vue'
import './style.css'
import './styles/theme.css'
import { createPinia } from 'pinia'
import reveal from './directives/reveal'
import { ElLoading } from 'element-plus/es/components/loading/index.mjs'
// Element Plus 组件由 unplugin-vue-components 按需引入；
// 通过 JS 调用的 Message / MessageBox / Loading 指令需手动注册并引入样式
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/loading/style/css'

import * as Sentry from '@sentry/vue'

const app = createApp(App)

// 必须在 createApp 之后、mount 之前初始化：先有 app 实例，SDK 才能接管组件内的错误
Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,                          // 未配置时为 undefined，SDK 静默禁用
  environment: import.meta.env.MODE,                             // development / production 分开看
  sendDefaultPii: false,                                         // 不上报用户 IP、Cookie 等隐私字段
  integrations: [Sentry.browserTracingIntegration({ router })],   // 路由级性能追踪
  tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0              // 生产只采 20% 性能数据
})

// 设计令牌挂在 body.fe-theme 上，这里统一挂载：前台、认证页与后台共用同一套变量
document.body.classList.add('fe-theme')
// 注册 v-loading 指令，并保留全局 $loading 服务
app.use(ElLoading)
app.use(router)
app.use(createPinia())
app.directive('reveal', reveal)
app.mount('#app')
