const { webpack } = require( '@nut-project/webpack' )

exports.extend = function ( config, context = {} ) {
  const { userConfig = {} } = context
  const constants = userConfig.constants || {}

  config.plugin( 'define' )
    .use( webpack.DefinePlugin, [ constants ] )
}

exports.expose = function ( driver ) {
  driver.expose( 'constant', ( key, value ) => {
    driver.useHook( 'dangerously_chainWebpack', config => {
      config.plugin( 'define' )
        .tap( args => {
          args[ 0 ] = args[ 0 ] || {}
          args[ 0 ][ key ] = value
          return args
        } )
    } )
  } )
}
