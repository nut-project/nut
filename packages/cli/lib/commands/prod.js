const path = require( 'path' )
const webpack = require( 'webpack' )
const chokidar = require( 'chokidar' )
const WebpackDevServer = require( 'webpack-dev-server' )
const webpackMerge = require( 'webpack-merge' )
const VirtualModulesPlugin = require( 'webpack-virtual-modules' )
const TerserJSPlugin = require( 'terser-webpack-plugin' )
const OptimizeCSSAssetsPlugin = require( 'optimize-css-assets-webpack-plugin' )
const table = require( 'text-table' )
const stringWidth = require( 'string-width' )
const chalk = require( 'chalk' )
const prettyBytes = require( 'pretty-bytes' )
const createBaseWebpackConfig = require( '../webpack/create-base-config' )
const applyCSSRules = require( '../webpack/apply-css-rules' )
const loadConfig = require( '../utils/load-config' )
const ensureConfigDefaults = require( '../utils/ensure-config-defaults' )
const generateVirtualModules = require( '../utils/generate-virtual-modules' )

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

  applyCSSRules( webpackConfig, 'prod' )

  webpackConfig.optimization
    .minimizer( 'js' )
      .use( TerserJSPlugin, [
        {
          cache: true,
          parallel: true,
          sourceMap: false,
          terserOptions: {
            parse: {
              ecma: 8
            },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2
            },
            mangle: {
              safari10: true
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true
            }
          }
        }
      ] )

  webpackConfig.optimization
    .minimizer( 'css' )
      .use( OptimizeCSSAssetsPlugin )

  const modules = await generateVirtualModules( config, {
    env: 'prod'
  } )

  webpackConfig.plugin( 'virtual-modules' )
    .use( VirtualModulesPlugin, [ modules ] )

  if ( typeof config.chainWebpack === 'function' ) {
    config.chainWebpack( webpackConfig )
  }

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

    const result = stats.toJson( {
      assets: true,
      // remove extra fields
      chunks: false,
      children: false,
      chunkGroups: false,
      chunkModules: false,
      warnings: false,
      modules: false,
      source: false,
      entrypoints: false,
      performance: false,
    } )

    let output = [
      [ ' File', 'Size' ].map( s => chalk.bold( s ) ),
      [ ' ----', '----' ].map( s => chalk.dim( s ) )
    ]

    result.assets.sort( ( a, b ) => {
      return b.size - a.size
    } )

    output = output.concat( result.assets.map( asset => [ chalk.green( ' ' + asset.name ), prettyBytes( asset.size ) ] ) )

    output = table( output, {
      stringLength: stringWidth,
    } )

    console.log( `\n${ output }\n` )

    console.log(
      stats.toString( {
        assets: false,
        children: false,
        chunks: false,
        colors: true,
        warnings: false,
        errors: true,
        errorDetails: true,
        modules: false,
        entrypoints: false,
        performance: false,
      } )
    )

    console.log( '\n' )
  } )
}

module.exports = prod
