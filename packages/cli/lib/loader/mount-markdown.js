const pathUtils = require( '../utils/pathUtils' )

module.exports = function ( source ) {

  const nutifyPath = pathUtils.toRelative( require.resolve( './nutify/markdown' ) )

  return `
    import nutify from '${ nutifyPath }'
    export default nutify( ${ JSON.stringify( source ) } )
  `
}
