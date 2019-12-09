const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' )

function applyCSSRule( webpackConfig, lang, test, loader, options, env ) {
  const rule = webpackConfig.module
    .rule( lang )
    .test( test )

  const cssModulesRule = rule.oneOf( `${ lang }-modules` )
  const cssRule = rule.oneOf( lang )

  // for *.module.*
  cssModulesRule.test( /\.module\.\w+$/ )

  apply( cssModulesRule, lang, loader, options, env, true )
  apply( cssRule, lang, loader, options, env, false )
}

function apply( rule, lang, loader, options, env, modules ) {
  if ( env === 'production' ) {
    rule.use( 'mini-css-extract' )
      .loader( MiniCssExtractPlugin.loader )
      .options( {
        hmr: false,
      } )
  } else {
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
      ident: 'postcss'
    } )

  if ( loader ) {
    rule.use( lang )
      .loader( loader )
      .options( options || {} )
  }
}
exports.applyCSSRule = applyCSSRule
