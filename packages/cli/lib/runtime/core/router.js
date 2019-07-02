import qs from 'query-string'
import normalizeRoute from '../utils/normalize-route'

export default function ( pages, rootRouter ) {
  return {
    current: null,

    on( ...args ) {
      return rootRouter.on( ...args )
    },

    emit( ...args ) {
      return rootRouter.emit( ...args )
    },

    find( ...args ) {
      return rootRouter.find( ...args )
    },

    alias( page, aliasPath ) {
      const found = rootRouter.find( r => r.options.page === page )

      if ( !found ) {
        console.warn( '[api.router.alias] No router found for ' + page )
        return
      }

      found.alias( aliasPath )
    },

    beforeEach( hook ) {
      return rootRouter.beforeEach( hook )
    },

    afterEach( hook ) {
      return rootRouter.afterEach( hook )
    },

    format( route = '' ) {
      const current = this.current || {}
      const compose = current.options && current.options.compose

      if ( typeof route === 'string' ) {
        if ( compose && compose.name && ( route.indexOf( 'pages' ) === 0 ) ) {
          return `/${ compose.name }${ normalizeRoute( route ) }`
        }

        return route
      }

      const { query, params, layout } = route || {}

      let page = route && route.page

      if ( compose && compose.name && ( route.indexOf( 'pages' ) === 0 ) ) {
        page = `${ compose.name }/${ page }`
      }

      const found = pages.find( p => p.page === page )

      let url = '/'

      if ( layout ) {
        url = url + layout + ';'
      }

      url = url + found.router.toPath( params || {} ).replace( /^\//, '' )

      if ( query ) {
        url = url + '?' + qs.stringify( query )
      }

      return url
    },

    push( route = '' ) {
      const path = this.format( route )
      rootRouter.push( path )
    },

    replace( route = '' ) {
      const path = this.format( route )
      rootRouter.replace( path )
    },
  }
}
