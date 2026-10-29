import { createRouter, createWebHistory } from 'vue-router'
import FrontendLayout from '@/views/frontend/FrontendLayout.vue'
import { getToken, getUserInfo, isAdminUser } from '@/utils/auth'
import { trackPageView } from '@/utils/analytics'

// 后台与认证布局改成按需加载：匿名访客打开前台页面时不再下载后台模块
const BackendLayout = () => import('@/views/backend/BackendLayout.vue')
const AuthLayout = () => import('@/views/auth/AuthLayout.vue')

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
    redirect:'/auth/login',
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
                component: () => import('@/views/frontend/consultation/index.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'emotion-diary',
                component: () => import('@/views/frontend/emotion/index.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'frontendKnowledge',
                component: () => import('@/views/frontend/knowledge/index.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'knowledge/article/:id',
                component: () => import('@/views/frontend/knowledge/detail.vue'),
                props: true,
                meta: { requiresAuth: true }
            }
        ]
  }
]


const router = createRouter({
  history: createWebHistory(),
  // 新页面回到顶部；浏览器前进/后退时恢复原位置；带锚点时滚到锚点
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
  routes: [
    ...backendroutes,
    ...frontendroutes,
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})

router.afterEach((to, from, failure) => {
  if (failure) return
  trackPageView(to)
})

router.beforeEach((to, from, next) => {
  const token = getToken()

  // 未登录：后台路由与前台受限页面统一跳登录，并记录来源方便登录后回跳
  if (!token) {
    if (to.path.startsWith('/back') || to.meta.requiresAuth) {
      next({
        path: '/auth/login',
        query: to.fullPath === '/' ? {} : { redirect: to.fullPath }
      })
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
