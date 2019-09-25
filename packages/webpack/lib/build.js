const webpack = require( 'webpack' )

module.exports = function build( config ) {
  const compiler = webpack( config )

  return new Promise( ( resolve, reject ) => {
    compiler.run( ( err, stats ) => {
      if ( err ) {
        return reject( err )
      }

      resolve( stats )
    } )
  } )
}
