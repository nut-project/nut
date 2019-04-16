const path = require( 'path' )
const chokidar = require( 'chokidar' )
const cosmiconfig = require( 'cosmiconfig' )
const webpack = require( 'webpack' )
const WebpackDevServer = require( 'webpack-dev-server' )
const VirtualModulesPlugin = require( 'webpack-virtual-modules' )
const CaseSensitivePathsPlugin = require( 'case-sensitive-paths-webpack-plugin' )

const createBaseWebpackConfig = require( '../webpack/create-base-config' )
const generateVirtualModules = require( '../utils/generateVirtualModules' )
const loadConfig = require( '../utils/loadConfig' )
const ensureConfigDefaults = require( '../utils/ensureConfigDefaults' )

const DEFAULT_HOST = '127.0.0.1'
const DEFAULT_PORT = 9000

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  })

const dirs = {
  cli: path.join( __dirname, '../../' ),
  project: process.cwd(),
}

async function dev(){
  let result = await loadConfig()
  let config = result.config || {}

  ensureConfigDefaults( config )

  const webpackConfig = Object.assign( {}, createBaseWebpackConfig( config ), {
    mode: 'development',
    devtool: 'cheap-module-source-map',
  } )

  webpackConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin()
  )
  webpackConfig.plugins.push(
    new CaseSensitivePathsPlugin()
  )

  const modules = await generateVirtualModules( config, {
    env: 'development'
  } )
  const virtualModules = new VirtualModulesPlugin( modules )

  webpackConfig.plugins.push( virtualModules )

  const host = config.host || DEFAULT_HOST
  const port = config.port || DEFAULT_PORT

  const options = {
    contentBase: './dist',
    hot: true,
    host,
  }

  WebpackDevServer.addDevServerEntrypoints( webpackConfig, options )
  const compiler = webpack( webpackConfig )
  const server = new WebpackDevServer( compiler, options )

  server.listen( port, host, () => {
    console.log( `Starting server on http://${ host }:${ port }` )
  } )

  const appFile = path.join( dirs.project, 'src/app.js' )

  chokidar.watch( [ result.filepath, appFile ] )
    .on( 'change', async () => {
      try {
        result = await loadConfig()
        config = result.config

        const modules = await generateVirtualModules( config, {
          env: 'development'
        } )

        for ( let [ path, content ] of Object.entries( modules ) ) {
          virtualModules.writeModule(
            path,
            content
          )
        }
      } catch (e) {
        console.log( e )
      }
    } )
}

module.exports = dev
