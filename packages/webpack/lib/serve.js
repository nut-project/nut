import webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'

const DEFAULT_HOST = '127.0.0.1'
const DEFAULT_PORT = 9000

module.exports = function serve( config = {}, serverConfig = {}, callback ) {
  WebpackDevServer.addDevServerEntrypoints( config, serverConfig )

  const compiler = webpack( config )
  const server = new WebpackDevServer( compiler, serverConfig )

  const { host = DEFAULT_HOST, port = DEFAULT_PORT } = serverConfig

  server.listen(
    port,
    host,
    callback
  )
}
