const gradient = require( 'gradient-string' )

exports.delay = ( duration = 0 ) => {
  return new Promise( resolve => {
    setTimeout( resolve, duration )
  } )
}

exports.poweredBy = packageName => {
  const builtins = [
    'vice',
    'fruit',
    'morning'
  ]

  const index = getRandomIntFromRange( 0, builtins.length - 1 )

  console.log( `\nPowered by ${ gradient[ builtins[ index ] ]( packageName ) }\n` )
}

function getRandomIntFromRange( min, max ) {
  min = Math.ceil( min )
  max = Math.floor( max )
  return Math.floor( Math.random() * ( max - min + 1 ) ) + min
}
