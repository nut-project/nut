const webpack = require( 'webpack' )
const CaseSensitivePathsPlugin = require( 'case-sensitive-paths-webpack-plugin' )
const css = require( './css' )

module.exports = function ( config ) {
  css( config, 'development' )

  config.mode( 'development' )
  config.devtool( 'cheap-module-source-map' )
  config.output
    .filename( '[name].[hash:16].js' )
  config
    .plugin( 'hot' )
      .use( webpack.HotModuleReplacementPlugin ) // eslint-disable-line
  config.plugin( 'case-sensitive-paths' )
    .use( CaseSensitivePathsPlugin )

  return config
}
