import service from '@/utils/request'

export const getAnalyticsOverviewAPI = () => {
  return service.get('/data-analytics/overview')
}
