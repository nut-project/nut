export default {
  name: 'netease-openid',

  // login 类型的插件只能存在一个
  type: 'login',

  apply( ctx, options ) {
    const { origin = '' } = options || {}
    const { api, events } = ctx

    async function getUser() {
      const response = await api.axios.get( origin + '/api/openid/user' )
      const json = response.data

      return {
        nickname: json.body.fullname,
        email: json.body.email,
        username: json.body.nickname,
      }
    }

    async function isLogin() {
      const response = await api.axios.get( origin + '/api/openid/is_login' )
      const json = response.data
      return json.body
    }

    async function toLogin() {
      location.href = origin + '/api/openid/to_login'
    }

    async function logout() {
      console.log( 'logout' )
    }

    api.expose( 'getUser', getUser )
    api.expose( 'isLogin', isLogin )
    api.expose( 'toLogin', toLogin )
    api.expose( 'logout', logout )

    events.on( 'system:before-startup', async ctx => {
      const isLogined = await isLogin()

      if ( !isLogined ) {
        return toLogin()
      }

      ctx.user = await getUser()
    } )

    events.on( 'layout:logout', logout )
    events.on( 'permission:lost', () => {} )
  }
}
