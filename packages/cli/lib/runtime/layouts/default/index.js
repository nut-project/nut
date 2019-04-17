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
              class="${ styles.sidebar__item } { item.active ? '${ styles.is_active }' : '' }"
              title="{ item.title }"
              r-tippy="{ { placement: 'right', duration: 0 } }"
            >
              <a
                href="{ item.route ? '#' + item.route : item.link }"
                {#if item.link}
                target="_blank"
                {/if}
                class="${ styles.sidebar__link }"
              >
                <i class="${ styles.sidebar__item_icon } nut-icons nut-icon-{ item.icon }"></i>
              </a>
            </li>
          {/list}
        </ul>
      {/if}
    </aside>
  `,
} )

const Navbar = Regular.extend( {
  template: `
    <div class="${ styles.navbar }">
      <div class="${ styles.navbar__scroller }">
        {#list pages as page}
          <a
            href="#{ page.route }"
            class="${ styles.navbar__item } { page.active ? '${ styles.is_active }' : '' }"
          >
            {#if page.attributes.title}
              { page.attributes.title }
            {#else}
              未命名
            {/if}
          </a>
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
        {#if user && user.nickname}
        <span style="cursor: pointer;">
          <i class="nut-icons nut-icon-user"></i>
          { user.nickname }
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
  template: `
    <nut-sidebar
      menu="{ ctx.app.sidebar }"
    ></nut-sidebar>

    <nut-header
      title="{ ctx.app.zh || '' }"
      user="{ ctx.user }"
    ></nut-header>

    <div class="${ styles.content }">
      <div class="${ styles.progress_wrapper }">
        <div class="${ styles.progress_container }" id="progress-container"></div>
      </div>

      {#if currentPages.length > 0}
      <nut-navbar
        pages="{ currentPages }"
      ></nut-navbar>
      {/if}

      <div class="${ styles.page_container }">
        {#if currentPages[ 0 ] && currentPages[ 0 ].type === 'markdown'}
          <div class="${ styles.page_content }">
            <div
              class="markdown-body"
              style="padding: 30px 40px;"
              ref="$$view"
            ></div>
          </div>
        {#else}
          <div class="${ styles.page_content }" ref="$$view"></div>
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

    return found.children || []
  },
} )

Shell.component( 'nut-sidebar', Sidebar )
Shell.component( 'nut-navbar', Navbar )
Shell.component( 'nut-header', Header )

export default Shell
