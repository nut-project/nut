const prettyBytes = require( 'pretty-bytes' )
const chalk = require( 'chalk' )

class MemoryUsagePlugin {
  apply( ctx ) {
    const { hook } = ctx.use( 'webpack' )

    hook( 'compilerDone', () => {
      const { heapUsed } = process.memoryUsage()
      console.log( chalk.gray( `\n${ prettyBytes( heapUsed ) } Memory Used\n` ) )
    } )
  }
}

module.exports = MemoryUsagePlugin
