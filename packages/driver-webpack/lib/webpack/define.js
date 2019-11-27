const { webpack } = require( '@nut-project/webpack' )

exports.extend = function ( config, context = {} ) {
  const { userConfig = {} } = context
  const constants = userConfig.constants || {}

  config.plugin( 'define' )
    .use( webpack.DefinePlugin, [ constants ] )
}
