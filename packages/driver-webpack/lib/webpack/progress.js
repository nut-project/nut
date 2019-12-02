const WebpackBar = require( 'webpackbar' )

exports.extend = function ( config, context = {} ) {
  // https://webpack.js.org/guides/build-performance/#progress-plugin
  // so we need to disable by default
  const { cliOptions = {} } = context

  if ( !cliOptions.progress && !cliOptions.profile ) {
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
