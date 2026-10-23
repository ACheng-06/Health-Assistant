import service from '@/utils/request'
import { normalizePageParams } from '@/utils/pagination'

export function getCategoryTreeAPI() {
  return service.get('/knowledge/category/tree')
}

// 分页查询文章（前台知识库与后台文章管理共用）
export function getArticlePageAPI(params) {
  return service.get('/knowledge/article/page', { params: normalizePageParams(params) })
}

export function getArticleDetailAPI(id) {
  return service.get(`/knowledge/article/${id}`)
}

export function createArticleAPI(data) {
  return service.post('/knowledge/article', data)
}

export function updateArticleAPI(data) {
  return service.put(`/knowledge/article/${data.id}`, data)
}

export function changeArticleStatusAPI(id, data) {
  return service.put(`/knowledge/article/${id}/status`, data)
}

export function deleteArticleAPI(id) {
  return service.delete(`/knowledge/article/${id}`)
}

export function uploadFileAPI(file, { businessType = 'ARTICLE', businessId, businessField = 'cover' } = {}) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('businessType', businessType)
  formData.append('businessId', businessId)
  formData.append('businessField', businessField)
  return service.post('/file/upload', formData)
}
