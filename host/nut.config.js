module.exports = {
  type: 'host',

  compose: {
    docs: {
      service: 'http://127.0.0.1:9000',
      prefix: '/docs',
    },
    demo: {
      service: 'http://127.0.0.1:9001',
      prefix: '/demo',
    },
  },

  // 合并策略
  composeStrategy: null, // 'default' / 'independent'

  plugins: {
    login: {
      alias: [ 'x', 'y', 'z' ]
    }
  }
}
