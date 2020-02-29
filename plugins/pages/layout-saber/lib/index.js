const path = require( 'path' )

exports.name = 'layout-saber'
exports.apply = api => {
  api.addRuntimeModule( {
    file: path.join( __dirname, './runtime.js' ),
  } )
}
