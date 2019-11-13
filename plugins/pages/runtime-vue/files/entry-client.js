import createApp from './app'

export default () => {
  const { app, router } = createApp()

  router.onReady( () => {
    app.$mount( '#app' )
  } )
}
