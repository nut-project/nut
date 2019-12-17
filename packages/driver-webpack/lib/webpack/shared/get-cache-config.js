const fs = require( 'fs' )
const path = require( 'path' )
const hash = require( 'hash-sum' )
const localJoin = require( './local-join' )
const localResolve = require( './local-resolve' )

module.exports = ( id = '', customFactors = {}, configfiles = [] ) => {
  const root = path.join( __dirname, '../../../' )

  const factors = {
    customFactors,
    env: process.env.NODE_ENV,
    self: require( path.join( root, 'package.json' ) ).version,
    'cache-loader': require( 'cache-loader/package.json' ).version,
    configfile: readConfig( configfiles || [] ),
    lockfile: readConfig( [
      'package-lock.json',
      'yarn.lock',
    ] )
  }

  return {
    cacheDirectory: localJoin( `node_modules/.cache/${ id }` ),
    cacheIdentifier: hash( factors )
  }
}

// from vue cli
const read = file => {
  const absolutePath = localResolve( file )

  if ( !absolutePath || !fs.existsSync( absolutePath ) ) {
    return
  }

  if ( absolutePath.endsWith( '.js' ) ) {
    // should evaluate config scripts to reflect environment variable changes
    try {
      return JSON.stringify( require( absolutePath ) )
    } catch ( e ) {
      return fs.readFileSync( absolutePath, 'utf-8' )
    }
  } else {
    return fs.readFileSync( absolutePath, 'utf-8' )
  }
}

function readConfig( files = [] ) {
  if ( files.length === 0 ) {
    return ''
  }

  for ( const file of files ) {
    const content = read( file )
    if ( content ) {
      return content
    }
  }

  return ''
}
