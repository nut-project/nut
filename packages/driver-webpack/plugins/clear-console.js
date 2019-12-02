const readline = require( 'readline' )

class ClearConsoleBeforeRunPlugin {
  apply( ctx ) {
    const { hook } = ctx.use( 'webpack' )
    hook( 'env', env => {
      if ( env === 'development' ) {
        hook( 'beforeRun', async () => {
          clearConsole()
        } )
      }
    } )
  }
}

module.exports = ClearConsoleBeforeRunPlugin

// from friendly-errors-webpack-plugin
function clearConsole() {
  if ( process.stdout.isTTY ) {
    const blank = '\n'.repeat( process.stdout.rows )
    console.log( blank )
    readline.cursorTo( process.stdout, 0, 0 )
    readline.clearScreenDown( process.stdout )
  }
}
