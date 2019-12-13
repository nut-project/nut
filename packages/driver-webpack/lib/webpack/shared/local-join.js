const path = require( 'path' )

module.exports = function ( segment ) {
  if ( path.isAbsolute( segment ) ) {
    return segment
  }

  return path.join( process.cwd(), segment )
}
