exports.extend = function ( config, context = {} ) {
  if ( context.env === 'production' ) {
    config.output.filename( '[name].[contenthash].js' )
  } else {
    config.output.filename( '[name].[hash:16].js' )
  }
}
