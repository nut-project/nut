const localResolve = require( './shared/local-resolve' )

exports.extend = function ( config, context = {} ) {
  const { userConfig = {} } = context
  const pages = userConfig.pages
  const entry = userConfig.entry || 'src/index.js'

  if ( pages ) {
    for ( const key of Object.keys( pages ) ) {
      if ( pages[ key ] ) {
        const pageEntry = pages[ key ].entry || pages[ key ]

        config.entry( key ).add( localResolve( pageEntry ) )
      }
    }
  } else {
    config.entry( 'index' ).add( localResolve( entry ) )
  }
}
