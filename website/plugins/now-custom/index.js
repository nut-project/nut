const path = require( 'path' )

exports.name = 'layout-now-custom'
exports.apply = api => {
  api.addRuntimeModule( {
    file: path.join( __dirname, './runtime.js' ),
  } )
}
