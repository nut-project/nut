import axios from 'axios'
import layout from '../core/layout'
import page from '../core/page'
import createRouter from '../core/router'
import homepage from '../core/homepage'
import createQuicklink from '../core/quicklink'

export default function ( { pages, router, globals } = {} ) {
  const axiosInstance = axios.create( {
    withCredentials: true,
    crossDomain: true,
  } )

  const routerAPI = createRouter( pages, router )

  return {
    axios: axiosInstance,

    quicklink: createQuicklink( {
      globals,
      pages,
    } ),

    layout,

    page,

    homepage,

    router: routerAPI,

    sidebar: {
      _sidebar: null,

      trace() {
        const sidebar = this.get()
        const currentRouteName = routerAPI.current && routerAPI.current.name

        if ( !sidebar || !currentRouteName ) {
          return []
        }

        let active = null
        walkChildren( sidebar, null, child => {
          if ( child.page && ( child.page.name === currentRouteName ) ) {
            active = child
          }
        } )

        const traces = []

        if ( active ) {
          let parent = active

          while ( parent ) {
            traces.unshift( parent )
            parent = parent.parent
          }
        }

        return traces
      },

      configure( sidebar = [] ) {
        walkChildren( sidebar, null, ( child, index, parent ) => {
          child.parent = parent

          if ( !child.path ) {
            return
          }

          const normalized = child.path.replace( /^(\/)/g, '' )
          const page = pages.find( child => child.page === normalized )

          if ( page ) {
            child.page = page
          } else {
            child.page = null
          }
        } )

        sidebar.forEach( s => {
          const defaultRoute = {
            found: false,
            route: ''
          }

          walkChildren( s.children, s, child => {
            if ( !defaultRoute.found && child.page ) {
              defaultRoute.found = true
              defaultRoute.route = child.page.route
            }
          } )

          if ( defaultRoute.found ) {
            s.route = defaultRoute.route
          }
        } )

        this._sidebar = sidebar
      },
      get() {
        return this._sidebar || []
      },
    }
  }
}

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
