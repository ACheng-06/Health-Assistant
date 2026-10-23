import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  clearAuthStorage,
  getToken,
  getUserInfo,
  isAdminUser,
  setAuthStorage
} from '@/utils/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getToken())
  const userInfo = ref(getUserInfo())

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => isAdminUser(userInfo.value))

  const setAuth = (newToken, newUserInfo) => {
    setAuthStorage(newToken, newUserInfo)
    token.value = newToken || ''
    userInfo.value = newUserInfo || null
  }

  const logout = () => {
    clearAuthStorage()
    token.value = ''
    userInfo.value = null
  }

  // 与 localStorage 重新同步（例如请求拦截器清理登录态之后）
  const syncFromStorage = () => {
    token.value = getToken()
    userInfo.value = getUserInfo()
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    setAuth,
    logout,
    syncFromStorage
  }
})
