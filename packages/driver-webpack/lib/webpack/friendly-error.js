const FriendlyErrorsWebpackPlugin = require( 'friendly-errors-webpack-plugin' )

exports.extend = function ( config ) {
  config
    .plugin( 'friendly-error' )
    .use( FriendlyErrorsWebpackPlugin, [
      {
        clearConsole: false,
        additionalTransformers: [
          require( './error/transformer-module-not-found' ),
        ]
      }
    ] )
}

exports.extendDevServer = function ( serverOptions = {} ) {
  serverOptions.quiet = true
}
