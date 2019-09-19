const gradient = require( 'gradient-string' )
const chalk = require( 'chalk' )
const glob = require( 'globby' )

function delay( duration = 0 ) {
  return new Promise( resolve => {
    setTimeout( resolve, duration )
  } )
}

function randomInt( min, max ) {
  min = Math.ceil( min )
  max = Math.floor( max )
  return Math.floor( Math.random() * ( max - min + 1 ) ) + min
}

function poweredBy( packageName, version ) {
  const builtins = [
    'vice',
    'fruit',
    'morning'
  ]

  const index = randomInt( 0, builtins.length - 1 )

  console.log( `\nPowered by ${ gradient[ builtins[ index ] ]( packageName ) } ${ chalk.dim( '(' + version + ')' ) }\n` )
}

function normalizePath( path = '' ) {
  return path.replace( /\\/g, '/' )
}

function pick( object, keys ) {
  return keys.reduce( ( all, key ) => {
    all[ key ] = object[ key ]
    return all
  }, {} )
}

async function globby( patterns, options = {} ) {
  return await glob( patterns, {
    cwd: process.cwd(),
    onlyFiles: true,
    deep: Infinity,
    absolute: true,
    ...options,
  } )
}

// import files( hoist default file by default ) into one
// and export merged object
function mergeFiles( files, options = {} ) {
  if ( !files || files.length === 0 ) {
    return `
      export default {}
    `
  }

  const { hoistDefaultFile = true } = options

  if ( hoistDefaultFile ) {
    // sort files, put `*.default.*` at first
    const index = files.findIndex( file => file.includes( `.default.` ) )

    if ( ~index ) {
      const defaultFile = files[ index ]
      files.splice( index, 1 )
      files.unshift( defaultFile )
    }
  }

  const importFile = ( file, index ) => {
    return `import file${ index } from ${ JSON.stringify( file ) };`
  }

  const importVariable = ( file, index ) => {
    return `file${ index }`
  }

  return `
    import merge from 'deepmerge'
    ${ files.map( importFile ).join( '\n' ) }

    // merge
    const merged = merge.all( [
      ${ files.map( importVariable ).join( ',' ) }
    ], {
      arrayMerge: ( destinationArray, sourceArray, options ) => sourceArray
    } )

    export default merged
  `
}

exports.delay = delay
exports.randomInt = randomInt
exports.poweredBy = poweredBy
exports.normalizePath = normalizePath
exports.pick = pick
exports.globby = globby
exports.mergeFiles = mergeFiles
