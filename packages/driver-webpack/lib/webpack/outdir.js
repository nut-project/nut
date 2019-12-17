const path = require( 'path' )

exports.extend = function ( config, context = {} ) {
  const { userConfig = {} } = context

  const outdir = userConfig.output && userConfig.output.path
  if ( outdir ) {
    config.output.path( outdir )
  } else {
    config.output.path( path.join( process.cwd(), 'dist' ) )
  }
}
