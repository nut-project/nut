const VueLoaderPlugin = require( 'vue-loader/lib/plugin' )

exports.extend = function ( config ) {
  config.resolve.extensions
    .merge( [
      '.vue'
    ] )

  config.module
    .rule( 'vue' )
    .test( /\.vue$/i )
    .use( 'vue' )
    .loader( require.resolve( 'vue-loader' ) )
    .options()

  config
    .plugin( 'vue' )
    .use( VueLoaderPlugin )
}
