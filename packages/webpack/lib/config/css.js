/* eslint-disable indent */

// https://github.com/webpack-contrib/mini-css-extract-plugin/issues/413
const MiniCssExtractPlugin = require( '@nut-project/mini-css-extract' )

module.exports = function applyCSSRules( webpackConfig = {}, env = 'development' ) {
  applyCSSRule( webpackConfig, 'less', /\.less$/, 'less-loader', {
    javascriptEnabled: true,
  }, env )

  applyCSSRule( webpackConfig, 'scss', /\.scss$/, 'sass-loader', {
    implementation: require( 'sass' )
  }, env )

  applyCSSRule( webpackConfig, 'sass', /\.sass/, 'sass-loader', {
    implementation: require( 'sass' ),
    indentedSyntax: true,
  }, env )

  applyCSSRule( webpackConfig, 'stylus', /\.styl(us)?$/, 'stylus-loader', {
    preferPathResolver: 'webpack',
  }, env )

  applyCSSRule( webpackConfig, 'css', /\.css$/, null, {}, env )

  if ( env === 'production' ) {
    webpackConfig.plugin( 'mini-css-extract' )
      .use( MiniCssExtractPlugin, [ {
        filename: `[name].[contenthash].css`,
        chunkFilename: `[name].[contenthash].css`,
      } ] )
  }
}

function applyCSSRule( webpackConfig, lang, test, loader, options, env ) {
  const rule = webpackConfig.module
    .rule( lang )
    .test( test )

  const vueCSSModulesRule = rule.oneOf( 'vue-css-modules' )
  const normalCSSModulesRule = rule.oneOf( 'normal-css-modules' )
  const normalCSSRule = rule.oneOf( 'normal-css' )

  // for css from vue sfc
  vueCSSModulesRule.resourceQuery( /module/ )
  // for *.module.*
  normalCSSModulesRule.test( /\.module\.\w+$/ )

  applyOneOfRule( vueCSSModulesRule, lang, loader, options, env, true )
  applyOneOfRule( normalCSSModulesRule, lang, loader, options, env, true )
  applyOneOfRule( normalCSSRule, lang, loader, options, env, false )
}

function applyOneOfRule( rule, lang, loader, options, env, modules ) {
  if ( env === 'production' ) {
    rule.use( 'mini-css-extract' )
      .loader( MiniCssExtractPlugin.loader )
      .options( {
        hmr: false,
      } )
  }

  if ( env === 'development' ) {
    rule.use( 'style' )
      .loader( 'style-loader' )
  }

  rule.use( 'css' )
    .loader( 'css-loader' )
    .options( {
      modules: modules ? {
        localIdentName: '[local]___[hash:base64:5]',
      } : false,
      importLoaders: loader ? 2 : 1,
    } )

  rule.use( 'postcss' )
    .loader( 'postcss-loader' )
    .options( {
      plugins: [
        require( 'autoprefixer' )()
      ],
    } )

  if ( loader ) {
    rule.use( lang )
      .loader( loader )
      .options( options || {} )
  }
}
