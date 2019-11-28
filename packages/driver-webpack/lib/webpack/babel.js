const createInclude = require( './shared/create-include' )
const parallel = require( './shared/parallel' )
const threadLoader = require( 'thread-loader' )

exports.extend = function ( config, context = {} ) {
  const { env, userConfig = {} } = context
  const { babel = {} } = userConfig

  const rule = config.module.rule( 'js' )

  rule.test( [ /\.m?js$/, /\.jsx$/ ] )

  rule.include.add( createInclude( babel && babel.transpileModules ) )

  if ( userConfig.parallel ) {
    threadLoader.warmup( {}, [
      require.resolve( './babel/loader' )
    ] )
    parallel( rule )
  }

  rule.use( 'babel' )
    .loader( require.resolve( './babel/loader' ) )
    .options( {
      // 1. disable cache on production build
      // 2. should enable by user manually
      cacheDirectory: env !== 'production' && babel.cache,
      cacheCompression: env === 'production',
    } )
}
