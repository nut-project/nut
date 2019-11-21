exports.extend = function ( config, context ) {
  if ( context.env === 'production' ) {
    config.mode( 'production' )
  } else {
    config.mode( 'development' )
  }
}
