const path = require( 'path' )
const EventEmitter = require( 'events' )
const chalk = require( 'chalk' )
const resolveFrom = require( 'resolve-from' )
const prettyBytes = require( 'pretty-bytes' )
const webpackMerge = require( 'webpack-merge' )
const webpack = require( 'webpack' )
const CaseSensitivePathsPlugin = require( 'case-sensitive-paths-webpack-plugin' )
const createBaseWebpackConfig = require( '../webpack/create-base-config' )
const applyCSSRules = require( '../webpack/apply-css-rules' )

async function dev( gatherer = {}, runtime, cliOptions = {} ) {
  const nutConfig = await gatherer.getConfig()

  const webpackConfig = createBaseWebpackConfig( nutConfig )

  webpackConfig.mode( 'development' )
  webpackConfig.devtool( 'cheap-module-source-map' )
  webpackConfig.output
    .filename( '[name].[hash:16].js' )
  webpackConfig
    .plugin( 'hot' )
      .use( webpack.HotModuleReplacementPlugin ) // eslint-disable-line
  webpackConfig.plugin( 'case-sensitive-paths' )
    .use( CaseSensitivePathsPlugin )

  applyCSSRules( webpackConfig, 'dev' )

  const emitter = new EventEmitter()

  await runtime.apply( {
    env: 'development',
    cli: {
      options: cliOptions,
    },
    api: {
      gatherer,
      webpack: webpackConfig,
      require( id ) {
        const context = path.join( __dirname, '../../node_modules' )
        const resolved = resolveFrom( context, id )

        return require( resolved )
      }
    },
    events: emitter,
  } )

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

  const compiler = webpack( finalWebpackConfig )

  compiler.hooks.done.tap( 'memory-usage', () => {
    const { heapUsed } = process.memoryUsage()
    console.log( chalk.gray( `\n${ prettyBytes( heapUsed ) } Memory Used\n` ) )
  } )

  emitter.emit( 'compiler', compiler, finalWebpackConfig )
}

module.exports = dev
