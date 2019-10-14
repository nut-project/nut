const WebpackDevServer = require( 'webpack-dev-server' )

module.exports = function serve( compiler = {}, serverConfig = {}, callback ) {
  const server = new WebpackDevServer( compiler, serverConfig )

  const { host, port } = serverConfig

  server.listen(
    port,
    host,
    callback
  )

  return server
}
