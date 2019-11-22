const { applyCSSRule } = require( './shared/applyCSSRule' )
exports.extend = function ( config, context = {} ) {
  applyCSSRule( config, 'less', /\.less$/, 'less-loader', {}, context.env )
}
