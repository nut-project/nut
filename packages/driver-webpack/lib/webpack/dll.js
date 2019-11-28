exports.extend = function ( config, context = {} ) {
  const { env = '', userConfig = {} } = context

  if ( env === 'production' ) {
    return
  }

  if ( Boolean( userConfig.dll ) === false ) {
    return
  }

  const dllLibraries = Array.isArray( userConfig.dll ) ?
    userConfig.dll :
    []

  config.plugin( 'dll' )
    .use( require( 'autodll-webpack-plugin' ), [
      {
        inject: true,
        debug: true,
        path: './dll',
        filename: '[name].[hash:8].js',
        entry: {
          vendor: dllLibraries
        },
      }
    ] )
}
