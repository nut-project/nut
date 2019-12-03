class RemPlugin {
  constructor( options ) {
    console.log( 'rem options', options )
  }

  async apply( ctx ) {
    const { api, hook } = ctx.use( 'webpack' )

    hook( 'env', env => {
      hook( 'dangerously_chainWebpack', config => {
        // console.log( 'hook dangerously_chainWebpack', config )
      } )
    } )

    api.cheerio( $ => {
      console.log( $( 'title' ).html() )
      $( 'title' ).text( 'Hello Plugin' )
      console.log( $( 'title' ).html() )
    } )
  }
}

module.exports = RemPlugin
