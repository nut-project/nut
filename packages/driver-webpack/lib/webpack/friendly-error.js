const FriendlyErrorsWebpackPlugin = require( 'friendly-errors-webpack-plugin' )

exports.extend = function ( config, context = {} ) {
  const { env, cliOptions, userConfig, cli } = context // eslint-disable-line

  config
    .plugin( 'friendly-error' )
    .use( FriendlyErrorsWebpackPlugin, [
      { clearConsole: false }
    ] )
}
