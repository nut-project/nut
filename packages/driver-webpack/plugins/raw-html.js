const { Plugin } = require( '@nut-project/core' )

class RawHTMLPlugin extends Plugin {
  apply() {
    const { hook } = this.use( 'webpack' )

    hook( 'dangerously_chainWebpack', config => {
      config.module
        .rule( 'html' )
        .test( /\.html$/i )
        .use( 'raw' )
        .loader( require.resolve( 'raw-loader' ) )
    } )
  }
}

module.exports = RawHTMLPlugin
