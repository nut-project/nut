const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' )
const createCSSRule = require( '../utils/createCSSRule' )

module.exports = function ( webpackConfig = {}, env = 'dev' ) {
  const rules = webpackConfig.module.rules
  rules.push(
    createCSSRule( /\.less$/, 'less-loader', {}, env ),
    createCSSRule( /\.scss$/, 'sass-loader', {
      implementation: require( 'sass' )
    }, env ),
    createCSSRule( /\.sass/, 'sass-loader', {
      implementation: require( 'sass' ),
      indentedSyntax: true,
    }, env ),
    createCSSRule( /\.styl(us)?$/, 'stylus-loader', {
      preferPathResolver: 'webpack',
    }, env ),
    createCSSRule( /\.css$/, null, {}, env ),
  )

  webpackConfig.plugins.push(
    new MiniCssExtractPlugin( {
      filename: '[name].[contenthash].css',
    } ),
  )
}
