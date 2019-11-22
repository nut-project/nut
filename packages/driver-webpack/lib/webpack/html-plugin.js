const path = require( 'path' )
const HtmlWebpackPlugin = require( 'html-webpack-plugin' )
const { utils } = require( '@nut-project/dev-utils' )
exports.extend = function ( config, context = {} ) {
    const { userConfig } = context // eslint-disable-line
  const template = path.join( __dirname, './template.ejs' )
  if ( userConfig && userConfig.pages ) {
    Object.keys( userConfig.pages ).forEach( entryName => {
      const entryOptions = userConfig.pages[ entryName ]
      const options = {
        filename: `./${ entryName }.html`,
        template,
        chunks: [ 'chunk-vendors', 'chunk-common', entryName ]
      }
      if ( utils.type( entryOptions ) === 'Object' ) {
        Object.assign( options, entryOptions )
        delete options.entry
      }
      config
        .plugin( `html-plugin-${ entryName }` )
        .use( HtmlWebpackPlugin, [ options ] )
    } )
  } else {
    config
      .plugin( 'html-plugin-index' )
      .use( HtmlWebpackPlugin, [ {
        template,
      } ] )
  }
}
