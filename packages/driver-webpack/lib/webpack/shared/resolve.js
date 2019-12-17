const resolveFrom = require( 'resolve-from' )
const path = require( 'path' )

const root = path.join( __dirname, '../../../' )

module.exports = id => {
  return resolveFrom.silent( root, id )
}
