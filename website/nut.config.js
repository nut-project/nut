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
  layout: 'now2',
  plugins: {},
  markdown: {
    theme: 'prism-duotone-light',
    remarkPlugins: [],
    rehypePlugins: [],
  },
  homepage: 'pages/home',
  babel: {
    transpileModules: [ '@zeit-ui/vue' ]
  },
  plugins: {
    nowCustom: {
      path: path.join( __dirname, './src/plugins/now-custom/index.js' ),
    }
  }
}

if ( process.env.NODE_ENV === 'production' ) {
  config.output = {
    publicPath: 'https://nut.js.org/'
  }
}

module.exports = config
