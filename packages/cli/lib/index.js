require( 'v8-compile-cache' )

module.exports = {
  dev: require( './commands/dev' ),
  prod: require( './commands/prod' ),
}
