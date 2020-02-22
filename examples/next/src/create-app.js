import Vue from 'vue'
import App from './App.vue'
import { createRouter } from './router'

export function createApp () {
  const router = createRouter()

  const foo = ({ a = 1 }, b = 2, ...args) => [a,b,args];
  console.log(foo);

  console.log( HELLO );

  const app = new Vue( {
    router,
    render: h => h(App)
  } )

  return { app, router }
}
