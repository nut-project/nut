const commands = require( './register-commands' )

module.exports = function ( cli ) {
  cli.use( commands )
}
