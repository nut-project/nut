const loaderUtils = require( 'loader-utils' )
const qs = require( 'querystring' )

module.exports = source => source

module.exports.pitch = function ( remainingRequest ) {
  const loaderContext = this
  const options = loaderUtils.getOptions( loaderContext ) || {}
  const query = qs.parse( this.resourceQuery.slice( 1 ) )

  const nutifyPath = require.resolve( './runtime/vue-nutify' )

  // only pitch for first time
  if ( typeof query.vue === 'undefined' ) {
    return `
      import Page from ${ JSON.stringify( '-!' + remainingRequest ) };
      import nutify from '${ nutifyPath }'
      export default nutify( Page )
    `
  }
}
