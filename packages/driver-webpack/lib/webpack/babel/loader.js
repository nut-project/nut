const babelLoader = require( 'babel-loader' )

const overrides = {}

module.exports = babelLoader.custom( () => {
  return overrides
} )

module.exports.override = function ( getOverrides = () => {} ) {
  let localBabel

  babelLoader.custom( babel => {
    localBabel = babel
  } )

  Object.assign( overrides, getOverrides( localBabel ) || {} )
}
