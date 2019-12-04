
class ProxyPlugin  {
  constructor( options ) {
    console.log( 'proxy options', options )
  }

  async apply(ctx) {
    const { hook } = ctx.use( 'mock' )
      hook( 'fetchSchemas', config => {
          console.log( 'fetchSchemas hook is called' )
      } )
      hook( 'fetchScenes', id => {
        console.log( 'fetchScenes hook is called' )
      } )
      hook( 'notfound', requestDetail => {
        console.log( 'notfound hook is called' )
        return new Promise(function( reslove ) {
          reslove({})
      })
    } )
  }
}

module.exports = ProxyPlugin
