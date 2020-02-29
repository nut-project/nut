const FriendlyErrorsPlugin = require( './plugins/FriendlyErrorPlugin' )

exports.extend = function ( config ) {
  config
    .plugin( 'friendly-error' )
    .use( FriendlyErrorsPlugin )
}

exports.extendDevServer = function ( serverOptions = {} ) {
  serverOptions.quiet = true
}
