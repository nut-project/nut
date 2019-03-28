const cosmiconfig = require( 'cosmiconfig' )
const WebpackDevServer = require( 'webpack-dev-server' )
const webpack = require( 'webpack' )
const path = require( 'path' )
const VirtualModulesPlugin = require( 'webpack-virtual-modules' )
const chokidar = require( 'chokidar' )
const generateVirtualModules = require( '../utils/generateVirtualModules' )
const loadConfig = require( '../utils/loadConfig' )
const ensureConfigDefaults = require( '../utils/ensureConfigDefaults' )
const baseWebpackConfig = require( '../config/webpack.config.base' )

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  })

const dirs = {
  cli: path.join( __dirname, '../../' ),
  project: process.cwd(),
}

const explorer = cosmiconfig( 'nut', {
  cache: false,
} )

async function dev(){
  let result = await loadConfig()
  let config = result.config || {}

  ensureConfigDefaults( config )

  const webpackConfig = Object.assign( {}, baseWebpackConfig, {
    mode: 'development',
  } )

  webpackConfig.resolve.alias[ 'nut-markdown-theme' ] = 'prismjs/themes/' + config.markdown.theme + '.css'

  const modules = await generateVirtualModules( config )
  const virtualModules = new VirtualModulesPlugin( modules )
  webpackConfig.plugins.push( virtualModules )

  const options = {
    contentBase: './dist',
    hot: true,
    host: '127.0.0.1',
  }

  WebpackDevServer.addDevServerEntrypoints( webpackConfig, options )
  const compiler = webpack( webpackConfig )
  const server = new WebpackDevServer( compiler, options )

  server.listen( 8080, '127.0.0.1', () => {
    console.log( 'Starting server on http://127.0.0.1:8080' )
  } )

  chokidar.watch( [ result.filepath ] )
    .on( 'change', async () => {
      try {
        result = await explorer.search()
        config = result.config

        const modules = await generateVirtualModules( config )

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
