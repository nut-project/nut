const path = require( 'path' )
const sao = require( 'sao' )

module.exports = async function ( outDir = '' ) {
  outDir = path.join( process.cwd(), outDir )

  const saoGenerator = sao( {
    generator: path.join( __dirname, '../templates/simple' ),
    outDir,
    updateCheck: true,
    logLevel: 3
  } )

  await saoGenerator.run().catch( sao.handleError )
}
