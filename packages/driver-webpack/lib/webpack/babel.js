const createInclude = require( './shared/create-include' )
const parallel = require( './shared/parallel' )
const threadLoader = require( 'thread-loader' )

exports.extend = function ( config, context = {} ) {
  const { env, userConfig = {} } = context
  const { babel = {} } = userConfig
  const cache = env === 'development' && userConfig.cache !== false

  const rule = config.module.rule( 'js' )

  rule.test( [ /\.m?js$/, /\.jsx$/ ] )

  rule.include.add( createInclude( babel && babel.transpileModules ) )

  if ( userConfig.parallel ) {
    threadLoader.warmup( {}, [
      require.resolve( './babel/loader' )
    ] )
    parallel( rule )
  }

  const babelOptions = {
    cacheCompression: env === 'production',
    cacheDirectory: cache
  }

  rule.use( 'babel' )
    .loader( require.resolve( './babel/loader' ) )
    .options( babelOptions )
}
