import service from '@/utils/request'

export function loginAPI(data) {
  return service.post('/user/login', data)
}

export function registerAPI(data) {
  return service.post('/user/add', data)
}

export function logoutAPI() {
  return service.post('/user/logout')
}
