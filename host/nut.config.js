module.exports = {
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

  // 合并策略( Optional )
  composeStrategy: {
    // 是否执行各自的 app.js
    // 默认 false，需要提供一个新的 app.js，提供统一的鉴权和菜单配置
    // app service 仅仅提供页面服务，包括标题都是在主应用中自行控制
    // 如果各自执行，比如 beforeEach 可能会执行两次，鉴权跳转会有两次
    app: false,
  },

  plugins: {
    login: {
      alias: [ 'x', 'y', 'z' ]
    }
  }
}
