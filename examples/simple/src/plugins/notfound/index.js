export default {
  name: 'route-notfound',

  apply( { api, events }, options ) {
    api.page( 'pages/index@notfound' ).set( 'layout', 'none' )

    events.on( 'route:notfound', () => {
      api.router.push( {
        page: 'pages/index'
      }, { scoped: true } )
    } )
  }
}
