const path = require( 'path' )
const webpack = require( 'webpack' )
const chokidar = require( 'chokidar' )
const WebpackDevServer = require( 'webpack-dev-server' )
const VirtualModulesPlugin = require( 'webpack-virtual-modules' )
const createBaseWebpackConfig = require( '../webpack/create-base-config' )
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

  const webpackConfig = Object.assign( {}, createBaseWebpackConfig( config ), {
    mode: 'production',
    devtool: false,
  } )

  webpackConfig.output = {
    filename: '[name].[contenthash].js',
    publicPath: './',
  }

  const modules = await generateVirtualModules( config, {
    env: 'prod'
  } )
  const virtualModules = new VirtualModulesPlugin( modules )

  webpackConfig.plugins.push( virtualModules )

  const compiler = webpack( webpackConfig )

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
