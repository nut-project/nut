const localResolve = require( './local-resolve' )

module.exports = ( id, context ) => {
  const resolved = localResolve( id, context )

  return resolved ? require( resolved ) : null
}
