exports.extend = function ( config ) {
  config.module
    .rule( 'image' )
    .test( /\.(png|jpg|jpeg|gif)$/i )
    .use( 'url' )
    .loader( require.resolve( 'url-loader' ) )
    .options( {
      fallback: require.resolve( 'file-loader' ),
      limit: 8192,
      name: `static/img/[name].[hash:16].[ext]`
    } )

  config.module
    .rule( 'media' )
    .test( /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i )
    .use( 'url' )
    .loader( require.resolve( 'url-loader' ) )
    .options( {
      fallback: require.resolve( 'file-loader' ),
      limit: 8192,
      name: `./static/media/[name].[hash:16].[ext]`
    } )
}
