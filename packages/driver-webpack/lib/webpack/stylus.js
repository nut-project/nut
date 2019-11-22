const { applyCSSRule } = require( './shared/applyCSSRule' )
exports.extend = function ( config, context = {} ) {
  applyCSSRule( config, 'stylus', /\.styl(us)?$/, 'stylus-loader', {
    preferPathResolver: 'webpack',
  }, context.env )
}
