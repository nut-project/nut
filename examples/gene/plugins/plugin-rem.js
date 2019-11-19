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
  }
}

module.exports = RemPlugin
