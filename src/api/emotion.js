import service from '@/utils/request'

// 新增情绪日记
export const addEmotionDiaryAPI = (data) => {
  return service.post('/emotion-diary', data)
}

// 后台分页查询情绪日记
export const getEmotionDiaryPageAPI = (params) => {
  return service.get('/emotion-diary/admin/page', { params })
}

// 后台删除情绪日记
export const deleteEmotionDiaryAPI = (id) => {
  return service.delete(`/emotion-diary/admin/${id}`)
}
