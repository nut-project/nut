const pkg = require( '../package.json' )

exports.name = pkg.name
exports.version = pkg.version
exports.apply = function ( { register } ) {
  const scope = 'pages'
  register( scope, require( './commands' )( scope ) )
}
