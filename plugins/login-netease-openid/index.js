exports.name = 'netease-openid'

// 唯一，只能存在一个
exports.alias = 'login'

exports.apply = function ( api, events ) {
  async function getUser() {
    return {
      username: '不愿透露姓名的x先生',
      role: 'admin'
    }
  }

  async function isLogin() {
    return false
  }

  async function toLogin() {
    location.href = ''
  }

  async function logout() {

  }

  async function checkPermission() {

  }

  async function saveUser( ctx ) {
    ctx.user = await getUser()
  }

  api.expose( 'get_user', getUser )
  api.expose( 'is_login', isLogin )
  api.expose( 'to_login', toLogin )
  api.expose( 'logout', logout )

  events.on( 'system:before-startup', saveUser )
  events.on( 'route:change', checkPermission )
  events.on( 'layout:logout', logout )
}
