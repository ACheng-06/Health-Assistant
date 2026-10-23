const normalizeBaseUrl = (url = '') => url.replace(/\/+$/, '')

// 接口请求前缀：开发环境走 Vite proxy，生产环境走网关/Nginx
export const apiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || '/api')

// 静态资源（封面等）服务地址
export const fileBaseUrl = normalizeBaseUrl(import.meta.env.VITE_FILE_BASE_URL || '')
