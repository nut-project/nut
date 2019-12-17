exports.extend = function ( config, context = {} ) {
  const { userConfig = {} } = context
  if ( typeof userConfig.minimize !== 'undefined' ) {
    config.optimization.minimize( Boolean( userConfig.minimize ) )
  }
}
