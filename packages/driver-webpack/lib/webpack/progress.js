const WebpackBar = require( 'webpackbar' )

exports.extend = function ( config, context ) {
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
