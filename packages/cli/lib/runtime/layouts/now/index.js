import Regular from 'regularjs'
import styles from './index.module.less'

const Layout = Regular.extend( {
  template: `
    <div class="${ styles.header }">
      <div class="${ styles.header__content }">
        <div class="${ styles.title }">
          { ctx.app.zh | uppercase }
        </div>
        <div class="${ styles.sidebar }">
          {#list ctx.app.sidebar as item}
            <a
              href="#{ item.route }"
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
              {#if page.attributes.title}
                <a
                  href="#{ page.route }"
                  class="${ styles.navbar__item } { page.active ? '${ styles.is_active }' : '' }"
                >
                  { page.attributes.title }
                </a>
              {/if}
            {/list}
          </div>
        </aside>

        {#if currentPages[ 0 ] && currentPages[ 0 ].type === 'markdown'}
          <div class="${ styles.content }">
            <div class="${ styles.markdown }" ref="$$view">
            </div>
          </div>
        {#else}
          <div class="${ styles.content }">
            <div ref="$$view"></div>
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

  getCurrentPages() {
    if ( !this.data.ctx ) {
      return []
    }

    const sidebar = this.data.ctx.app.sidebar
    const found = sidebar.find( s => s.active )

    if ( !found ) {
      return []
    }

    return found.pages || []
  },
} )

Layout.filter( 'uppercase', v => v && v.toUpperCase() )

export default Layout
