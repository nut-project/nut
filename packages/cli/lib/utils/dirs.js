const path = require( 'path' )

module.exports = {
  cli: path.join( __dirname, '../../' ),
  project: process.cwd(),
  runtime: path.join(
    path.dirname( require.resolve( '@nut-project/runtime/package' ) ),
    'src'
  )
}
