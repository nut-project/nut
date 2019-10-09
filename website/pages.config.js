const path = require( 'path' )

const config = {
  port: 9000,
  router: {
    mode: 'history',
  },
  zh: 'nut project',
  html: {
    title: 'NUT 文档',
  },
  logo: '/logo.png',
  theme: 'ocean',
  layout: 'now',
  markdown: {
    theme: 'prism-dracula',
    remarkPlugins: [],
    rehypePlugins: [],
  },
  homepage: 'pages/home',
  babel: {
    transpileModules: [ '@zeit-ui/vue' ]
  },
  plugins: {
    nowCustom: {
      path: path.join( __dirname, './src/plugins/now-custom' ),
    },
    now: {
      path: path.join( __dirname, '../plugins/pages/layout-now' )
    },
    kaola: {
      path: path.join( __dirname, '../plugins/pages/layout-kaola' ),
    },
    side: {
      path: path.join( __dirname, '../plugins/pages/layout-side' ),
    },
    saber: {
      path: path.join( __dirname, '../plugins/pages/layout-saber' ),
    },
  }
}

if ( process.env.NODE_ENV === 'production' ) {
  config.output = {
    publicPath: 'https://nut.js.org/'
  }
}

module.exports = config
