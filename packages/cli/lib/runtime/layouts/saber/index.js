import Regular from 'regularjs'
import styles from './index.module.less'

const Layout = Regular.extend( {
  template: `
    <div class="${ styles.shell }">
      <div class="${ styles.header }">
        <div class="${ styles.header__name }">
          { ctx.app.zh }
        </div>
        <div class="${ styles.header__user }">
          {#if ctx.user && ctx.user.nickname}
          <i class="nut-icons nut-icon-user"></i>
          { ctx.user.nickname }
          {/if}
        </div>
      </div>
      <div class="${ styles.navbar }">
        <ul class="${ styles.navbar__items }">
          {#list ctx.api.getSidebar() as item}
            <li class="${ styles.navbar__item } { item.active ? '${ styles.is_active }' : '' }">
              <a
                href="{ item.route ? '#' + item.route : item.link }"
                {#if item.link}
                target="_blank"
                {/if}
              >
                {#if item.icon}
                <i class="nut-icons nut-icon-{ item.icon }"></i>
                {/if}
                { item.title }
              </a>
            </li>
          {/list}
        </ul>
      </div>

      {#if currentPage && currentPage.page.type === 'markdown'}
        <div class="${ styles.content }">
          <div class="${ styles.markdown } markdown-body" ref="$$mount">
          </div>
        </div>
      {#else}
        <div class="${ styles.content }">
          <div class="${ styles.other }" ref="$$mount"></div>
        </div>
      {/if}

    </div>
  `,

  computed: {
    currentPage() {
      const currentPages = this.getCurrentPages()
      return currentPages.find( page => page.active ) || {}
    },
  },

  getCurrentPages() {
    if ( !this.data.ctx ) {
      return []
    }

    const sidebar = this.data.ctx.api.getSidebar()
    const found = sidebar.find( s => s.active )

    if ( !found ) {
      return []
    }

    return found.children || []
  },
} )

export default {
  name: 'layout-saber',

  type: 'layout',

  async apply( ctx ) {
    let layout = null

    await ctx.api.layout.register( {
      name: 'saber',

      mount( node ) {
        if ( !layout ) {
          layout = new Layout( {
            data: { ctx },
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
