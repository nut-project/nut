const { webpack } = require( '@nut-project/webpack' )

exports.extend = function ( config, context = {} ) {
  const { userConfig = {} } = context
  const envs = userConfig.envs || {}

  config
    .plugin( 'envs' )
    .use( webpack.DefinePlugin, [ envs ] )
}

exports.expose = function ( driver ) {
  driver.expose( 'env', ( key, value ) => {
    driver.useHook( 'dangerously_chainWebpack', config => {
      config.plugin( 'envs' )
        .tap( args => {
          args[ 0 ] = args[ 0 ] || {}
          args[ 0 ][ key ] = value
          return args
        } )
    } )
  } )
}
