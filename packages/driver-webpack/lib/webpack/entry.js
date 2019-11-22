const { utils } = require( '@nut-project/dev-utils' )
exports.extend = function ( config, context = {} ) { // eslint-disable-line
    const { userConfig } = context // eslint-disable-line
  if ( userConfig && userConfig.pages ) {
    Object.keys( userConfig.pages ).forEach( key => {
      config.entry( key ).add( utils.getPath( userConfig.pages[ key ].entry || userConfig.pages[ key ] ) )
    } )
  } else {
    config.entry( 'index' ).add( utils.getPath( 'src/index.js' ) )
  }
}
