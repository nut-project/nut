const path = require( 'path' )
const sao = require( 'sao' )

module.exports = cli => {
  cli
    .command( 'create [dir]', 'Generate a new project to target folder' )
    .action( async dir => {
      const outDir = path.join( process.cwd(), dir )

      console.log( outDir )

      const saoGenerator = sao( {
        generator: path.join( __dirname, './templates/simple' ),
        outDir,
        updateCheck: true,
        logLevel: 3
      } )

      await saoGenerator.run().catch( sao.handleError )
    } )
}
