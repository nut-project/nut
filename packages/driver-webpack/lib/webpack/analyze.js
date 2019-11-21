const BundleAnalyzerPlugin = require( 'webpack-bundle-analyzer' ).BundleAnalyzerPlugin

exports.extend = function ( config, context ) {
  if ( context.cliOptions.analyze ) {
    config
      .plugin( 'bundle-analyzer' )
      .use( BundleAnalyzerPlugin )
  }
}
