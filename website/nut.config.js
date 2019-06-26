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
  plugins: {},
  markdown: {
    theme: 'prism-duotone-light',
  },
  homepage: 'pages/home',
  babel: {
    transpileModules: [ '@zeit-ui/vue' ]
  },
}

if ( process.env.NODE_ENV === 'production' ) {
  config.output = {
    publicPath: 'https://nut.js.org/'
  }
}

module.exports = config
