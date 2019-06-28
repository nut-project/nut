module.exports = {
  type: 'host',

  layout: 'now',

  zh: 'nut docs',

  compose: {
    docs: {
      service: 'http://127.0.0.1:9001',
      prefix: '/docs',
    },
    demo: {
      service: 'http://127.0.0.1:9002',
      prefix: '/demo',
    },
    nut: {
      service: 'https://nut.js.org',
      prefix: '/nut'
    }
  },

  // 合并策略
  composeStrategy: null, // 'default' / 'independent'

  plugins: {
    login: {
      alias: [ 'x', 'y', 'z' ]
    }
  }
}
