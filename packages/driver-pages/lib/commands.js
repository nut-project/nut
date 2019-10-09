const path = require( 'path' )
const sao = require( 'sao' )
const Core = require( './core' )

module.exports = scope => cli => {
  cli
    .command( 'dev', 'Build in development mode' )
    .option( '--single-page <page>', 'Build single page to speed up' )
    .option( '--dynamic' )
    .action( createAction( scope, 'development' ) )

  cli
    .command( 'build', 'Build in production mode' )
    .action( createAction( scope, 'production' ) )

  cli
    .command( 'create [dir]', 'Generate a new project to target folder' )
    .action( async dir => {
      const outDir = path.join( process.cwd(), dir )

      const saoGenerator = sao( {
        generator: path.join( __dirname, './templates/simple' ),
        outDir,
        updateCheck: true,
        logLevel: 3
      } )

      await saoGenerator.run().catch( sao.handleError )
    } )
}

function createAction( scope, env ) {
  return async function ( cliOptions = {} ) {
    process.env.NODE_ENV = env

    await new Core( {
      env,
      scope,
      cliOptions,
    } ).apply()
  }
}
