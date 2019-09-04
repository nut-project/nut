const fm = require( 'front-matter' )
const pathUtils = require( '../utils/path-utils' )
const marked = require( '../utils/marked' )

module.exports = function ( source ) {
  const nutifyPath = pathUtils.toRelative( require.resolve( './nutify/markdown' ) )

  const result = fm( source )

  const html = marked( result.body )

  return `
    import nutify from '${ nutifyPath }'
    export default nutify( {
      default: ${ JSON.stringify( html ) },
      attributes: ${ JSON.stringify( result.attributes || {} ) },
    } )
  `
}
