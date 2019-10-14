#!/usr/bin/env node

const path = require( 'path' )
const sao = require( 'sao' )
const cac = require( 'cac' )
const pkg = require( './package.json' )
const cli = cac()

cli
  .command( '[dir]', 'Generate a new project to target folder' )
  .action( async dir => {
    const outDir = path.join( process.cwd(), dir )

    const saoGenerator = sao( {
      generator: __dirname,
      outDir,
      updateCheck: true,
      logLevel: 3
    } )

    await saoGenerator.run().catch( sao.handleError )
  } )

cli.version( pkg.version )
cli.help()
cli.parse()
