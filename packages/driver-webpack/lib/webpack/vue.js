const path = require( 'path' )
const resolveFrom = require( 'resolve-from' )
const VueLoaderPlugin = require( 'vue-loader/lib/plugin' )
const localResolve = require( './shared/local-resolve' )
const getCacheConfig = require( './shared/get-cache-config' )

exports.extend = function ( config, context = {} ) {
  const { env, userConfig = {} } = context
  const cache = env === 'development' && userConfig.cache !== false

  config.resolve.extensions
    .merge( [
      '.vue'
    ] )

  const vueOptions = cache ?
    getVueCacheConfig() :
    {}

  config.module
    .rule( 'vue' )
    .test( /\.vue$/i )
    .use( 'vue' )
    .loader( require.resolve( 'vue-loader' ) )
    .options( vueOptions )

  config
    .plugin( 'vue' )
    .use( VueLoaderPlugin )
}

// modify from poi
function getVueCacheConfig() {
  const vueLoaderPath = path.dirname( require.resolve( 'vue-loader' ) )
  const compilerPkgPath = resolveFrom.silent(
    vueLoaderPath,
    '@vue/component-compiler-utils/package.json'
  )
  const compilerPkg = compilerPkgPath ? require( compilerPkgPath ) : {}

  const templateCompilerPkgPath = localResolve(
    'vue-template-compiler/package.json'
  )

  const templateCompilerPkg = templateCompilerPkgPath ?
    require( templateCompilerPkgPath ) :
    {}

  return getCacheConfig( 'vue-loader', {
    'vue-loader': require( 'vue-loader/package.json' ).version,
    '@vue/component-compiler-utils': compilerPkg.version,
    'vue-template-compiler': templateCompilerPkg.version,
  } )
}
