const path = require( 'path' )

module.exports = function ( ctx ) {
  console.log( 'pages.config.js ctx:', ctx )
  return {
    config: {
      output: {
        path: path.join( __dirname, '../test' ),
      },
      devServer: {
        port: 9001,
      },
    },

    plugins: {
      rem: {
        resolve: require.resolve( './plugins/plugin-rem' ),
        options: {
          x: 1
        },
        enable: true,
      },
    },
  }
}
