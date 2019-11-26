const path = require( 'path' )

module.exports = function ( segment ) {
  return path.join( process.cwd(), segment )
}
