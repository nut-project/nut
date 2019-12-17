import Vue from 'vue'
import Router from 'vue-router'

Vue.use( Router )

export function createRouter () {
  return new Router( {
    mode: 'history',
    routes: [
      { path: '/', component: () => import( /* webpackChunkName: "home" */ './components/Home.vue' ) },
      { path: '/hello', component: () => import( /* webpackChunkName: "hello" */ './components/Hello.vue' ) },
    ]
  } )
}
