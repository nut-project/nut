const cosmiconfig = require( 'cosmiconfig' )
const WebpackDevServer = require( 'webpack-dev-server' )
const webpack = require( 'webpack' )
const path = require( 'path' )
const VirtualModulesPlugin = require( 'webpack-virtual-modules' )
const chokidar = require( 'chokidar' )
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

const explorer = cosmiconfig( 'nut', {
  cache: false,
} )

async function prod(){
  const webpackConfig = Object.assign( {}, baseWebpackConfig, {
    mode: 'production',
    output: {
      path: path.join( dirs.project, 'dist' ),
      filename: '[name].[hash].js',
      publicPath: './'
    }
  } )

  let result = {}
  let config = {}
  try {
    result = await explorer.search()
    config = result.config
  } catch ( e ) {
    console.log( e )
  }

  const modules = await generateVirtualModules( config )

  const virtualModules = new VirtualModulesPlugin( modules )

  webpackConfig.plugins.push( virtualModules )

  const compiler = webpack( webpackConfig )

  compiler.run( ( err, stats ) => {
    if ( err ) {
      return console.log( err )
    }
  } )
}

module.exports = prod
