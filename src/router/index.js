import { createRouter, createWebHistory } from 'vue-router'
import BackendLayout from '@/components/BackendLayout.vue'
import AuthLayout from '@/components/AuthLayout.vue'
const backendroutes = [
  {
    path: '/back',
    component: BackendLayout,
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard.vue'),
        meta: {
          title: '数据分析',
          icon: 'PieChart',
        } 
      }
      ,
      {
        path: 'knowledge',
        component: () => import('@/views/knowledge.vue'),
        meta: {
          title: '知识文章',
          icon: 'ChatLineSquare',
        } 
      }
      ,
      {
        path: 'consultations',
        component: () => import('@/views/consultations.vue'),
        meta: {
          title: '咨询记录',
          icon: 'Message',  
        } 
      }
      ,
      {
        path: 'emotional',
        component: () => import('@/views/emotional.vue'),
        meta: {
          title: '情绪日志',
          icon: 'User',  
        } 
      }
    ],
  },
  {
    path:'/auth',
    component:AuthLayout,
    children:[
      {
        path:'login',
        component:()=>import('@/views/login.vue'),
        meta:{
          title:'登入页'
        }
      },
      {
        path:'register',
        component:()=>import('@/views/register.vue'),
        meta:{
          title:'注册页'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes:backendroutes
})

export default router
