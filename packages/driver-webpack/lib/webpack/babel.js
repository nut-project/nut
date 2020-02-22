const createInclude = require( './shared/create-include' )
const parallel = require( './shared/parallel' )
const threadLoader = require( 'thread-loader' )
const getCacheConfig = require( './shared/get-cache-config' )

exports.extend = function ( config, context = {} ) {
  const { env, userConfig = {} } = context
  const { babel = {} } = userConfig
  const cache = userConfig.cache

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
  }

  const babelCacheConfig = getCacheConfig( `nut-babel-loader`, {
    '@babel/core': require( '@babel/core/package.json' ).version,
    'babel-loader': require( 'babel-loader/package.json' ).version,
  } )

  if ( typeof cache === 'undefined' ) {
    // by default only enable cache in development
    if ( env === 'development' ) {
      Object.assign( babelOptions, babelCacheConfig )
    }
  } else if ( cache === true ) {
    Object.assign( babelOptions, babelCacheConfig )
  }

  rule.use( 'babel' )
    .loader( require.resolve( './babel/loader' ) )
    .options( babelOptions )
}
