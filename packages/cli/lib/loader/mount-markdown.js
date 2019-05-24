const pathUtils = require( '../utils/path-utils' )

module.exports = function ( source ) {

  const nutifyPath = pathUtils.toRelative( require.resolve( './nutify/markdown' ) )

  return `
    import nutify from '${ nutifyPath }'
    export default nutify( ${ JSON.stringify( source ) } )
  `
}
