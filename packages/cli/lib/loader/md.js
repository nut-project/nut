const marked = require( 'marked' )
const loaderUtils = require( 'loader-utils' )

module.exports = function ( source ) {
  const loaderContext = this
  const options = loaderUtils.getOptions( loaderContext )

  marked.setOptions( options )

  return marked( source )
}
