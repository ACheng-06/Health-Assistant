import { createRouter, createWebHistory } from 'vue-router'
import BackendLayout from '@/views/backend/BackendLayout.vue'
import AuthLayout from '@/views/auth/AuthLayout.vue'
import FrontendLayout from '@/views/frontend/FrontendLayout.vue'

const backendroutes = [
  {
    path: '/back',
    component: BackendLayout,
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/backend/dashboard/index.vue'),
        meta: {
          title: '数据分析',
          icon: 'PieChart',
        }
      }
      ,
      {
        path: 'knowledge',
        component: () => import('@/views/backend/knowledge/index.vue'),
        meta: {
          title: '知识文章',
          icon: 'ChatLineSquare',
        }
      }
      ,
      {
        path: 'consultations',
        component: () => import('@/views/backend/consultation/index.vue'),
        meta: {
          title: '咨询记录',
          icon: 'Message',
        }
      }
      ,
      {
        path: 'emotional',
        component: () => import('@/views/backend/emotional/index.vue'),
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
        component:()=>import('@/views/auth/login/index.vue'),
        meta:{
          title:'登入页'
        }
      },
      {
        path:'register',
        component:()=>import('@/views/auth/register/index.vue'),
        meta:{
          title:'注册页'
        }
      }
    ]
  }
]

const frontendroutes = [
  {
    path:'/',
    component: FrontendLayout,
    children: [
            {
                path: '',
                component: () => import('@/views/frontend/home/index.vue')
            },
            {
                path: 'consultation',
                component: () => import('@/views/frontend/consultation/index.vue')
            },
            {
                path: 'emotion-diary',
                component: () => import('@/views/frontend/emotion/index.vue')
            },
            {
                path: 'frontendKnowledge',
                component: () => import('@/views/frontend/knowledge/index.vue')
            },
            {
                path: 'knowledge/article/:id',
                component: () => import('@/views/frontend/knowledge/detail.vue'),
                props: true
            }
        ]
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes: [...backendroutes, ...frontendroutes]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
    if (token) {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
            if (to.path.startsWith('/auth')) {
                next(userInfo.userType == 2 ? '/back/dashboard' : '/')
                return
            }
            if (userInfo.userType == 2) {
                next()
            } else {
                to.path.startsWith('/back') ? next('/') : next()
            }
        } catch (error) {
            localStorage.clear()
            next('/auth/login')
        }
    } else {
        to.path.startsWith('/back') ? next('/auth/login') : next()
    }
})

export default router
