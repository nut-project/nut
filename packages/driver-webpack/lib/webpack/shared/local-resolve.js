const resolveFrom = require( 'resolve-from' )

module.exports = ( id, context = process.cwd() ) => {
  return resolveFrom.silent( context, id )
}
