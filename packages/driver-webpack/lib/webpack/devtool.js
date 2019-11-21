exports.extend = function ( config, context ) {
  if ( context.env === 'production' ) {
    config.devtool( false )
  } else {
    config.devtool( 'cheap-module-source-map' )
  }
}
