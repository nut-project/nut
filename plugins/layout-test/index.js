import Regular from 'regularjs'
import styles from './index.module.less'

const Layout = Regular.extend( {
  template: `
    <div class="${ styles.header }">
      <div class="${ styles.header__content }">
        <div class="${ styles.title }">
          {#if ctx.app.logo}
            <img class="${ styles.logo }" src="{ ctx.app.logo }" alt="" />
          {/if}

          <div>{ ctx.app.zh | uppercase }</div>
          <span style="color: blue;margin-left: 10px;">test</span>
        </div>
        <div class="${ styles.sidebar }">
          {#list ctx.api.sidebar.get() as item}
            <a
              href="{ item.route ? '#' + item.route : item.link }"
              {#if item.link}
              target="_blank"
              {/if}
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
                  href="#{ page.page.route }"
                  class="${ styles.navbar__item } { page.active ? '${ styles.is_active }' : '' }"
                >
                  { page.title }
                </a>
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
} )

Layout.filter( 'uppercase', v => v && v.toUpperCase() )

export default {
  name: 'layout-now',

  type: 'layout',

  async apply( ctx ) {
    let layout = null

    await ctx.api.layout.register( {
      name: 'test',

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
