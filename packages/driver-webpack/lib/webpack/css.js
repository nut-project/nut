const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' )
const { applyCSSRule } = require( './shared/apply-css-rule' )

exports.extend = function ( config, context = {} ) {
  applyCSSRule( config, 'css', /\.css$/, null, {}, context.env )

  applyCSSRule( config, 'less', /\.less$/, 'less-loader', {}, context.env )

  applyCSSRule( config, 'sass', /\.sass$/, 'sass-loader', {
    implementation: require( 'sass' ),
    indentedSyntax: true,
  }, context.env )

  applyCSSRule( config, 'scss', /\.scss$/, 'sass-loader', {
    implementation: require( 'sass' )
  }, context.env )

  applyCSSRule( config, 'mcss', /\.mcss$/, null, {}, context.env )

  applyCSSRule( config, 'stylus', /\.styl(us)?$/, 'stylus-loader', {
    preferPathResolver: 'webpack',
  }, context.env )

  if ( context.env === 'production' ) {
    config
      .plugin( 'extract-css' )
      .use( MiniCssExtractPlugin, [ {
        filename: `[name].[contenthash].css`,
        chunkFilename: `[name].[contenthash].css`,
      } ] )
  }
}
