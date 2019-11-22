const { applyCSSRule } = require( './shared/applyCSSRule' )
exports.extend = function ( config, context = {} ) {
  applyCSSRule( config, 'mcss', /\.mcss$/, null, {}, context.env )
}
