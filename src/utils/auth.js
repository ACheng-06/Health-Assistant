const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'

// 后台管理员的用户类型
const ADMIN_USER_TYPE = '2'

export const getToken = () => localStorage.getItem(TOKEN_KEY) || ''

export const getUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_INFO_KEY) || 'null')
  } catch (e) {
    return null
  }
}

export const isAdminUser = (userInfo = getUserInfo()) => String(userInfo?.userType) === ADMIN_USER_TYPE

export const setAuthStorage = (token, userInfo) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }

  if (userInfo) {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
  } else {
    localStorage.removeItem(USER_INFO_KEY)
  }
}

export const clearAuthStorage = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_INFO_KEY)
}
