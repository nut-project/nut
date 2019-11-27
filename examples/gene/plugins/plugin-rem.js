const { Plugin } = require( '@nut-project/core' )

class RemPlugin extends Plugin {
  static name() {
    return 'rem'
  }

  async apply() {
    const { api, hook } = this.use( 'webpack' )

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
