const createGatherer = require( '@nut-project/gatherer-pages' )
const Runtime = require( '@nut-project/runtime-pages' )
const commands = require( './commands' )

module.exports = function ( cli ) {
  cli
    .command( '', 'Build in development mode' )
    .option( '--prod', 'Build in production mode' )
    .option( '--single-page <page>', 'Build single page to speed up' )
    .option( '--dynamic' )
    .action( async options => {
      const runtime = new Runtime()

      options = normalizeCliOptions( options )

      let env

      if ( options.prod ) {
        env = 'production'
      } else {
        env = 'development'
      }

      process.env.NODE_ENV = env

      commands[ env ](
        await createGatherer( {
          name: 'nut',
          env,
        } ),
        runtime,
        options
      )
    } )

  cli
    .command( 'create [dir]', 'Generate a new project to target folder' )
    .action( dir => {
      commands.create( dir )
    } )
}

function normalizeCliOptions( options ) {
  if ( options.singlePage ) {
    options.singlePage = options.singlePage.replace( /^\/+|\/+$/g, '' )
  }

  return options
}
