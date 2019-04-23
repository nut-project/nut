export default {
  name: 'login',
  type: 'login',

  apply( ctx, options ) {
    const { origin = '' } = options || {}
    const { api, events } = ctx

    async function getUser() {
      const response = await api.axios.get( origin + '/__nut__/login/user' )
      const json = response.data || {}
      const { nickname, email } = json.body || {}

      return { nickname, email }
    }

    async function isLogin() {
      const response = await api.axios.get( origin + '/__nut__/login/is_login' )
      const json = response.data
      return json.body
    }

    async function toLogin() {
      location.href = origin + '/__nut__/login/to_login'
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
  }
}
