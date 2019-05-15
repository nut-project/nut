import qs from 'query-string'

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

    beforeEach( hook ) {
      return rootRouter.beforeEach( hook )
    },

    afterEach( hook ) {
      return rootRouter.afterEach( hook )
    },

    format( route = '' ) {
      if ( typeof route === 'string' ) {
        return
      }

      const { page, query, params, layout } = route || {}

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
      const url = this.format( route )
      console.log( 'url', url )
      location.hash = url
    },

    // replace() {
    //
    // }
  }
}
