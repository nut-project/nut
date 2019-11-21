const WebpackBar = require( 'webpackbar' )

exports.extend = function ( config, context ) {
  // https://webpack.js.org/guides/build-performance/#progress-plugin
  if ( context.env === 'production' ) {
    return
  }

  const options = {
    name: 'client'
  }

  if ( context.cliOptions.profile ) {
    options.profile = true
    options.reporters = [ 'fancy', 'profile' ]
  }

  config
    .plugin( 'webpackbar' )
    .use( WebpackBar, [ options ] )
}
