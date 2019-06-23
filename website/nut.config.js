module.exports = {
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
  }
}
