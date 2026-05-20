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

export function getArticlePageAPI(params){  
  return service({
    url:'/knowledge/article/page',
    method:'get',
    params
  })
}

export function uploadFileAPI(file, businessInfo){  
  const formData = new FormData()
    formData.append('file', file)
    formData.append('businessType', 'ARTICLE') 
    formData.append('businessId', businessInfo.businessId)
    formData.append('businessField', 'cover')
  return service({
    url:'/file/upload',
    method:'post',
    data: formData
  })
} 

export function createArticleAPI(data){
  return service({
    url:'/knowledge/article',
    method:'post',
    data
  })
}

export function updateArticleAPI(data){
  return service({
    url:`/knowledge/article/${data.id}`,
    method:'put', 
    data
  })  
}



