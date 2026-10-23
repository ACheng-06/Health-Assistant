import service from '@/utils/request'

// 启动咨询会话
export const startSessionAPI = (data) => {
  return service.post('/psychological-chat/session/start', data)
}

// 分页查询会话（前台会话列表与后台咨询记录共用）
export const getSessionPageAPI = (params) => {
  return service.get('/psychological-chat/sessions', { params })
}

// 删除咨询会话
export const deleteSessionAPI = (sessionId) => {
  return service.delete(`/psychological-chat/sessions/${sessionId}`)
}

// 获取会话消息
export const getSessionMessagesAPI = (sessionId) => {
  return service.get(`/psychological-chat/sessions/${sessionId}/messages`)
}

// 获取会话情绪分析结果
export const getSessionEmotionAPI = (sessionId) => {
  return service.get(`/psychological-chat/session/${sessionId}/emotion`)
}
