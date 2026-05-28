import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const service = axios.create({
  baseURL: '/api',
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

//响应拦截器
service.interceptors.response.use(
  response => {
        const { data, config } = response
        // 1. 处理业务成功状态码 (兼容数字和字符串)
        if (data.code === 200 || data.code === '200') {
            return data.data // 直接返回核心数据，简化前端处理
        } else {
            // 2. 处理登录过期
            // 只有 code 为 401，或者 code 为 -1 且包含“登录”字样时才判定为过期
            const isTokenExpired = data.code === 401 || data.code === '401' || (data.code === '-1' && data.msg?.includes('登录'))

            if (isTokenExpired) {
                if (!config.url?.includes('/login')) {
                    ElMessage.error(data.msg || '登录过期，请重新登录')
                    localStorage.removeItem('token')
                    localStorage.removeItem('userInfo')
                    window.location.href = '/auth/login' // 使用绝对路径
                }
                return Promise.reject('Token Expired')
            } else {
                // 3. 普通业务错误只弹窗，不踢人
                ElMessage.error(data.msg || '系统错误')
                return Promise.reject(data.msg || 'error')
            }
        }
    },
    (error) => {
        ElMessage.error('网络请求失败')
        return Promise.reject(error)
    }    
)

export default service
