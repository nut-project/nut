exports.extend = function ( config ) {
  config.module
    .rule( 'font' )
    .test( /\.(ttf|eot|woff|woff2|svg)(\?t=\d+)?$/i )
    .use( 'url' )
    .loader( require.resolve( 'url-loader' ) )
    .options( {
      fallback: require.resolve( 'file-loader' ),
      limit: 8192,
      name: `static/fonts/[name].[hash:16].[ext]`
    } )
}
