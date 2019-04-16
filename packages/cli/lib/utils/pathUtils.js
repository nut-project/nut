const path = require( 'path' )

function normalize( filepath ) {
  return filepath.replace( /\\/g, '/' )
}

const projectRoot = path.join( process.cwd(), 'src' )

function toRelative( filepath ) {
  return '@/' + normalize( path.relative( projectRoot, filepath ) )
}

module.exports = {
  normalize,
  toRelative,
}
