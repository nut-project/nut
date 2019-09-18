const { utils } = require( '@nut-project/core' )
const PagesGatherer = require( '@nut-project/gatherer-pages' )
const commands = require( './commands' )
const pkg = require( '../package.json' )

class PagesDriver {
  async apply( cli ) {
    cli
      .command( '', 'Build in development mode' )
      .option( '--prod', 'Build in production mode' )
      .option( '--single-page <page>', 'Build single page to speed up' )
      .option( '--dynamic' )
      .action( async options => {
        options = normalizeCliOptions( options )

        utils.poweredBy( pkg.name, pkg.version )

        const gatherer = new PagesGatherer( `nut` )

        let env

        if ( options.prod ) {
          env = 'production'
        } else {
          env = 'development'
        }

        process.env.NODE_ENV = env

        commands[ env ]( await gatherer.apply( env ), options )
      } )

    cli
      .command( 'create [dir]', 'Generate a new project to target folder' )
      .action( dir => {
        commands.create( dir )
      } )
  }
}

function normalizeCliOptions( options ) {
  if ( options.singlePage ) {
    options.singlePage = options.singlePage.replace( /^\/+|\/+$/g, '' )
  }

  return options
}

module.exports = PagesDriver
