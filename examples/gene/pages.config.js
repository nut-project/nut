const path = require( 'path' )

module.exports = function ( ctx ) {
  console.log( 'pages.config.js ctx:', ctx )

  return {
    config: {
      webpack: {
        entry: path.join( __dirname, 'src/entry-client.js' ),
        output: {},
        devServer: {
          port: 9000,
          historyApiFallback: false,
        },
        cache: false,
      }
    },

    plugins: {
      rem: {
        resolve: require.resolve( './plugins/plugin-rem' ),
        options: {
          x: 1
        },
        enable: true,
      },
      vuessr: {
        enable: false,
        resolve: '@nut-plugins/vue-ssr',
        options: {
          entry: path.join( __dirname, 'src/entry-server.js' ),
          html: `
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
                {{{ renderResourceHints() }}}
                <!-- styles will be rendered -->
                {{{ renderStyles() }}}
              </head>
              <body>
                <!--vue-ssr-outlet-->
                {{{ renderState() }}}
                {{{ renderScripts() }}}
              </body>
            </html>
          `
        }
      }
    },
  }
}
