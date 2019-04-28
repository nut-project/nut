const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' )

module.exports = function ( test, loader, options, env ) {
  const vueCSSModulesRule = createRule( loader, options, env, true )
  const normalCSSModulesRule = createRule( loader, options, env, true )
  const normalCSSRule = createRule( loader, options, env, false )

  // for css from vue sfc
  vueCSSModulesRule.resourceQuery = /module/
  // for *.module.*
  normalCSSModulesRule.test = /\.module\.\w+$/

  const rule = {
    test,
    oneOf: [ vueCSSModulesRule, normalCSSModulesRule, normalCSSRule ]
  }

  return rule
}

function createRule( loader, options, env, modules ) {
  const rule = {
    use: [
      env === 'prod' ?
        {
          loader: MiniCssExtractPlugin.loader,
          options: {
            hmr: false,
          },
        } :
        null,
      env === 'dev' ?
        {
          loader: 'style-loader',
        } :
        null,
      {
        loader: 'css-loader',
        options: {
          modules,
          localIdentName: "[local]___[hash:base64:5]",
          importLoaders: loader ? 2 : 1,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          plugins: [
            require( 'autoprefixer' )
          ],
        },
      },
      loader ?
        {
          loader: loader,
          options: options || {}
        } :
        null
    ].filter( Boolean )
  }

  return rule
}
