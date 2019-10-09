const path = require( 'path' )
const fse = require( 'fs-extra' )

module.exports = function ( plugins = {}, { file, env } ) {
  plugins = Object.keys( plugins )
    .map( localName => ( {
      localName,
      ...plugins[ localName ],
    } ) )

  // filter .path / .package
  plugins = plugins.filter( plugin => {
    if ( !plugin.path && !plugin.package ) {
      return false
    }

    if ( plugin.path ) {
      return fse.pathExistsSync( path.join( plugin.path, file ) )
    }

    if ( plugin.package ) {
      const baseDir = path.dirname(
        require.resolve( `${ plugin.package }/package.json` )
      )

      return fse.pathExistsSync( path.join( baseDir, file ) )
    }

    return false
  } )
  // filter enable
  plugins = plugins.filter( plugin => plugin.enable )
  // filter env
  plugins = plugins.filter( plugin => ~plugin.env.indexOf( env ) )

  return plugins
}
