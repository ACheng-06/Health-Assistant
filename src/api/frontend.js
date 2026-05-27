import service from '@/utils/request'

export function getRegisterAPI(data){
  return service.post('/user/add',data) 
}

//启动咨询会话
export const startSessionAPI = (data) => {
    return service.post('/psychological-chat/session/start', data)
}

//分页查询接口
export const getSessionListAPI = (params) => {
    return service.get('/psychological-chat/sessions', { params })
}

//删除咨询会话
export const deleteSessionAPI = (sessionId) => {
    return service.delete(`/psychological-chat/sessions/${sessionId}`)
}

//获取会话列表
export const getSessionDetailAPI = (sessionId) => {
    return service.get(`/psychological-chat/sessions/${sessionId}/messages`)
}

//获取会话情绪分析结果
export const getSessionEmotionAPI = (sessionId) => {
    return service.get(`/psychological-chat/session/${sessionId}/emotion`)
}

//情绪接口
export const addEmotionDiaryAPI = (data) => {
    return service.post('/emotion-diary', data)
}

//查询知识列表接口
export const getKnowledgeListAPI = (params) => {
    return service.get('/knowledge/article/page', { params })
}

//获取知识文章详情
export const getKnowledgeDetailAPI = (articleId) => {
    return service.get(`/knowledge/article/${articleId}`)
}
