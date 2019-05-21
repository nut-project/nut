const path = require( 'path' )
const webpack = require( 'webpack' )
const chokidar = require( 'chokidar' )
const WebpackDevServer = require( 'webpack-dev-server' )
const webpackMerge = require( 'webpack-merge' )
const VirtualModulesPlugin = require( 'webpack-virtual-modules' )
const TerserJSPlugin = require( 'terser-webpack-plugin' )
const OptimizeCSSAssetsPlugin = require( 'optimize-css-assets-webpack-plugin' )
const createBaseWebpackConfig = require( '../webpack/create-base-config' )
const applyCSSRules = require( '../webpack/apply-css-rules' )
const loadConfig = require( '../utils/loadConfig' )
const ensureConfigDefaults = require( '../utils/ensureConfigDefaults' )
const generateVirtualModules = require( '../utils/generateVirtualModules' )

process
  .on( 'unhandledRejection', ( reason, p ) => {
    console.error( reason, 'Unhandled Rejection at Promise', p )
  } )

const dirs = {
  cli: path.join( __dirname, '../../' ),
  project: process.cwd(),
}

async function prod(){
  let result = await loadConfig()
  let config = result.config || {}

  ensureConfigDefaults( config )

  const webpackConfig = createBaseWebpackConfig( config )

  webpackConfig.mode( 'production' )

  webpackConfig.devtool( false )

  webpackConfig.output
    .filename( '[name].[contenthash].js' )
    .publicPath( './' )

  applyCSSRules( webpackConfig, 'prod' )

  webpackConfig.optimization
    .minimizer( 'js' )
      .use( TerserJSPlugin )

  webpackConfig.optimization
    .minimizer( 'css' )
      .use( OptimizeCSSAssetsPlugin )

  const modules = await generateVirtualModules( config, {
    env: 'prod'
  } )

  webpackConfig.plugin( 'virtual-modules' )
    .use( VirtualModulesPlugin, [ modules ] )

  let finalWebpackConfig = webpackConfig.toConfig()

  if ( typeof config.configureWebpack === 'function' ) {
    config.configureWebpack( finalWebpackConfig )
  } else if ( typeof config.configureWebpack === 'object' ) {
    finalWebpackConfig = webpackMerge.smart(
      finalWebpackConfig,
      config.configureWebpack
    )
  }

  const compiler = webpack( finalWebpackConfig )

  compiler.run( ( err, stats ) => {
    if ( err ) {
      console.error(err)
      return
    }

    console.log(
      stats.toString( {
        chunks: false,
        colors: true,
        warnings: false,
      } )
    )
  } )
}

module.exports = prod
