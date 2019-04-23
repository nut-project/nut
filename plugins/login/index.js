export default {
  name: 'login',
  type: 'login',

  apply( ctx, options ) {
    const { origin = '' } = options || {}
    const { api, events } = ctx

    async function getUser() {
      const response = await api.axios.get( origin + '/nut/plugin/login/user' )
      const json = response.data || {}
      const { nickname, email } = json.body || {}

      return { nickname, email }
    }

    async function isLogin() {
      const response = await api.axios.get( origin + '/nut/plugin/login/is-login' )
      const json = response.data
      return json.body
    }

    function toLogin() {
      location.replace( origin + '/nut/plugin/login/to-login' )
    }

    async function logout() {
      const response = await api.axios.get( origin + '/nut/plugin/login/logout' )
      const json = response.data
      return json.code === 200
    }

    api.expose( 'getUser', getUser )
    api.expose( 'isLogin', isLogin )
    api.expose( 'toLogin', toLogin )
    api.expose( 'logout', logout )

    events.on( 'system:before-startup', async ctx => {
      const isLogined = await isLogin()

      if ( !isLogined ) {
        toLogin()
        await delay( 1000 )
        return
      }

      ctx.user = await getUser()
    } )

    events.on( 'layout:logout', async () => {
      await logout()
      toLogin()
    } )
  }
}

function delay( duration = 0 ) {
  return new Promise( ( resolve ) => {
    setTimeout( () => {
      resolve()
    }, duration )
  } )
}
