#!/usr/bin/env node

const cli = require('cac')()
const app = require('../lib')
const process = require('child_process')
const path = require('path')


  //default command
  cli
  // Simply omit the command name, just brackets
  .command('[...files]', 'Build files default')
  .option('--prod', 'build in production mode')
  .action((files, options) => {
    //parse file
    parseFile(options.prod)
  })


cli
  .command('create <projectname>', 'Generate a new project to target folder')
  .option(
    '--npm-client <client>',
    `Choose an npm client for installing packages ('yarn' | 'npm' | 'pnpm')`
  )
  .action(async (dir, { npmClient }) => {
    const sao = require('sao')
    const saoGenerator = sao({
      generator: path.join(__dirname, '../sao-sample'),
      outDir: dir,
      npmClient
    })

    await saoGenerator.run().then((res) => {
      //parse file
      // parseFile(parsed.options.prod);
    }).catch(saoGenerator.handleError)

  })



cli.version(require('../package.json').version)

cli.help()

const parsed = cli.parse()



function parseFile(isProd) {
  if (isProd) {
    app.prod();
    return;
  }
  app.dev();
}