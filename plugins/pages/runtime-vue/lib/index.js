const path = require( 'path' )

const ID = 'runtime-vue'

module.exports = {
  name: ID,

  core: true,

  async apply( api ) {
    api.hooks.chainWebpack.tapPromise( ID, async config => {
      config
        .resolve
        .alias
        .set( '@', path.join( process.cwd(), 'src' ) )
    } )
  }
}
