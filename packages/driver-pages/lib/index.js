const pkg = require( '../package.json' )
const Driver = require( './driver' )

exports.name = pkg.name
exports.version = pkg.version
exports.scope = 'pages'
exports.apply = function ( { register, scope } ) {
  register( cli => new Driver( { cli, scope } ).apply() )
}
