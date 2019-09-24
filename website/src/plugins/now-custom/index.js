import Vue from 'vue'
import NProgress from 'nprogress'
import Layout from './now-custom-layout'

export default {
  name: 'layout-now',

  type: 'layout',

  async apply( ctx ) {
    let layout = null
    let el = null

    const progressElId = 'nut-now-layout-progress'

    ctx.api.router.beforeEach( function ( { next } ) {
      const $progress = document.getElementById( progressElId )

      if ( $progress ) {
        NProgress.configure( {
          parent: '#' + progressElId
        } )
        NProgress.start()
      }

      next()
    } )

    ctx.api.router.afterEach( function () {
      const $progress = document.getElementById( progressElId )

      if ( $progress ) {
        NProgress.configure( {
          parent: '#' + progressElId
        } )
        NProgress.done()
      }
    } )

    await ctx.api.layout.register( {
      name: 'now-custom',

      mount( node ) {
        if ( !layout ) {
          Vue.config.devtools = process.env.NODE_ENV === 'development'

          const Ctor = Vue.extend( Layout )

          layout = new Ctor( {
            propsData: {
              $ctx: ctx,
            }
          } )

          if ( window.__VUE_DEVTOOLS_GLOBAL_HOOK__ ) {
            window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = layout.constructor
          }
        }

        if ( el ) {
          node.appendChild( layout.$el )
        } else {
          el = document.createElement( 'div' )
          node.appendChild( el )
          layout.$mount( el )
        }
      },

      unmount( node ) {
        if ( !layout ) {
          return
        }

        if ( layout.$el && ( layout.$el.parentNode === node ) ) {
          node.removeChild( layout.$el )
        }
      },

      update( data = {} ) {
        if ( !layout ) {
          return
        }

        if ( data.ctx ) {
          layout.$ctx = data.ctx
        }
        layout.$forceUpdate()
      },

      getMountNode() {
        return layout && layout.$refs.mount
      },
    } )
  }
}
