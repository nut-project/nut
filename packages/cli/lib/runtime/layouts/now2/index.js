/* global window, document */

import Regular from 'regularjs'
import styles from './index.module.less'
import NProgress from 'nprogress'
import './nprogress.css'

const Layout = Regular.extend( {
  template: `
    <div class="${ styles.progress_container }">
      <div class="${ styles.progress_container__inner }" id="nut-now2-layout-progress"></div>
    </div>
    <div class="${ styles.header }">
      <div class="${ styles.header__content }">
        <div class="${ styles.title }" on-click="{ this.onHome() }">
          {#if ctx.app.logo}
            <img class="${ styles.logo }" src="{ ctx.app.logo }" alt="" />
          {/if}

          <div>{ ctx.app.zh | uppercase }</div>
        </div>
        <div class="${ styles.sidebar }">
          {#list ctx.api.sidebar.get() as item}
            <a
              href="javascript:;"
              on-click="{ this.onRoute( item ) }"
              class="${ styles.sidebar__item } { item.active ? '${ styles.is_active }' : '' }"
            >
              { item.title }
            </a>
          {/list}
        </div>
      </div>
    </div>

    <div class="${ styles.main }">
      <div class="${ styles.main__content }">
        <aside class="${ styles.navbar }">
          <div class="${ styles.navbar__scroller }">
            {#list currentPages as page}
              {#if page.title}
                <a
                  href="javascript:;"
                  on-click="{ this.onToggleOpen( page ) }"
                  class="${ styles.navbar__title } { page.active ? '${ styles.is_active }' : '' } { this.getOpenState( page ) ? '${ styles.is_open }' : '' }"
                >
                  <i class="icon nut-icons nut-icon-right ${ styles.navbar__icon }"></i>
                  { page.title }
                </a>

                {#if this.getOpenState( page ) && page.children && page.children.length > 0}
                  <ul class="${ styles.link__items }">
                    {#list page.children as child}
                    <li>
                      <a
                        href="javascript:;"
                        on-click="{ this.onRoute( child.page ) }"
                        class="${ styles.link__item } { child.active ? '${ styles.is_active }' : '' }"
                      >
                        { child.title }
                      </a>
                    </li>
                    {/list}
                  </ul>
                {/if}

              {/if}
            {/list}
          </div>
        </aside>

        {#if this.getActivePage( currentPages ).page.type === 'markdown'}
          <div class="${ styles.content }">
            <div
              class="${ styles.markdown } markdown-body"
              ref="$$mount"
            ></div>
          </div>
        {#else}
          <div class="${ styles.content }">
            <div ref="$$mount"></div>
          </div>
        {/if}
      </div>
    </div>
  `,

  computed: {
    currentPages() {
      return this.getCurrentPages()
    },
  },

  getOpenState( page ) {
    return typeof page.open === 'undefined' ?
      page.active :
      page.open
  },

  onToggleOpen( page ) {
    page.open = !this.getOpenState( page )
  },

  getActivePage( pages ) {
    let found

    walkChildren( pages, null, child => {
      if ( child.page && child.active ) {
        found = child
      }
    } )

    return found || {}
  },

  getCurrentPages() {
    if ( !this.data.ctx ) {
      return []
    }

    const sidebar = this.data.ctx.api.sidebar.get()
    const found = sidebar.find( s => s.active )

    if ( !found ) {
      return []
    }

    return found.children || []
  },

  onHome() {
    this.data.ctx.api.router.push( '/' )
  },

  onRoute( item ) {
    if ( item && item.route ) {
      this.data.ctx.api.router.push( item.route )
      return
    }

    if ( item && item.link ) {
      window.open( item.link )
    }
  },
} )

function walkChildren( children, parent, callback ) {
  if ( !children ) {
    return
  }

  if ( Array.isArray( children ) ) {
    children.forEach( ( v, i ) => {
      callback( v, i, parent )

      if ( Array.isArray( v.children ) ) {
        walkChildren( v.children, v, callback )
      }
    } )
  }
}

Layout.filter( 'uppercase', v => v && v.toUpperCase() )

export default {
  name: 'layout-now2',

  type: 'layout',

  async apply( ctx ) {
    let layout = null

    const progressElId = 'nut-now2-layout-progress'

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
      name: 'now2',

      mount( node ) {
        if ( !layout ) {
          layout = new Layout( {
            data: { ctx },
          } )
        }

        layout.$inject( node )
      },

      unmount() {
        if ( !layout ) {
          return
        }

        layout.$inject( false )
      },

      update( data = {} ) {
        if ( !layout ) {
          return
        }

        layout.data.ctx = data.ctx
        layout.$update()
      },

      getMountNode() {
        return layout && layout.$refs.$$mount
      },
    } )
  }
}
