exports.extend = function ( config, context = {} ) {
  if ( context.env === 'production' ) {
    config.output.filename( '[name].[contenthash:8].js' )
    config.output.chunkFilename( '[name].[contenthash:8].js' )
  } else {
    // https://survivejs.com/webpack/optimizing/adding-hashes-to-filenames/#placeholders
    // also create-react-app doesn't use hash during development
    config.output.filename( '[name].js' )
    config.output.chunkFilename( '[name].js' )
  }
}
