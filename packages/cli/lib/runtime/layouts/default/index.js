import Regular from 'regularjs'
import styles from './index.module.less'

const Sidebar = Regular.extend( {
  template: `
    <aside class="${ styles.sidebar }">
      <div class="${ styles.logo }"></div>
      {#if menu}
        <ul class="${ styles.sidebar__items }">
          {#list menu as item}
            <li
              class="${ styles.sidebar__item } { this.isActive( active, item.pages ) ? '${ styles.is_active }' : '' }"
              title="{ item.title }"
              r-tippy="{ { placement: 'right', duration: 0 } }"
            >
              <a
                href="#{ item.pages | shown | route }"
                class="${ styles.sidebar__link }"
              >
                <i class="${ styles.sidebar__item_icon } iconfont icon-{ item.icon }"></i>
              </a>
            </li>
          {/list}
        </ul>
      {/if}
    </aside>
  `,

  isActive( activeName, pages = [] ) {
    return !!pages.find( page => page.name === activeName )
  },
} )

Sidebar.filter( 'shown', ( pages = [] ) => {
  return pages.find( page => !page.hidden )
} )

Sidebar.filter( 'route', ( page = {} ) => {
  return page.route
} )

const Main = Regular.extend( {
  template: `
    {#inc this.$body}
  `,
} )

const Navbar = Regular.extend( {
  template: `
    <div class="${ styles.navbar }">
      <div class="${ styles.navbar__scroller }">
        {#list pages as page}
          {#if !page.hidden}
            <a
              href="#{ page.route }"
              class="${ styles.navbar__item } { active === page.name ? '${ styles.is_active }' : '' }"
            >
              {#if page.attributes.title}
                { page.attributes.title }
              {#else}
                未命名
              {/if}
            </a>
          {/if}
        {/list}
      </div>
    </div>
  `
} )

// TODO: 最近浏览
const Header = Regular.extend( {
  template: `
    <div class="${ styles.header }">
      <div class="${ styles.header__actions }"></div>
      <div class="${ styles.header__menu }">
        {#inc title | t }
      </div>
      <div class="${ styles.header__user }">
        {#if user}
        <span style="cursor: pointer;">
          <i class="iconfont icon-user"></i>
          { user.username }
        </span>
        {/if}
      </div>
    </div>
  `,
} )

Header.filter( 't', function ( v ) {
  v = String( v )
  const first = v.substr( 0, 1 )
  const rest = v.substr( 1 )
  return `<span class="${ styles.first_letter }">${ first }</span>${ rest }`
} )

const Shell = Regular.extend( {
  components: { Sidebar, Main, Header },
  template: `
    <nut-sidebar
      menu="{ ctx.app.sidebar }"
      active="{ ctx.router.name }"
    ></nut-sidebar>

    <nut-main>
      <nut-header
        title="{ ctx.app.zh || '未命名的应用' }"
        user="{ ctx.user }"
      ></nut-header>

      <div class="${ styles.content }">
        <div class="${ styles.progress_wrapper }">
          <div class="${ styles.progress_container }" id="progress-container"></div>
        </div>

        {#if currentPages}
        <nut-navbar
          pages="{ currentPages }"
          active="{ ctx.router.name }"
        ></nut-navbar>
        {/if}

        <div class="${ styles.page_container }">
          <div class="${ styles.page_content }" ref="$$view"></div>
        </div>
      </div>
    </nut-main>
  `,

  computed: {
    currentPages() {
      if ( !this.data.ctx ) {
        return
      }
      return this.getCurrentPages( this.data.ctx.app.sidebar, this.data.ctx.router.name )
    },
  },

  getCurrentPages( sidebar, activeName ) {
    const found = sidebar.find( s => {
      const pages = s.pages
      return pages.some( page => page.name === activeName )
    } )

    if ( !found ) {
      return
    }

    return found.pages || []
  },
} )

Shell.component( 'nut-sidebar', Sidebar )
Shell.component( 'nut-main', Main )
Shell.component( 'nut-navbar', Navbar )
Shell.component( 'nut-header', Header )

export default Shell
