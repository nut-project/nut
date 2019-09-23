#!/usr/bin/env node

require( 'v8-compile-cache' )
const path = require( 'path' )
const pkg = require( '../package.json' )

require( 'please-upgrade-node' )( pkg, {
  exitCode: 0,
} )

const cli = require( 'cac' )()
const Driver = require( '@nut-project/driver-pages' )

process
  .on( 'unhandledRejection', ( reason, p ) => {
    console.error( reason, 'Unhandled Rejection at Promise', p )
  } )

;( async () => {
  const driver = new Driver( {
    gatherer: path.dirname(
      require.resolve( '@nut-project/gatherer-pages/package' )
    ),
    runtime: path.dirname(
      require.resolve( '@nut-project/runtime-pages/package' )
    ),
  } )
  await driver.apply( cli )

  cli.version( pkg.version )
  cli.help()
  cli.parse()
} )()
