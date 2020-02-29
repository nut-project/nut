const FriendlyErrorsWebpackPlugin = require( 'friendly-errors-webpack-plugin' )
const output = require( 'friendly-errors-webpack-plugin/src/output' )

const ID = `FriendlyErrorsPlugin`

class FriendlyErrorsPlugin {
  apply( compiler ) {
    const friendlyError = new FriendlyErrorsWebpackPlugin( {
      clearConsole: false,
      additionalTransformers: [
        require( '../error/transformer-module-not-found' ),
      ]
    } )

    friendlyError.apply( compiler )

    compiler.hooks.failed.tap( ID, error => {
      friendlyError.clearConsole()
      output.title( 'error', 'ERROR', `Failed to compile with 1 errors` )
      console.log( error.stack || error.message )
    } )
  }
}

module.exports = FriendlyErrorsPlugin
