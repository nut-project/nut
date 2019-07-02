const path = require( 'path' )
const hashsum = require( 'hash-sum' )

const dirs = {
  cli: path.join( __dirname, '../../' ),
  project: process.cwd(),
}

module.exports = function getAppId( nutConfig ) {
  let pkg = {}
  try {
    pkg = require( dirs.project + '/package.json' )
  } catch ( e ) {}

  return hashsum( Object.assign( {}, pkg, nutConfig ) )
}
