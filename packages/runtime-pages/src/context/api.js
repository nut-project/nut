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

  return {
    axios: axiosInstance,

    quicklink: createQuicklink( {
      globals,
      pages,
    } ),

    layout,

    page,

    homepage,

    router: createRouter( pages, router ),

    sidebar: {
      _sidebar: null,
      configure( sidebar = [] ) {
        walkChildren( sidebar, null, child => {
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

          walkChildren( s, child => {
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
