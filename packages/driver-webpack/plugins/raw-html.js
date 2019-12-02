class RawHTMLPlugin {
  apply( ctx ) {
    const { hook } = ctx.use( 'webpack' )

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
