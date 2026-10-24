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

const app = createApp(App)
// 设计令牌挂在 body.fe-theme 上，这里统一挂载：前台、认证页与后台共用同一套变量
document.body.classList.add('fe-theme')
// 注册 v-loading 指令，并保留全局 $loading 服务
app.use(ElLoading)
app.use(router)
app.use(createPinia())
app.directive('reveal', reveal)
app.mount('#app')
