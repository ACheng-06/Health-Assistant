import service from '@/utils/request'

export function getRegisterAPI(data){
  return service.post('/user/add',data) 
}