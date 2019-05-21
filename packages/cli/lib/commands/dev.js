const path = require( 'path' )
const chokidar = require( 'chokidar' )
const boxen = require( 'boxen' )
const chalk = require( 'chalk' )
const read = require( 'read' )
const open = require( 'open' )
const webpackMerge = require( 'webpack-merge' )
const webpack = require( 'webpack' )
const WebpackDevServer = require( 'webpack-dev-server' )
const VirtualModulesPlugin = require( 'webpack-virtual-modules' )
const CaseSensitivePathsPlugin = require( 'case-sensitive-paths-webpack-plugin' )

const createBaseWebpackConfig = require( '../webpack/create-base-config' )
const applyCSSRules = require( '../webpack/apply-css-rules' )
const generateVirtualModules = require( '../utils/generateVirtualModules' )
const loadConfig = require( '../utils/loadConfig' )
const ensureConfigDefaults = require( '../utils/ensureConfigDefaults' )

const DEFAULT_HOST = '0.0.0.0'
const DEFAULT_PORT = 9000

process
  .on( 'unhandledRejection', ( reason, p ) => {
    console.error( reason, 'Unhandled Rejection at Promise', p )
  } )

const dirs = {
  cli: path.join( __dirname, '../../' ),
  project: process.cwd(),
}

async function dev(){
  let result = await loadConfig()
  let nutConfig = result.config || {}

  ensureConfigDefaults( nutConfig )

  const host = nutConfig.host || DEFAULT_HOST
  const port = nutConfig.port || DEFAULT_PORT
  const url = 'http://' + host + ':' + port

  let devServerOptions = {
    contentBase: './dist',
    host,
    hot: true,
    quiet: true,
  }

  if ( nutConfig.devServer ) {
    devServerOptions = Object.assign( devServerOptions, nutConfig.devServer )
  }

  const modules = await generateVirtualModules( nutConfig, {
    env: 'dev'
  } )

  let virtualModules

  const webpackConfig = createBaseWebpackConfig( nutConfig )

  webpackConfig.mode( 'development' )

  webpackConfig.devtool( 'cheap-module-source-map' )

  webpackConfig.output
    .filename( '[name].js' )
    .publicPath( './' )

  webpackConfig
    .plugin( 'hot' )
      .use( webpack.HotModuleReplacementPlugin )

  webpackConfig.plugin( 'case-sensitive-paths' )
    .use( CaseSensitivePathsPlugin )

  webpackConfig.plugin( 'virtual-modules' )
    .init( ( Plugin, args ) => {
      virtualModules = new Plugin( ...args )
      return virtualModules
    } )
    .use( VirtualModulesPlugin, [ modules ] )

  applyCSSRules( webpackConfig, 'dev' )

  if ( typeof nutConfig.chainWebpack === 'function' ) {
    nutConfig.chainWebpack( webpackConfig )
  }

  let finalWebpackConfig = webpackConfig.toConfig()

  // webpack configuration is ready to go
  if ( typeof nutConfig.configureWebpack === 'function' ) {
    nutConfig.configureWebpack( finalWebpackConfig )
  } else if ( typeof nutConfig.configureWebpack === 'object' ) {
    finalWebpackConfig = webpackMerge.smart(
      finalWebpackConfig,
      nutConfig.configureWebpack
    )
  }

  WebpackDevServer.addDevServerEntrypoints( finalWebpackConfig, devServerOptions )
  const compiler = webpack( finalWebpackConfig )
  const server = new WebpackDevServer( compiler, devServerOptions )

  server.listen( port, host, () => {
    console.log(
      boxen(
        `Your application is running at\n\n${ chalk.cyan( url ) }`,
        {
          padding: 1,
          borderColor: 'gray'
        }
      )
    )

    console.log( '\n' + chalk.gray( 'Tips: Press "Enter" to open' ) + '\n' )

    read( {
      silent: true,
    }, async ( err, input ) => {
      if ( err ) {
        process.exit( 0 )
        return
      }

      if ( input === '' ) {
        await open( url )
      }
    } )
  } )

  const appFile = path.join( dirs.project, 'src/app.js' )

  chokidar.watch( [ result.filepath, appFile ] )
    .on( 'change', async () => {
      if ( !virtualModules ) {
        return
      }

      try {
        result = await loadConfig()
        nutConfig = result.config

        const modules = await generateVirtualModules( nutConfig, {
          env: 'dev'
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
