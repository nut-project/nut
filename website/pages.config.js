const path = require( 'path' )

function getNowOptions( options = {} ) {
  return {
    search: {
      appId: 'FZANFOBNUT',
      apiKey: '8c79ef62f918611dd1dce669466327ca',
      indexName: 'nut',
      debug: true,
      placeholder: '搜索',
      ...( options.search || {} )
    },
    navbar: {
      width: '200px',
      ...( options.navbar || {} )
    },
    editpage: {
      base: 'https://github.com/nut-project/nut/tree/master/website/src/',
      ...( options.editpage || {} )
    },
  }
}

const config = {
  verbose: true,
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
  plugins: [
    path.join( __dirname, './plugins/now-custom' ),
    [
      path.join( __dirname, '../plugins/pages/layout-now' ),
      process.env.NODE_ENV === 'development' ?
        getNowOptions() :
        getNowOptions( { search: { debug: false } } )
    ],
    path.join( __dirname, '../plugins/pages/materials' ),
    path.join( __dirname, '../plugins/pages/layout-kaola' ),
    path.join( __dirname, '../plugins/pages/layout-kaola' ),
    path.join( __dirname, '../plugins/pages/layout-side' ),
    path.join( __dirname, '../plugins/pages/layout-saber' ),
    path.join( __dirname, '../plugins/pages/microfrontends' ),
  ]
}

if ( process.env.NODE_ENV === 'production' ) {
  config.output = {
    publicPath: 'https://nut.js.org/'
  }
}

module.exports = config
