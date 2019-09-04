const hashsum = require( 'hash-sum' )
const dirs = require( './dirs' )

module.exports = function getAppId( nutConfig ) {
  let pkg = {}
  try {
    pkg = require( dirs.project + '/package.json' )
  } catch ( e ) {}

  return hashsum( Object.assign( {}, pkg, nutConfig ) )
}
