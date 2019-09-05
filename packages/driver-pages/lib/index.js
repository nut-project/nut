const { Driver, utils } = require( '@nut-project/core' )
const commands = require( './commands' )
const pkg = require( '../package.json' )

module.exports = class WebpackDriver extends Driver {
  name() {
    return `nut` // pages.config.js
  }

  async apply( cli ) {
    cli
      .command( '', 'Build in development mode' )
      .option( '--prod', 'Build in production mode' )
      .option( '--single-page <page>', 'Build single page to speed up' )
      .option( '--dynamic' )
      .action( options => {
        options = normalizeCliOptions( options )

        utils.poweredBy( pkg.name, pkg.version )

        if ( options.prod ) {
          commands.prod()
        } else {
          commands.dev( options )
        }
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
