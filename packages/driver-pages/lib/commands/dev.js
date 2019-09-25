const path = require( 'path' )
const EventEmitter = require( 'events' )
const resolveFrom = require( 'resolve-from' )
const webpackMerge = require( 'webpack-merge' )
const { serve } = require( '@nut-project/webpack' )
const createBaseWebpackConfig = require( '../webpack/create-base-config' )

async function dev( gatherer = {}, runtime, cliOptions = {} ) {
  const nutConfig = await gatherer.getConfig()

  const webpackConfig = createBaseWebpackConfig( nutConfig, 'development' )

  const emitter = new EventEmitter()

  await runtime.apply( {
    env: 'development',
    cli: {
      options: cliOptions,
    },
    api: {
      gatherer,
      webpack: webpackConfig,
      serve,
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

  emitter.emit( 'ready', finalWebpackConfig )
}

module.exports = dev
