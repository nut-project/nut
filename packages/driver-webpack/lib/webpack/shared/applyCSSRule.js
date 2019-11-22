const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' )
function applyCSSRule( webpackConfig, lang, test, loader, options, env ) {
  const rule = webpackConfig.module
    .rule( lang )
    .test( test )

  const normalCSSModulesRule = rule.oneOf( 'normal-css-modules' )
  const normalCSSRule = rule.oneOf( 'normal-css' )

  // for *.module.*
  normalCSSModulesRule.test( /\.module\.\w+$/ )

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
exports.applyCSSRule = applyCSSRule
