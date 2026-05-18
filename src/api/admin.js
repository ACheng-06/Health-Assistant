import service from '@/utils/request'
export function getLoginAPI(data){
  return service({
    url:'/user/login',
    method:'post',
    data
  })
}

export function getCategoryAPI(){
  return service({
    url:'/knowledge/category/tree',
    method:'get',  
  })
}