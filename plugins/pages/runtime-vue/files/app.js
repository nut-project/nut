import Vue from 'vue'
import createRouter from './router'
import App from './App.vue'
import context from '#context'

const mode = ( context.app.router && context.app.router.mode ) || 'history'
const routes = [
  { path: '/', component: () => import( /* webpackChunkName: "home" */ '@/pages/home.vue' ) },
  { path: '/hello', component: () => import( /* webpackChunkName: "hello" */ '@/pages/hello.vue' ) },
]

export default () => {
  const router = createRouter( {
    mode,
    routes,
  } )

  const app = new Vue( {
    router,
    render: h => h( App )
  } )

  return {
    app,
    router,
  }
}
