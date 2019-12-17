const prettyBytes = require( 'pretty-bytes' )
const chalk = require( 'chalk' )

class MemoryUsagePlugin {
  apply( ctx ) {
    const { hook } = ctx.use( 'webpack' )

    hook( 'compilerDone', () => {
      const { heapUsed } = process.memoryUsage()
      setTimeout( () => {
        console.log( chalk.gray( `\n${ prettyBytes( heapUsed ) } Memory Used\n` ) )
      }, 1000 )
    } )
  }
}

module.exports = MemoryUsagePlugin
