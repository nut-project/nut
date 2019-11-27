exports.extend = function ( config, context ) {
  if ( context.userConfig.fast === true ) {
    config.output.pathinfo( false )
  }
}
