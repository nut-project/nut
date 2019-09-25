const webpack = require( 'webpack' )
const WebpackDevServer = require( 'webpack-dev-server' )
const prettyBytes = require( 'pretty-bytes' )
const chalk = require( 'chalk' )

const DEFAULT_HOST = '127.0.0.1'
const DEFAULT_PORT = 9000

module.exports = function serve( config = {}, serverConfig = {}, callback ) {
  WebpackDevServer.addDevServerEntrypoints( config, serverConfig )

  const compiler = webpack( config )
  const server = new WebpackDevServer( compiler, serverConfig )

  compiler.hooks.done.tap( 'memory-usage', () => {
    const { heapUsed } = process.memoryUsage()
    console.log( chalk.gray( `\n${ prettyBytes( heapUsed ) } Memory Used\n` ) )
  } )

  const { host = DEFAULT_HOST, port = DEFAULT_PORT } = serverConfig

  server.listen(
    port,
    host,
    callback
  )

  return {
    compiler,
    server,
  }
}
