import Regular from 'regularjs'
import styles from './index.module.less'

const Layout = Regular.extend( {
  template: `
    <div class="${ styles.header }">
      <div></div>
      <ul class="${ styles.actions }">
        {#if ctx.user && ctx.user.nickname}
        <li class="${ styles.action_user }">
          <i style="margin-right: 2px;" class="nut-icons nut-icon-user"></i>
          { ctx.user.nickname }
        </li>
        {/if}
      </ul>
    </div>

    <div class="${ styles.sidebar }">
      <div class="${ styles.title }">
        {#if ctx.app.logo}
          <img class="${ styles.logo }" src="{ ctx.app.logo }" alt="" />
        {/if}

        <div>{ ctx.app.zh }</div>
      </div>

      <div class="${ styles.menu }">
        {#list ctx.app.sidebar as item}
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
            <div class="${ styles.sidebar__arrow_container }">
              <i class="${ styles.sidebar__arrow } nut-icons nut-icon-down { item.open ? '${ styles.is_open }' : '' }"></i>
            </div>
          </a>

          {#if item.children && item.children.length > 0}
            <ul class="${ styles.sidebar__items }" r-style="{ { height: item.open ? item.children.length * 50 + 'px' : '0' } }">
              {#list item.children as page}
                {#if page.attributes.title}
                  <li class="${ styles.sidebar__item } { page.active ? '${ styles.is_active }' : '' }">
                    <a
                      href="#{ page.route }"
                      class="${ styles.sidebar__link }"
                    >
                      { page.attributes.title }
                    </a>
                  </li>
                {/if}
              {/list}
            </ul>
          {/if}
        {/list}
      </div>

    </div>

    <div class="${ styles.main }">
      <div class="${ styles.main__content }">
        {#if this.getActivePage( currentPages ).type === 'markdown'}
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

  getActivePage( pages ) {
    return pages.find( page => page.active ) || {}
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

export default {
  name: 'layout-kaola',

  type: 'layout',

  async apply( ctx ) {
    let layout = null

    await ctx.api.layout.register( {
      name: 'kaola',

      mount( node, { ctx } ) {
        if ( !layout ) {
          ctx.app.sidebar.forEach( s => s.open = s.active )

          layout = new Layout( {
            data: { ctx }
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
