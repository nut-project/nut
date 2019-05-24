import Vue from 'vue'

export default function ( Page ) {
  Page.$$nut = ctx => {
    let instance
    let el

    if ( !Vue.prototype.$ctx ) {
      Vue.prototype.$ctx = ctx
    }

    const definition = {
      mount( node ) {
        if ( !instance ) {
          Vue.config.devtools = process.env.NODE_ENV === 'development'

          instance = new Vue( Page )

          if ( window.__VUE_DEVTOOLS_GLOBAL_HOOK__ ) {
            window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = instance.constructor
          }
        }

        if ( !el ) {
          el = document.createElement( 'div' )
          node.appendChild( el )
          instance.$mount( el )
        } else {
          node.appendChild( instance.$el )
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
      definition.beforeEnter = ( ctx ) => {
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
