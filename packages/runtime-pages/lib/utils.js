const hashsum = require( 'hash-sum' )

exports.getUniqueApplicationId = function getUniqueApplicationId( config ) {
  let pkg = {}
  try {
    pkg = require( process.cwd() + '/package.json' )
  } catch ( e ) {}

  return hashsum( {
    pkg,
    config,
  } )
}
