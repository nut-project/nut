const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' )

exports.extend = function ( config ) {
  config
    .plugin( 'extract-css' )
    .use( MiniCssExtractPlugin, [ {
      filename: `[name]_[chunkhash:16].css`,
      chunkFilename: `[id]_[chunkhash:16].css`
    } ] )
}
