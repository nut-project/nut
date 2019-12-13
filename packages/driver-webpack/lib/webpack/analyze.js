const BundleAnalyzerPlugin = require( 'webpack-bundle-analyzer' ).BundleAnalyzerPlugin

exports.extend = function ( config, context ) {
  const analyze = context.cliOptions && context.cliOptions.analyze

  if ( analyze ) {
    config
      .plugin( 'bundle-analyzer' )
      .use( BundleAnalyzerPlugin )
  }
}
