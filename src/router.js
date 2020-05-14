import Vue from 'vue'
import Router from 'vue-router'
import store from './store'
import Home from './views/Home'
import Logout from './components/Logout'
import Login from './views/Login'
import Register from './views/Register'
import About from './views/About'
import Account from './views/Account'
import ChangePassword from './views/ChangePassword'
import ImageTagging from './views/ImageTagging'
import Survey from './views/Survey'
import Customization from './views/Customization'
import Leaderboard from './views/Leaderboard'
import Gifting from './views/Gifting'
import Challenges from './views/Challenges'
import Badges from './views/Badges'
import EndSurvey from './views/EndSurvey'
import Completed from './views/Completed'
import logBuilder from './logBuilder'
import UserService from './services/UserService'

Vue.use(Router)

let router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { 
        guest: true
      }
    },
    {
      path: '/signup',
      name: 'Register',
      component: Register,
      meta: { 
        guest: true
      }
    },
    {
      path: '/logout',
      name: 'Logout',
      component: Logout,
      meta: { 
        guest: true
      }
    },
    {
      path: '/about',
      name: 'about',
      component: About,
      meta: {
        requiresAuth: true
      }
      // example of route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      //component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    },
    {
      path: '/account',
      name: 'Account',
      component: Account,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/changepassword',
      name: 'ChangePassword',
      component: ChangePassword,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/tagging',
      name: 'ImageTagging',
      component: ImageTagging,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/survey',
      name: 'Survey',
      component: Survey,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/customization',
      name: 'Customization',
      component: Customization,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/leaderboard',
      name: 'Leaderboard',
      component: Leaderboard,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/gifting',
      name: 'Gifting',
      component: Gifting,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/challenges',
      name: 'Challenges',
      component: Challenges,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/badges',
      name: 'Badges',
      component: Badges,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/endsurvey',
      name: 'EndSurvey',
      component: EndSurvey,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/completed',
      name: 'Completed',
      component: Completed,
      meta: {
        requiresAuth: true
      }
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {

  logBuilder.buildLog("pageView", to.name)

  if (to.name === 'ImageTagging'){
    if(store.state.user.usePowerUps()){
      let powerUpCount = UserService.getPowerUps(store.state.user).length

      logBuilder.buildLog("powerUpCount", powerUpCount)
    }
  }

  if (to.matched.some(record => record.meta.requiresAuth)) {
    // When the path requires authentication...
    if (!store.getters.isAuthenticated) {
      // ...redirects to login if the user is not authenticated
      next({
        path: '/login',
        params: { nextUrl: to.fullPath }
      })
    } else {
      // ...or allow access if the user is authenticated
      next()
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    // When the path requires guest user (i.e., not authenticated)
    if (!store.getters.isAuthenticated){
      // ...allow access if the user is not authenticated
      next()
    }
    else{
      // ...or redirect to Home if the user is authenticated
      next({ path: '/'})
    }
  } else {
    // Do nothing if the path does not have an authentication meta requirement
    next() 
  }
})

export default router