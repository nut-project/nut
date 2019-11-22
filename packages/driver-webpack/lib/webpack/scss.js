const { applyCSSRule } = require( './shared/applyCSSRule' )
exports.extend = function ( config, context = {} ) {
  applyCSSRule( config, 'scss', /\.s[ac]ss$/, 'sass-loader', {
    implementation: require( 'sass' )
  }, context.env )
}
