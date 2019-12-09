const memoize = require( 'fast-memoize' )

module.exports = function ( transpileModules = [] ) {
  return memoize( function ( filepath = '' ) {
    filepath = filepath.replace( /\\/g, '/' )

    // skip transpiling overlay code for development mode
    if ( filepath.includes( 'driver-webpack/lib/webpack/overlay' ) ) {
      return false
    }

    // transpile modules outside node_modules
    if ( !filepath.includes( 'node_modules' ) ) {
      return true
    }

    if ( transpileModules.length > 0 ) {
      return transpileModules.some( m => {
        if ( typeof m === 'string' ) {
          return filepath.includes( `/node_modules/${ m }/` ) ||
            filepath.includes( `/node_modules/_${ m.replace( /\//g, '_' ) }` )
        }

        if ( m && m.test ) {
          return m.test( filepath )
        }

        if ( typeof m === 'function' ) {
          return m( filepath )
        }

        return false
      } )
    }

    return false
  } )
}
