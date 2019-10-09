/* global window, localStorage */

import Regular from 'regularjs'
import styles from './index.module.less'

const Layout = Regular.extend( {
  template: `
    <div class="${ styles.header }" style="{ collapsed ? 'left: 0;' : '' }">
      <div class="${ styles.collapse }" on-click="{ this.onToggleCollapse() }">
        <i class="nut-icons nut-icon-{ collapsed ? 'indent' : 'outdent' }"></i>
      </div>

      <ul class="${ styles.actions }">
        {#if ctx.user && ctx.user.nickname}
        <li class="${ styles.action_user }">
          <i style="margin-right: 2px;" class="nut-icons nut-icon-user"></i>
          { ctx.user.nickname }

          <ul class="${ styles.user_menu }">
            <li class="${ styles.user_menu__item }" on-click="{ this.onLogout() }">退出</li>
          </ul>
        </li>
        {/if}
      </ul>
    </div>

    <div class="${ styles.sidebar }" style="{ collapsed ? 'width: 0;' : '' }">
      <div class="${ styles.title }">
        {#if ctx.app.logo}
          <img class="${ styles.logo }" src="{ ctx.app.logo }" alt="" />
        {/if}

        <div>{ ctx.app.zh }</div>
      </div>

      <div class="${ styles.menu }">
        {#list ctx.api.sidebar.get() as item}
          {#if item.children && item.children.length > 0}
            <a
              {#if item.link}
              href="{ item.link }"
              target="_blank"
              {#else}
              href="javascript:;"
              on-click="{ item.open = !item.open }"
              {/if}
              class="${ styles.sidebar__title } { item.active ? '${ styles.is_active }' : '' }"
            >
              <i class="${ styles.sidebar__icon } nut-icons nut-icon-{ item.icon }"></i>
              <span>{ item.title }</span>
              {#if !item.link}
              <div class="${ styles.sidebar__arrow_container }">
                <i class="${ styles.sidebar__arrow } nut-icons nut-icon-down { item.open ? '${ styles.is_open }' : '' }"></i>
              </div>
              {/if}
            </a>

            <ul class="${ styles.sidebar__items }" r-style="{ { height: item.open ? item.children.length * 50 + 'px' : '0' } }">
              {#list item.children as page}
                {#if page.title}
                  <li class="${ styles.sidebar__item } { page.active ? '${ styles.is_active }' : '' }">
                    <a
                      href="javascript:;"
                      on-click="{ this.onRoute( page.page ) }"
                      class="${ styles.sidebar__link }"
                    >
                      { page.title }
                    </a>
                  </li>
                {/if}
              {/list}
            </ul>

          {#else}
            {#if item.title}
              <ul class="${ styles.sidebar__items }">
                <li class="${ styles.sidebar__item } { item.active ? '${ styles.is_active }' : '' }">
                  <a
                    href="javascript:;"
                    on-click="{ this.onRoute( item.page ) }"
                    class="${ styles.sidebar__link }"
                    style="padding-left: 20px;"
                  >
                    <i class="${ styles.sidebar__icon } nut-icons nut-icon-{ item.icon }"></i>
                    { item.title }
                  </a>
                </li>
              </ul>
            {/if}

          {/if}
        {/list}
      </div>

    </div>

    <div class="${ styles.main }" style="{ collapsed ? 'margin-left: 0;' : '' }">
      <div class="${ styles.main__content }">
        {#if options.showBreadcrumb}
          <ul class="${ styles.breadcrumbs }">
            <li class="${ styles.breadcrumbs__item }">
              <a href="javascript:;" on-click="{ this.onPush( '/' ) }">首页</a>
            </li>
            {#list activePaths as path}
              {#if path.page}
                <li class="${ styles.breadcrumbs__item } ${ styles.is_sep }">
                  /
                </li>
                <li class="${ styles.breadcrumbs__item } { path_index === activePaths.length - 1 ? '${ styles.is_current }' : '' }">
                  <a href="javascript:;" on-click="{ this.onPush( path.page.route ) }">{ path.title }</a>
                </li>
              {/if}
            {/list}
          </ul>
        {/if}
        {#if currentPage && currentPage.type === 'markdown'}
          <div
            class="${ styles.markdown } markdown-body"
            ref="$$mount"
          ></div>
        {#else}
          <div class="${ styles.content }">
            <div ref="$$mount"></div>
          </div>
        {/if}
      </div>
    </div>
  `,

  computed: {
    currentPage() {
      return this.data.ctx.pages.find( page => page.active )
    },
    activePaths() {
      return this.data.ctx.api.sidebar.trace()
    },
  },

  config() {
    const collapsed = localStorage.getItem( '_nut_layout_kaola_collapsed' )
    this.data.collapsed = collapsed === '1'
  },

  getCollapsed() {
    return this.data.collapsed
  },

  setCollapsed( bool ) {
    this.data.collapsed = bool

    if ( bool ) {
      localStorage.setItem( '_nut_layout_kaola_collapsed', '1' )
      this.$emit( 'collapse' )
    } else {
      localStorage.setItem( '_nut_layout_kaola_collapsed', '0' )
      this.$emit( 'uncollapse' )
    }
  },

  onToggleCollapse() {
    this.data.collapsed = !this.data.collapsed
    this.setCollapsed( this.data.collapsed )
  },

  onRoute( item ) {
    if ( item.route ) {
      this.data.ctx.api.router.push( item.route )
      return
    }

    if ( item.link ) {
      window.open( item.link )
    }
  },

  onPush( route ) {
    if ( !route ) {
      return
    }

    this.data.ctx.api.router.push( route )
  },

  onLogout() {
    this.$emit( 'logout' )
  },
} )

export default async function( ctx, options = {} ) {
  let layout = null

  await ctx.api.layout.register( {
    name: 'kaola',

    mount( node, { ctx } ) {
      if ( !layout ) {
        const sidebar = ctx.api.sidebar.get()

        sidebar.forEach( s => {
          s.open = s.active
        } )

        layout = new Layout( {
          data: {
            ctx,
            options,
          }
        } )

        layout.$on( 'logout', () => {
          ctx.events.emit( 'layout:logout' )
        } )

        layout.$on( 'collapse', () => {
          ctx.events.emit( 'layout:collapse' )
        } )

        layout.$on( 'uncollapse', () => {
          ctx.events.emit( 'layout:uncollapse' )
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
