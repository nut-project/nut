const localJoin = require( './shared/local-join' )

exports.extend = function ( config, context = {} ) {
  const { userConfig = {} } = context
  const pages = userConfig.pages
  const entry = userConfig.entry || 'src/index.js'

  if ( pages ) {
    for ( const key of Object.keys( pages ) ) {
      const page = pages[ key ]
      if ( page ) {
        const pageEntry = typeof page === 'string' ? page : page.entry

        if ( typeof pageEntry === 'string' ) {
          config.entry( key ).add( localJoin( pageEntry ) )
        }
      }
    }
  } else if ( typeof entry === 'string' ) {
    config.entry( 'index' ).add( localJoin( entry ) )
  }
}

exports.expose = function ( driver ) {
  driver.expose( 'entry', {
    prepend( injectEntry ) {
      driver.useHook( 'dangerously_chainWebpack', config => {
        const entryKeys = config.entryPoints.store.keys()
        for ( const key of entryKeys ) {
          if ( config.entryPoints.has( key ) ) {
            config.entry( key ).prepend( injectEntry )
          }
        }
      } )
    },

    append( injectEntry ) {
      driver.useHook( 'dangerously_chainWebpack', config => {
        const entryKeys = config.entryPoints.store.keys()
        for ( const key of entryKeys ) {
          if ( config.entryPoints.has( key ) ) {
            config.entry( key ).append( injectEntry )
          }
        }
      } )
    }
  } )
}
