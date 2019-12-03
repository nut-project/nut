const { webpack } = require( '@nut-project/webpack' )

exports.extend = function ( config, context = {} ) {
  const { env = '' } = context

  if ( env === 'production' ) {
    return
  }

  config.plugin( 'hmr' )
    .use( webpack.HotModuleReplacementPlugin, [] )
}

exports.extendDevServer = function ( serverOptions, context = {} ) {
  const { env = '' } = context

  if ( env === 'production' ) {
    return
  }

  serverOptions.hot = true
}
