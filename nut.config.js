const path = require( 'path' )

module.exports = {
  port: 9000,
  zh: 'nut',
  en: 'nut',
  logo: '',
  html: {
    title: '文档标题',
  },
  layout: 'test',
  theme: 'ocean',
  plugins: {
    login: {
      package: '@nut-plugins/login',
      enable: false,
      // env: [ 'dev' ],
    },
    test: {
      path: require.resolve( './plugins/test' ),
    },
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
  // homepage 和 landing page 二选一
  homepage: 'pages/index',
  landing: {
    template: 'default',
    options: {},
  },
  configureWebpack: {
    resolve: {
      alias: {
        '#alias': path.resolve( __dirname, 'src/alias' )
      }
    }
  }
}
