const { applyCSSRule } = require( './shared/applyCSSRule' )
exports.extend = function ( config, context = {} ) {
  applyCSSRule( config, 'css', /\.css$/, null, {}, context.env )
}
