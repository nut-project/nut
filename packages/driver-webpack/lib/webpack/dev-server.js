exports.extendDevServer = function ( serverOptions, context = {} ) {
  const { userConfig = {} } = context
  const userServerOpts = userConfig.devServer

  if ( !userServerOpts ) {
    return
  }

  if ( userServerOpts.historyApiFallback ) {
    serverOptions.historyApiFallback = userServerOpts.historyApiFallback
  }

  if ( userServerOpts.https ) {
    serverOptions.https = userServerOpts.https
  }

  if ( userServerOpts.headers ) {
    serverOptions.headers = userServerOpts.headers
  }
}
