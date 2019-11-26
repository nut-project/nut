const path = require( 'path' )

exports.extend = function ( config, context = {} ) {
  const { userConfig = {} } = context

  // extensions
  config.resolve.extensions
    .merge( [
      '.js', '.json',
      '.css', '.less', '.scss', '.sass', '.mcss', '.styl', '.stylus',
    ] )

  // alias
  const alias = userConfig.alias || {}
  for ( const key of Object.keys( alias ) ) {
    config.resolve.alias.set( key, alias[ key ] )
  }

  // modules and loaders
  const root = path.join( __dirname, '../../' )

  config.resolve.modules
    .add( 'node_modules' ) // use closest node_modules first
    .add( path.join( process.cwd(), 'node_modules' ) )
    .add( path.join( root, 'node_modules' ) )
    .add( path.join( root, '../../' ) )

  config.resolveLoader.modules
    .add( 'node_modules' )
    .add( path.join( process.cwd(), 'node_modules' ) )
    .add( path.join( root, 'node_modules' ) )
    .add( path.join( root, '../../' ) )
}
