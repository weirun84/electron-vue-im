import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Char from "@/page/chat/chat.vue";
import Friend from "@/page/friend/friend.vue";
import Resume from "@/page/resume/resume.vue";
import Footer from "@/page/footer/footer.vue"; 
import LoginView from "@/page/login/Login.vue";
import Mycard from "@/components/mycard/mycard.vue";
import IndexView from "@/page/home/index.vue";
import Email from "@/page/email/email.vue";
import Msglog from "@/components/message/messageRecordNew.vue";
const router = new Router(
// 共三个页面： 聊天页面，好友页面，个人简历分别对应一下路由 
    // {routes}
     {
      routes :[
        {
          path: '/login',
          name: "login",
          component: LoginView,
          meta: { requiresAuth: false }
        },
        {
          path: '/',
          name: "index",
          component: IndexView,
          meta: { requiresAuth: true },
          children: [
            {
              path: '/mycard',
              name: 'mycard',
              component: Mycard, 
            },
            {
              path:'/chat',
              name:'chat',
              component: Char,
              meta: {
                keepAlive: false
              }
            },
            {
              path:'/friend',
              name:'friend',
              component: Friend,
              meta: {
                keepAlive:true
              }
            },
            {
              path:'/footer',
              name:'footer',
              component:Footer
            } ,
            {
              path:'/resume',
              name:'resume',
              component:Resume
            },
            {
              path: '/email',
              name: 'email',
              component: Email
            }
          ]
        },
         {
           path: '/msglog',
           name: 'msglog',
           component: Msglog,
         }
      ],
      linkActiveClass: 'active' 
     }
     
)
// 验证token，存在才跳转
router.beforeEach((to, from, next) => {
  let token = sessionStorage.getItem('token')
  if (to.path === '/') {
    if (!token) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  if (to.meta.requiresAuth) {
    if (token) {
      next()
    } else {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } else {
    next()
  }
})

export default router