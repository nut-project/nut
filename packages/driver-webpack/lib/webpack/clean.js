const { CleanWebpackPlugin } = require( 'clean-webpack-plugin' )

exports.extend = function ( config, context = {} ) {
  const { userConfig = {} } = context
  const clean = userConfig.output && userConfig.output.clean

  // clean by default
  if ( clean !== false ) {
    config.plugin( 'clean' )
      .use( CleanWebpackPlugin )
  }
}
