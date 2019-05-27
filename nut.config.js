const path = require( 'path' )

module.exports = {
  // type: 'child',

  output: {
    clean: true,
  },

  port: 9001,
  zh: 'nut',
  en: 'nut',
  logo: '',
  html: {
    title: '文档标题',
  },
  layout: 'kaola',
  theme: 'ocean',
  plugins: {
    login: {
      package: '@nut-plugins/login',
      enable: false,
      // env: [ 'dev' ],
    },
    // test: {
    //   path: require.resolve( './plugins/test' ),
    // },
    notfound: {
      path: require.resolve( './plugins/notfound' ),
    },
    layoutTest: {
      path: require.resolve( './plugins/layout-test' ),
    }
  },
  markdown: {
    theme: 'prism-okaidia',
  },
  devServer: {
    proxy: {
      '/api': 'http://127.0.0.1:7000'
    }
  },
  sidebar: null,
  landing: {
    template: 'default',
    options: {},
  },
  configureWebpack: {
    resolve: {
      alias: {
        '#alias': path.resolve( __dirname, 'src/alias' )
      }
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: [
            { loader: 'eslint-loader' }
          ]
        }
      ]
    }
  }
}
