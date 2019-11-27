exports.extend = function ( config, context ) {
  // disable performance hints in non-production mode
  if ( context.env !== 'production' ) {
    config.performance.hints( false )
  }
}
