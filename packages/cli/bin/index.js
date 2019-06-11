#!/usr/bin/env node

const cli = require('cac')()
const app = require( '../lib' )

cli.option( '--prod', 'build in production mode' )

cli.version( require( '../package.json' ).version )

cli.help()

const parsed = cli.parse()

if ( parsed.options.prod ) {
  app.prod()
} else {
  app.dev()
}
