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
  .action( options => {
    if ( options.prod ) {
      app.prod()
    } else {
      app.dev()
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
