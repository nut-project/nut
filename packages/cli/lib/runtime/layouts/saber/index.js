import Regular from 'regularjs'
import styles from './index.module.less'

const Shell = Regular.extend( {
  template: `
    <div class="${ styles.shell }">
      <div class="${ styles.header }">
        <div class="${ styles.header__name }">
          { ctx.app.zh }
        </div>
        <div class="${ styles.header__user }">
          {#if ctx.user.username}
          <i class="iconfont icon-user"></i>
          { ctx.user.username }
          {/if}
        </div>
      </div>
      <div class="${ styles.navbar }">
        <ul class="${ styles.navbar__items }">
          {#list ctx.app.sidebar as item}
            <li class="${ styles.navbar__item } { this.isActive( ctx.router.name, item.pages ) ? '${ styles.is_active }' : '' }">
              <a href="#{ item.pages | shown | route }">
                {#if item.icon}
                <i class="iconfont icon-{ item.icon }"></i>
                {/if}
                { item.title }
              </a>
            </li>
          {/list}
        </ul>
      </div>

      {#if currentPage && currentPage.type === 'markdown'}
        <div class="${ styles.content }">
          <div class="${ styles.markdown }" ref="$$view">
          </div>
        </div>
      {#else}
        <div class="${ styles.content }">
          <div class="${ styles.other }" ref="$$view"></div>
        </div>
      {/if}

    </div>
  `,

  computed: {
    currentPage() {
      const currentPages = this.getCurrentPages()
      return this.getShownPage( currentPages )
    },
  },

  isActive( activeName, pages = [] ) {
    return !!pages.find( page => page.name === activeName )
  },

  getCurrentPages() {
    if ( !this.data.ctx ) {
      return []
    }

    const sidebar = this.data.ctx.app.sidebar
    const activeName = this.data.ctx.router.name
    const found = sidebar.find( s => {
      const pages = s.pages
      return pages.some( page => page.name === activeName )
    } )

    if ( !found ) {
      return
    }

    return found.pages || []
  },

  getShownPage( pages ) {
    return pages.find( page => !page.hidden )
  },
} )

Shell.filter( 'shown', ( pages = [] ) => {
  return pages.find( page => !page.hidden )
} )

Shell.filter( 'route', ( page = {} ) => {
  return page.route
} )

export default Shell
