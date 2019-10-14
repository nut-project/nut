const qs = require( 'querystring' )
const pathUtils = require( '../utils/path-utils' )

module.exports = source => source

module.exports.pitch = function ( remainingRequest ) {
  const query = qs.parse( this.resourceQuery.slice( 1 ) )

  const nutifyPath = pathUtils.toRelative( require.resolve( './nutify/react.js' ) )

  // only pitch for first time
  if ( typeof query.vue === 'undefined' ) {
    return `
      import * as all from ${ JSON.stringify( '-!' + remainingRequest ) };
      import nutify from '${ nutifyPath }'

      // all: default + attributes
      export default nutify( all )
    `
  }
}
