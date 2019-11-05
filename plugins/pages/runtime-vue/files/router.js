import Vue from 'vue'
import Router from 'vue-router'

Vue.use( Router )

export function createRouter( { mode, routes } = {} ) {
  return new Router( {
    mode,
    routes,
  } )
}
