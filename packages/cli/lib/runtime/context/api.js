import axios from 'axios'
import layout from '../core/layout'
import page from '../core/page'
import createRouter from '../core/router'

export default function ( { pages, router } = {} ) {
  let axiosInstance = axios.create( {
    withCredentials: true,
    crossDomain: true,
  } )

  return {
    axios: axiosInstance,

    layout,

    page,

    router: createRouter( pages, router ),

    sidebar: {
      _sidebar: null,
      configure( sidebar = [] ) {
        sidebar.forEach( s => {
          if ( s.children ) {
            walkChildren( s.children, s, ( child, index, parent ) => {
              const normalized = child.path.replace( /^(\/)/g, '' )
              const page = pages.find( child => child.page === normalized )

              if ( page ) {
                child.page = page
              } else {
                child.page = null
              }
            } )
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
