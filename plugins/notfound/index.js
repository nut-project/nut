export default {
  name: 'notfound',

  apply( { api, events }, options ) {
    events.on( 'route:notfound', () => {
      location.replace( api.getPluginPageLink( 'pages/index' ) )
    } )
  }
}
