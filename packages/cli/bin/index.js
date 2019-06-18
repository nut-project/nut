#!/usr/bin/env node

const cli = require('cac')()
const app = require('../lib')
const process = require('child_process')
const path = require('path')

cli.option('--prod', 'build in production mode')

cli
  .command('create <filename>', 'Generate a new project to target folder')
  .option(
    '--npm-client <client>',
    `Choose an npm client for installing packages ('yarn' | 'npm' | 'pnpm')`
  )
  .action(async (dir, {npmClient}) => {
    //sao 脚手架
    let command = 'sao ' + __dirname + '/../sao-sample ./' + dir;

    const sao = require('sao')

    const app = sao({
      generator: path.join(__dirname, '../sao-sample'),
      outDir: dir,
      npmClient
    })

    await app.run().catch(sao.handleError)

  })

cli.version(require('../package.json').version)

cli.help()

const parsed = cli.parse()

// if ( parsed.options.prod ) {
//   app.prod()
// } else {
//   app.dev()
// }
