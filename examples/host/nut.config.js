module.exports = {
  type: 'host',
  layout: 'now',
  zh: 'nut compose',
  router: {
    mode: 'history',
  },
  compose: {
    nut: {
      service: 'https://nut.js.org',
      prefix: '/nut'
    },
    todomvc: {
      service: 'https://fengzilong.github.io/nut-todomvc-example/',
      prefix: '/todomvc'
    }
  },

  // 合并策略
  // composeStrategy: null, // 'default' / 'independent'
  //
  // plugins: {
  //   login: {
  //     alias: [ 'x', 'y', 'z' ]
  //   }
  // }
}
