import quicklink from 'quicklink'

// globals, pages
export default function ( context ) {
  return {
    prefetch( toPrefetchPages = [], options = {} ) {
      const chunks = context.globals.STATS_ASSETS_BY_CHUNKNAME || {}
      const publicPath = context.globals.PUBLIC_PATH || '/'
      const pages = context.pages || []

      const names = toPrefetchPages
        .map( page => {
          return pages.find( p => p.page === page )
        } )
        .filter( Boolean )
        .map( p => p.name )

      let urls = names.reduce( ( total, name ) => {
        const urls = ensureArray( chunks[ name ] || [] )
          .map( url => publicPath + url )

        total.push( ...urls )

        return total
      }, [] )

      const sourceMapReg = /\.map$/

      urls = urls.filter( url => !sourceMapReg.test( url ) )

      quicklink( {
        ...options,
        urls
      } )
    },

    prefetchUrls( urls = [], options = {} ) {
      quicklink( {
        ...options,
        urls
      } )
    },
  }
}

function isArray( obj ) {
  return toString.call( obj ) === '[object Array]'
}

function ensureArray( value ) {
  if ( !isArray( value ) ) {
    return [ value ]
  }

  return value
}
