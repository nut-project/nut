const path = require( 'path' )

exports.name = 'layout-kaola'
exports.apply = api => {
  api.addRuntimeModule( {
    file: path.join( __dirname, './runtime.js' ),
  } )
}
