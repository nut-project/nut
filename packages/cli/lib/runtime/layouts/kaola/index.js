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

          {#if item.children && item.children.length > 0}
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
          {/if}
        {/list}
      </div>

    </div>

    <div class="${ styles.main }" style="{ collapsed ? 'margin-left: 0;' : '' }">
      <div class="${ styles.main__content }">
        {#if this.getActivePage( currentPages ).page.type === 'markdown'}
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
    currentPages() {
      return this.getCurrentPages()
    },
  },

  config() {
    const collapsed = localStorage.getItem( '_nut_layout_kaola_collapsed' )
    this.data.collapsed = collapsed === '1' ? true : false
  },

  getCollapsed() {
    return this.data.collapsed
  },

  setCollapsed( bool ) {
    this.data.collapsed = bool

    if ( bool ) {
      localStorage.setItem( '_nut_layout_kaola_collapsed', '1' )
    } else {
      localStorage.setItem( '_nut_layout_kaola_collapsed', '0' )
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

  getActivePage( pages ) {
    return pages.find( page => page.active ) || {}
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

  onLogout() {
    this.$emit( 'logout' )
  },
} )

export default {
  name: 'layout-kaola',

  type: 'layout',

  async apply( ctx ) {
    let layout = null

    await ctx.api.layout.register( {
      name: 'kaola',

      mount( node, { ctx } ) {
        if ( !layout ) {
          const sidebar = ctx.api.sidebar.get()

          sidebar.forEach( s => s.open = s.active )

          layout = new Layout( {
            data: { ctx }
          } )

          layout.$on( 'logout', () => {
            ctx.events.emit( 'layout:logout' )
          } )
        }

        layout.$inject( node )
      },

      unmount( node ) {
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
