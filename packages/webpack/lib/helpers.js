const path = require( 'path' )

function webpackResolve( request ) {
  const root = path.dirname( require.resolve( 'webpack/package.json' ) )
  return path.join( root, request )
}

function webpackRequire( request ) {
  return require( webpackResolve( request ) )
}

exports.webpackResolve = webpackResolve
exports.webpackRequire = webpackRequire
