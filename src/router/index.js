import { createRouter, createWebHistory } from 'vue-router'
import BackendLayout from '@/views/backend/BackendLayout.vue'
import AuthLayout from '@/views/auth/AuthLayout.vue'
import FrontendLayout from '@/views/frontend/FrontendLayout.vue'
import { getToken, getUserInfo, isAdminUser } from '@/utils/auth'

const backendroutes = [
  {
    path: '/back',
    component: BackendLayout,
    redirect: '/back/dashboard',
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
  routes: [
    ...backendroutes,
    ...frontendroutes,
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  const token = getToken()

  // 未登录：仅后台路由需要强制登录
  if (!token) {
    if (to.path.startsWith('/back')) {
      next('/auth/login')
    } else {
      next()
    }
    return
  }

  const userInfo = getUserInfo()

  // 已登录用户访问登录/注册页时，按角色回到各自的首页
  if (to.path.startsWith('/auth')) {
    next(isAdminUser(userInfo) ? '/back/dashboard' : '/')
    return
  }

  if (isAdminUser(userInfo)) {
    next()
    return
  }

  // 普通用户禁止访问后台
  if (to.path.startsWith('/back')) {
    next('/')
    return
  }

  next()
})

export default router
