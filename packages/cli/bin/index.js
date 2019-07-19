#!/usr/bin/env node

const pkg = require( '../package.json' )

require( 'please-upgrade-node' )( pkg, {
  exitCode: 0,
} )

const cli = require( 'cac' )()
const app = require( '../lib' )

process
  .on( 'unhandledRejection', ( reason, p ) => {
    console.error( reason, 'Unhandled Rejection at Promise', p )
  } )

cli
  .command( '', 'Build in development mode' )
  .option( '--prod', 'Build in production mode' )
  .option( '--single-page <page>', 'Build single page to speed up' )
  .option( '--dynamic' )
  .action( options => {
    options = normalizeCliOptions( options )

    if ( options.prod ) {
      app.prod()
    } else {
      app.dev( options )
    }
  } )

cli
  .command( 'create [dir]', 'Generate a new project to target folder' )
  .action( dir => {
    app.create( dir )
  } )

cli.version( pkg.version )

cli.help()

cli.parse()

function normalizeCliOptions( options ) {
  if ( options.singlePage ) {
    options.singlePage = options.singlePage.replace( /^\/+|\/+$/g, '' )
  }

  return options
}
