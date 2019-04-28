const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' )

module.exports = function ( test, loader, options, env ) {
  const rule = {
    test,
    oneOf: [
      createRule( loader, options, env, true ),
      createRule( loader, options, env, false ),
    ]
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

  if ( modules ) {
    rule.test = /\.module\.\w+$/
  }

  return rule
}
