const errorOverlayMiddleware = require( './overlay/error-overlay-middleware' )

exports.extend = function ( config, context = {} ) {
  const { env = '' } = context

  if ( env === 'production' ) {
    return
  }

  const hotClientEntry = require.resolve( './overlay/client' )

  const entryKeys = config.entryPoints.store.keys()
  for ( const key of entryKeys ) {
    if ( config.entryPoints.has( key ) ) {
      config.entry( key ).prepend( hotClientEntry )
    }
  }
}

exports.extendDevServer = function ( serverOptions, context = {} ) {
  const { env = '' } = context

  if ( env === 'production' ) {
    return
  }

  serverOptions.transportMode = 'ws'
  serverOptions.injectClient = false
  serverOptions.overlay = false

  const oldBefore = serverOptions.before

  serverOptions.before = function ( app, server ) {
    if ( oldBefore ) {
      oldBefore( app, server )
    }

    app.use( errorOverlayMiddleware() )
  }
}
