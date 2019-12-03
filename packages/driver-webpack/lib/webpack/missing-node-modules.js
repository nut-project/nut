const path = require( 'path' )
const WatchMissingNodeModulesPlugin = require( './plugins/WatchMissingNodeModulesPlugin' )

exports.extend = function ( config ) {
  config.plugin( 'watch-missing-node-modules' )
    .use( WatchMissingNodeModulesPlugin, [
      path.join( process.cwd(), 'node_modules' )
    ] )
}
