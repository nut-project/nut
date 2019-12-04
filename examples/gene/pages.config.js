module.exports = function ( ctx ) {
  console.log( 'pages.config.js ctx:', ctx )
  return {
    config: {
      devServer: {
        port: 9001,
        proxy: {
          '/api': 'http://127.0.0.1:8001'
        }
      },
    },

    plugins: {
      rem: {
        resolve: require.resolve( './plugins/plugin-rem' ),
        options: {
          x: 1
        }
      },
      cmock: {
        resolve: require.resolve( './plugins/plugin-mock-proxy' ),
      },
    },
  }
}