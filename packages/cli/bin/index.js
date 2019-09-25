#!/usr/bin/env node

require( 'v8-compile-cache' )
const pkg = require( '../package.json' )

require( 'please-upgrade-node' )( pkg, {
  exitCode: 0,
} )

process
  .on( 'unhandledRejection', ( reason, p ) => {
    console.error( reason, 'Unhandled Rejection at Promise', p )
  } )

const musubi = require( '@nut-project/musubi' )
const driver = require( '@nut-project/driver-pages' )

;( async () => {
  const cli = musubi()

  driver( cli )

  await cli.apply( {
    version: pkg.version
  } )
} )()
