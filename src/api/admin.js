import service from '@/utils/request'
export function getLoginAPI(data){
  return service.post('/user/login',data) 
}

export function getCategoryAPI(){
  return service.get('/knowledge/category/tree')  
}

export function getArticlePageAPI(params){  
  return service.get('/knowledge/article/page',{
    params
  })
}

export function uploadFileAPI(file, businessInfo){  
  const formData = new FormData()
    formData.append('file', file)
    formData.append('businessType', 'ARTICLE') 
    formData.append('businessId', businessInfo.businessId)
    formData.append('businessField', 'cover')
  return service.post('/file/upload', formData)   
} 

export function createArticleAPI(data){
  return service.post('/knowledge/article',data)
}

export function updateArticleAPI(data){
  return service.put(`/knowledge/article/${data.id}`,data)  
}

export function getArticleDetailAPI(id){
  return service.get(`/knowledge/article/${id}`)  
} 

export function changeArticleStatusAPI(id,data){
  return service.put(`/knowledge/article/${id}/status`,data)
}

export function deleteArticleAPI(id){
  return service.delete(`/knowledge/article/${id}`)
} 

export function getConsultationPageAPI(params){
  return service.get('/psychological-chat/sessions',{
    params
  })
}

export function getSessionDetailAPI(sessionId){
  return service.get(`/psychological-chat/sessions/${sessionId}/messages`)
}

export function getEmotionalPageAPI(params){
  return service.get('/emotion-diary/admin/page',{
    params
  })
}

export function deleteEmotionalAPI(id){ 
  return service.delete(`/emotion-diary/admin/${id}`)
}

export function getAnalyticsOverviewAPI(){
  return service.get('/data-analytics/overview')
} 

