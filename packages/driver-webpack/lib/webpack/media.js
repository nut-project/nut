exports.extend = function ( config ) {
  config.module
    .rule( 'media' )
    .test( /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i )
    .use( 'url' )
    .loader( require.resolve( 'url-loader' ) )
    .options( {
      fallback: require.resolve( 'file-loader' ),
      limit: 8192
    } )
}
