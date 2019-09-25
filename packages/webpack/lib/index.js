exports.createConfig = require( './create-config' )
exports.serve = require( './serve' )
exports.build = require( './build' )

exports.getBabelOptions = ( { browserslist } = {} ) => {
  return {
    presets: [
      [
        require.resolve( '@babel/preset-env' ),
        {
          targets: {
            browsers: browserslist
          }
        }
      ]
    ],
    plugins: [
      require.resolve( '@babel/plugin-transform-runtime' ),
      require.resolve( '@babel/plugin-syntax-dynamic-import' ),
    ],
    sourceType: 'unambiguous',
  }
}

exports.webpack = require( 'webpack' )
exports.WebpackDevServer = require( 'webpack-dev-server' )
