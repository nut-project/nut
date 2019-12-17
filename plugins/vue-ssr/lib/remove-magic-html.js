module.exports = function ( serverOptions ) {
  const features = []

  if ( serverOptions.compress ) {
    features.push( 'compress' )
  }

  features.push( 'setup', 'before', 'headers', 'middleware' )

  if ( serverOptions.proxy ) {
    features.push( 'proxy', 'middleware' )
  }

  if ( serverOptions.contentBase !== false ) {
    features.push( 'contentBaseFiles' )
  }

  if ( serverOptions.historyApiFallback ) {
    features.push( 'historyApiFallback', 'middleware' )

    if ( serverOptions.contentBase !== false ) {
      features.push( 'contentBaseFiles' )
    }
  }

  // features.push( 'contentBaseIndex' )

  if ( serverOptions.watchContentBase ) {
    features.push( 'watchContentBase' )
  }

  if ( serverOptions.after ) {
    features.push( 'after' )
  }

  serverOptions.features = features
}
