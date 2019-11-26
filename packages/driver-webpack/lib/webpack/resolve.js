exports.extend = function ( config, context = {} ) {
  const { userConfig = {} } = context
  const alias = userConfig.alias || {}

  config.resolve.extensions
    .merge( [
      '.js', '.json',
      '.css', '.less', '.scss', '.sass', '.mcss', '.styl', '.stylus',
    ] )

  for ( const key of Object.keys( alias ) ) {
    config.resolve.alias.set( key, alias[ key ] )
  }
}
