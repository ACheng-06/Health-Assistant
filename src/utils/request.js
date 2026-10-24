import axios from 'axios'
import * as Sentry from '@sentry/vue'
import { ElMessage } from 'element-plus/es/components/message/index.mjs'
import router from '@/router'
import { clearAuthStorage } from '@/utils/auth'
import { apiBaseUrl } from '@/config'
import { useAuthStore } from '@/store/auth'

const service = axios.create({
  baseURL: apiBaseUrl,
  timeout: 5000
})


//请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    // 例如：添加 token 到请求头
    const token=localStorage.getItem('token')
    if(token){
      config.headers['token']=token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

const isLoginRequest = (url = '') => url.includes('/login')

// 接口错误上报：只上报"系统没按预期工作"的情况。
// 业务校验失败（密码错误、邮箱已注册）属于预期内的高频事件，上报会淹没真正的 bug，
// 这类只在响应拦截器里留一条面包屑。
const reportApiError = (error, config = {}) => {
    // 主动取消的请求不是错误（用户切页面、组件卸载都可能触发）
    if (error.code === 'ERR_CANCELED') return

    const url = config.url || error.config?.url || ''
    const status = error.response?.status
    // 登录态过期属于正常业务流程，不当作异常
    if (status === 401) return

    Sentry.captureException(error, {
        level: status >= 500 || !status ? 'error' : 'warning',
        tags: {
            api: url,
            http_status: status ? String(status) : 'network_error'
        },
        // 只带后端返回的提示文案，不上报请求体/响应体，避免把用户隐私送进监控系统
        extra: {
            server_msg: error.response?.data?.msg || error.response?.data?.message
        }
    })
}

// 并发请求同时返回登录过期时，只处理一次，避免重复弹窗与重复跳转
let lastTokenExpiredAt = 0

const handleTokenExpired = (msg) => {
    const now = Date.now()
    if (now - lastTokenExpiredAt < 1500) return
    lastTokenExpiredAt = now

    clearAuthStorage()
    // 同步 Pinia，否则导航栏等依赖 store 的地方仍显示已登录
    try {
        useAuthStore().syncFromStorage()
    } catch (e) {
        // pinia 尚未安装时（应用启动前的请求）忽略
    }
    ElMessage.error(msg || '登录过期，请重新登录')
    router.push('/auth/login')
}

//响应拦截器
service.interceptors.response.use(
    response => {
        const { data, config } = response
        // 1. 处理业务成功状态码 (兼容数字和字符串)
        if (data.code === 200 || data.code === '200') {
            return data.data // 直接返回核心数据，简化前端处理
        }

        // 2. 处理登录过期：业务错误统一在这里提示，页面内不要重复弹窗
        const isTokenExpired = data.code === 401 || data.code === '401' || (data.code === '-1' && data.msg?.includes('登录'))

        if (isTokenExpired) {
            if (!isLoginRequest(config.url)) {
                handleTokenExpired(data.msg)
            }
            return Promise.reject(new Error(data.msg || '登录已过期'))
        }

        // 3. 普通业务错误只弹窗，不踢人
        // 业务校验失败不进 Sentry issue，只留面包屑，排查时能看到"用户当时做了什么"
        Sentry.addBreadcrumb({
            category: 'api',
            level: 'info',
            message: `业务错误 code=${data.code} ${config.url || ''}`,
            data: { code: data.code, msg: data.msg }
        })
        // 但业务码为 500 时说明服务端内部出错，这才是真 bug，需要上报
        if (data.code === 500 || data.code === '500') {
            Sentry.captureException(new Error(data.msg || '服务端业务异常'), {
                tags: { api: config.url || '', biz_code: String(data.code) }
            })
        }
        ElMessage.error(data.msg || '系统错误')
        return Promise.reject(new Error(data.msg || '系统错误'))
    },
    (error) => {
        const status = error.response?.status
        const serverMsg = error.response?.data?.msg || error.response?.data?.message

        reportApiError(error, error.config)

        // HTTP 层 401 同样按登录过期处理
        if (status === 401 && !isLoginRequest(error.config?.url)) {
            handleTokenExpired(serverMsg)
            return Promise.reject(error)
        }

        if (error.code === 'ECONNABORTED') {
            ElMessage.error('请求超时，请稍后重试')
        } else {
            ElMessage.error(serverMsg || '网络请求失败')
        }
        return Promise.reject(error)
    }
)

export default service
