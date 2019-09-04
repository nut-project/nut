/* eslint-disable indent */

const webpack = require( 'webpack' )
const webpackMerge = require( 'webpack-merge' )
const VirtualModulesPlugin = require( '../webpack/plugins/virtual-modules' )
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
const getAppId = require( '../utils/get-app-id' )
const { normal, child } = require( '../webpack/extend-webpack' )

async function productionify( webpackConfig, config, appId ) {
  webpackConfig.mode( 'production' )
  webpackConfig.devtool( false )
  webpackConfig.output
    .filename( '[name].[contenthash].js' )

  applyCSSRules( webpackConfig, 'prod', appId )

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
            /* eslint-disable */
            // compress is from vue-cli
            compress: {
              // turn off flags with small gains to speed up minification
              arrows: false,
              collapse_vars: false, // 0.3kb
              comparisons: false,
              computed_props: false,
              hoist_funs: false,
              hoist_props: false,
              hoist_vars: false,
              inline: false,
              loops: false,
              negate_iife: false,
              properties: false,
              reduce_funcs: false,
              reduce_vars: false,
              switches: false,
              toplevel: false,
              typeofs: false,

              // a few flags with noticable gains/speed ratio
              // numbers based on out of the box vendor bundle
              booleans: true, // 0.7kb
              if_return: true, // 0.4kb
              sequences: true, // 0.7kb
              unused: true, // 2.3kb

              // required features to drop conditional branches
              conditionals: true,
              dead_code: true,
              evaluate: true,

              warnings: false,
              comparisons: false,
              inline: 2
            },
            /* eslint-enable */
          mangle: true,
          safari10: true,
          output: {
            ecma: 5,
            comments: false,
            // eslint-disable-next-line
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

  webpackConfig.plugin( 'define' )
    .use( webpack.DefinePlugin, [
      {
        NUT_CLI_DYNAMIC: JSON.stringify( false )
      }
    ] )
}

async function prod() {
  process.env.NODE_ENV = 'production'

  const result = await loadConfig()
  const config = result.config || {}

  ensureConfigDefaults( config )

  const appId = getAppId( config )

  const webpackConfig = createBaseWebpackConfig( config, appId )
  await productionify( webpackConfig, config, appId )
  normal( webpackConfig, config )
  child( webpackConfig, config, appId )

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
      console.error( err )
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