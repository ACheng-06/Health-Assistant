import axios from 'axios'
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
        ElMessage.error(data.msg || '系统错误')
        return Promise.reject(new Error(data.msg || '系统错误'))
    },
    (error) => {
        const status = error.response?.status
        const serverMsg = error.response?.data?.msg || error.response?.data?.message

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
