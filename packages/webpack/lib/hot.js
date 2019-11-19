const WebpackDevServer = require( 'webpack-dev-server' )

module.exports = function ( config, serverOptions ) {
  return WebpackDevServer.addDevServerEntrypoints( config, serverOptions )
}
