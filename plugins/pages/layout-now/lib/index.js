const path = require( 'path' )

exports.name = 'layout-now'
exports.apply = ( api, options ) => {
  api.addRuntimeModule( {
    file: path.join( __dirname, 'runtime.js' ),
    options,
  } )
}
