const pkg = require( '../package.json' )

exports.name = pkg.name
exports.version = pkg.version
exports.apply = function ( { register } ) {
  register( 'pages', require( './commands' ) )
}
