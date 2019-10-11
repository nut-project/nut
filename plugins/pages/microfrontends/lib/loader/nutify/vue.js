/* global window, document */

import Vue from 'vue'

// inject $ctx
Vue.mixin( {
  beforeCreate() {
    const options = this.$options

    if ( options.ctx ) {
      this.$ctx = options.ctx
    } else if ( options.parent && options.parent.$ctx ) {
      this.$ctx = options.parent.$ctx
    }
  }
} )

// inject $route
Vue.mixin( {
  beforeCreate() {
    const options = this.$options

    if ( options.route ) {
      this.$route = options.route
    } else if ( options.parent && options.parent.$route ) {
      this.$route = options.parent.$route
    }
  }
} )

export default function ( all = {} ) {
  const Page = all.default || {}
  const attributes = all.attributes || {}

  Page.$$nut = ctx => {
    let instance
    let el

    const definition = {
      attributes,

      mount( node ) {
        if ( !instance ) {
          Vue.config.devtools = process.env.NODE_ENV === 'development'

          const Ctor = Vue.extend( Page )
          instance = new Ctor( {
            ctx,
            route: ctx.route || {},
          } )

          if ( window.__VUE_DEVTOOLS_GLOBAL_HOOK__ ) {
            window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = instance.constructor
          }
        }

        if ( el ) {
          node.appendChild( instance.$el )
        } else {
          el = document.createElement( 'div' )
          node.appendChild( el )
          instance.$mount( el )
        }
      },

      unmount( node ) {
        if ( !instance ) {
          return
        }

        if ( instance.$el && ( instance.$el.parentNode === node ) ) {
          node.removeChild( instance.$el )
        }
      },

      destroy() {
        if ( !instance ) {
          return
        }

        instance.$destroy()
        instance = null
        el = null
      },
    }

    if ( Page.beforeEnter ) {
      definition.beforeEnter = ctx => {
        const oldnext = ctx.next

        ctx.next = function ( v ) {
          if ( typeof v === 'function' ) {
            return oldnext( () => {
              return v.call( instance, instance )
            } )
          }

          return oldnext( v )
        }

        return Page.beforeEnter( ctx )
      }
    }

    if ( Page.enter ) {
      definition.enter = ( ...args ) => {
        return Page.enter.call( instance, ...args )
      }
    }

    if ( Page.beforeLeave ) {
      definition.beforeLeave = ( ...args ) => {
        return Page.beforeLeave.call( instance, ...args )
      }
    }

    if ( Page.leave ) {
      definition.leave = ( ...args ) => {
        return Page.leave.call( instance, ...args )
      }
    }

    return definition
  }

  return Page
}
