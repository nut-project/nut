const path = require( 'path' )

module.exports = {
  router: {
    mode: 'history',
    alias: {
      'pages/documents/reference': '/xyz'
    },
    defaultCacheable: false,
    cacheable: {
      'pages/home/vue': true,
    },
  },

  output: {
    clean: true,
  },

  port: 9001,
  zh: 'nut',
  en: 'nut',
  logo: '',
  html: {
    title: '文档标题',
    // template: path.join( __dirname, 'template.ejs' )
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
      path: require.resolve( './src/plugins/notfound' ),
    },
    layoutTest: {
      path: require.resolve( './src/plugins/layout-test' ),
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
  chainWebpack( config ) {
    config.module
      .rule( 'ts' )
        .use( 'ts' )
        .loader( 'ts-loader' )
        .tap( options => {
          options.transpileOnly = true
          return options
        } )
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
          test: /\.html$/,
          use: [
            { loader: 'html-loader' },
          ],
        },
        // {
        //   test: /\.vue$/,
        //   use: [
        //     { loader: 'eslint-loader' }
        //   ]
        // }
      ]
    }
  }
}
