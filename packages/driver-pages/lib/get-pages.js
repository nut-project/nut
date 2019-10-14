const path = require( 'path' )
const globby = require( 'globby' )

module.exports = async function getPages( root ) {
  let files = []

  try {
    const patterns = [
      '.js',
      '.md',
      '.vue',
      '.jsx',
      '.ts',
    ].map( ext => `pages/**/*${ ext }` )

    files = await globby( patterns, {
      cwd: root,
      onlyFiles: true,
      deep: Infinity,
    } )
  } catch ( e ) {}

  const promises = files
    .sort( ( a, b ) => {
      if ( a < b ) {
        return 1
      }

      if ( a > b ) {
        return -1
      }

      return 0
    } )
    .map( async file => {
      return {
        context: root,
        location: path.join( root, file ),
      }
    } )

  return await Promise.all( promises )
}
