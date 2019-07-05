/* global window, document */

import Regular from 'regularjs'
import NProgress from 'nprogress'
import Headroom from 'headroom.js'
import styles from './index.module.less'
import headroomStyles from './headroom.module.less'
import './nprogress.css'

const NavItem = Regular.extend( {
  template: `
    {#if page.children && page.children.length > 0}
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
          <li class="${ styles.link__wrapper }">
            <nav-item
              page="{ child }"
              on-route="{ this.onRoute( $event ) }"
            ></nav-item>
          </li>
          {/list}
        </ul>
      {/if}
    {#else}
      <a
        href="javascript:;"
        on-click="{ this.onRoute( page.page ) }"
        class="${ styles.link__item } { page.active ? '${ styles.is_active }' : '' }"
      >
        { page.title }
      </a>
    {/if}
  `,
  getOpenState( page ) {
    return typeof page.open === 'undefined' ?
      page.active :
      page.open
  },

  onToggleOpen( page ) {
    page.open = !this.getOpenState( page )
  },

  onRoute( page ) {
    this.$emit( 'route', page )
  },
} )

NavItem.component( 'nav-item', NavItem )

const Layout = Regular.extend( {
  template: `
    <div class="${ styles.progress_container }">
      <div class="${ styles.progress_container__inner }" id="nut-now2-layout-progress"></div>
    </div>
    <div ref="header" class="${ styles.header } ${ headroomStyles.unpinned }">
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
        <aside class="${ styles.navbar } { headPinned ? '${ styles.is_head_pinned }' : '' }">
          <div class="${ styles.navbar__scroller }">
            {#list currentPages as page}
              <nav-item
                page="{ page }"
                on-route="{ this.onRoute( $event ) }"
              ></nav-item>
            {/list}
          </div>
        </aside>

        {#if this.getActivePage( currentPages ).page.type === 'markdown'}
          <div class="${ styles.content } DocSearch-content">
            <div
              class="${ styles.markdown } markdown-body"
              ref="$$mount"
            ></div>
          </div>
        {#else}
          <div class="${ styles.content } DocSearch-content">
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

  config() {
    this.data.headPinned = false
  },

  init() {
    setTimeout( () => {
      const headroom = new Headroom( this.$refs.header, {
        classes: headroomStyles,
        onPin: () => {
          this.data.headPinned = true
          this.$update()
        },
        onUnpin: () => {
          this.data.headPinned = false
          this.$update()
        },
      } )

      headroom.init()

      // update headroom state manually
      if ( headroom.getScrollY() === 0 ) {
        headroom.pin()
      }

      setTimeout( () => {
        this.$refs.header.classList.add( headroomStyles.transition )
      }, 10 )
    }, 0 )
  },

  onRoute( page ) {
    if ( page && page.route ) {
      this.data.ctx.api.router.push( page.route )
      return
    }

    if ( page && page.link ) {
      window.open( page.link )
    }
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
Layout.component( 'nav-item', NavItem )

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

          ctx.events.on( 'page:after-mount', () => {
            window.scrollTo( 0, 0 )

            const sidebar = ctx.api.sidebar.get()
            if ( sidebar && sidebar.length > 0 ) {
              // reset when route change
              sidebar.forEach( s => {
                if ( s.children && s.children.length > 0 ) {
                  s.children.forEach( c => {
                    c.open = void 0
                  } )
                }
              } )
              layout.$update()
            }
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
