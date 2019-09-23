const { utils } = require( '@nut-project/core' )
const commands = require( './commands' )
const pkg = require( '../package.json' )

class PagesDriver {
  constructor( { gatherer, runtime } = {} ) {
    const Gatherer = require( gatherer )
    const Runtime = require( runtime )

    this.gatherer = new Gatherer( 'nut' )
    this.runtime = new Runtime()
  }

  async apply( cli ) {
    const gatherer = this.gatherer
    const runtime = this.runtime

    cli
      .command( '', 'Build in development mode' )
      .option( '--prod', 'Build in production mode' )
      .option( '--single-page <page>', 'Build single page to speed up' )
      .option( '--dynamic' )
      .action( async options => {
        options = normalizeCliOptions( options )

        utils.poweredBy( pkg.name, pkg.version )

        let env

        if ( options.prod ) {
          env = 'production'
        } else {
          env = 'development'
        }

        process.env.NODE_ENV = env

        commands[ env ]( await gatherer.apply( env ), runtime, options )
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
