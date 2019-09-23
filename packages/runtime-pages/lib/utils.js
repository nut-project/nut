const path = require( 'path' )
const hashsum = require( 'hash-sum' )

exports.getUniqueApplicationId = function getUniqueApplicationId( config ) {
  let pkg = {}
  try {
    pkg = require( process.cwd() + '/package.json' )
  } catch ( e ) {}

  return hashsum( {
    pkg,
    config,
  } )
}

function normalize( filepath ) {
  return filepath.replace( /\\/g, '/' )
}

const projectRoot = path.join( process.cwd(), 'src' )

function toRelativePath( filepath ) {
  return '@/' + normalize( path.relative( projectRoot, filepath ) )
}

exports.toRelativePath = toRelativePath
