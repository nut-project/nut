const WebpackDevServer = require( 'webpack-dev-server' )
const webpack = require( 'webpack' )
const path = require( 'path' )
const VirtualModulesPlugin = require( 'webpack-virtual-modules' )
const chokidar = require( 'chokidar' )
const loadConfig = require( '../utils/loadConfig' )
const ensureConfigDefaults = require( '../utils/ensureConfigDefaults' )
const generateVirtualModules = require( '../utils/generateVirtualModules' )
const baseWebpackConfig = require( '../config/webpack.config.base' )

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  })

const dirs = {
  cli: path.join( __dirname, '../../' ),
  project: process.cwd(),
}

async function prod(){
  let result = await loadConfig()
  let config = result.config || {}

  ensureConfigDefaults( config )

  const webpackConfig = Object.assign( {}, baseWebpackConfig, {
    mode: 'production',
    output: {
      path: path.join( dirs.project, 'dist' ),
      filename: '[name].[hash].js',
      publicPath: './'
    },
  } )

  const modules = await generateVirtualModules( config )
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
