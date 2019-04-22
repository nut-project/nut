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
  }
}
