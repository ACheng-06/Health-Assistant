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
    // 对响应数据做点什么
    const {data,config}=response
    // 例如：判断响应状态码是否为 200
    if(data.code===200){
      return data.data
    }else{
      if(data.code==='-1'){
        if(!config.url?.includes('token')){ 
          ElMessage.error(data.msg || '登录过期，请重新登录')
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          router.push('/auth/login')
         }else{
          return Promise.reject('网络请求失败...')
         }
      }
    }
    return response
  },
  error => {
    // 对响应错误做点什么
    return Promise.reject(error)
  }
)

export default service
