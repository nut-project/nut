exports.extend = function ( config, context = {} ) {
  const { env, cliOptions, userConfig, cli } = context // eslint-disable-line

  config.module
    .rule( 'image' )
    .test( /\.(png|jpg|gif)$/i )
    .use( 'url' )
    .loader( require.resolve( 'url-loader' ) )
    .options( {
      fallback: require.resolve( 'file-loader' ),
      limit: 8192
    } )
}
