export default {
  name: 'route-notfound',

  apply( { api, events }, options ) {
    events.on( 'route:notfound', () => {
      api.router.replace( {
        page: 'pages/index'
      } )
    } )
  }
}
