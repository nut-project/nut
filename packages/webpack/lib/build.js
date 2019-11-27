module.exports = function build( compiler ) {
  return new Promise( ( resolve, reject ) => {
    compiler.run( ( err, stats ) => {
      if ( err ) {
        return reject( err )
      }

      resolve( stats )
    } )
  } )
}
