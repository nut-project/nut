import axios from 'axios'
import layout from './core/layout'

export default function ( { pages } = {} ) {
  let axiosInstance = axios.create( {
    withCredentials: true,
    crossDomain: true,
  } )

  return {
    axios: axiosInstance,

    getPageLink( page, data ) {
      const found = pages.find( p => p.page === page )

      if ( !found || !found.router ) {
        return
      }

      if ( !found.router.toPath ) {
        throw new Error( 'router has not been started yet' )
      }

      return '/#' + found.router.toPath( data )
    },

    layout,

    _sidebar: null,
    configureSidebar( sidebar = [] ) {
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
    getSidebar() {
      return this._sidebar || []
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
