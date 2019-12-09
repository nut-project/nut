const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' )
const { config } = require( '@nut-project/dev-utils' )

const hasPostCSSConfig = Boolean( config( 'postcss' ).loadSync() )

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

  const postcssOptions = {
    ident: 'postcss',
  }

  if ( !hasPostCSSConfig ) {
    // config default postcss config
    // with plugins field set, postcss-loader will not search for config file
    postcssOptions.plugins = [
      require( 'postcss-flexbugs-fixes' ),
      require( 'postcss-preset-env' )( {
        autoprefixer: {
          flexbox: 'no-2009',
        },
        stage: 3,
      } )
    ]
  }

  rule.use( 'postcss' )
    .loader( 'postcss-loader' )
    .options( postcssOptions )

  if ( loader ) {
    rule.use( lang )
      .loader( loader )
      .options( options || {} )
  }
}
exports.applyCSSRule = applyCSSRule
