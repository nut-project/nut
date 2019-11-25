const { utils } = require( '@nut-project/dev-utils' )
exports.extend = function ( config, context = {} ) { // eslint-disable-line
    const { userConfig } = context // eslint-disable-line
  let setExtensionsFlag = false
  let setAliasFlag = false
  if ( userConfig && userConfig.resolve ) {
    const { extensions = [], alias = {} } = userConfig.resolve
    if ( extensions.length ) {
      setExtensionsFlag = true
      extensions.forEach( value => {
        config.resolve.extensions.add( value )
      } )
    }
    const aliasKeys = Object.keys( alias )
    if ( aliasKeys.length ) {
      setAliasFlag = true
      aliasKeys.forEach( aliasKey => {
        config.resolve.alias.set( aliasKey, alias[ aliasKey ] )
      } )
    }
  }
  if ( !setExtensionsFlag ) {
    config.resolve.extensions
      .add( '.js' )
      .add( '.json' )
      .add( '.css' )
      .add( '.mcss' )
      .add( '.less' )
      .add( '.sass' )
      .add( 'scss' )
      .add( 'styl' )
      .add( 'stylus' )
  }
  if ( !setAliasFlag ) {
    config.resolve.alias.set( '@', utils.getPath( './src' ) )
  }
}
