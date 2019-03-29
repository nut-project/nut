exports.name = 'netease-openid'

exports.type = 'login'

exports.apply = function ( api, events ) {
  async function getUser() {

  }

  async function isLogin() {

  }

  async function toLogin() {

  }

  async function logout() {

  }

  async function check() {

  }

  async function saveUser() {

  }

  api.expose( 'get_user', getUser )
  api.expose( 'is_login', isLogin )
  api.expose( 'to_login', toLogin )
  api.expose( 'logout', logout )

  events.on( 'system:before-startup', saveUser )
  events.on( 'route:change', check )
  events.on( 'layout:logout', logout )
}
