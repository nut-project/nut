const prettyBytes = require( 'pretty-bytes' )
const chalk = require( 'chalk' )
const { Plugin } = require( '@nut-project/core' )

class MemoryUsagePlugin extends Plugin {
  apply() {
    const { hook } = this.use( 'webpack' )

    hook( 'compilerDone', () => {
      const { heapUsed } = process.memoryUsage()
      console.log( chalk.gray( `\n${ prettyBytes( heapUsed ) } Memory Used\n` ) )
    } )
  }
}

module.exports = MemoryUsagePlugin
