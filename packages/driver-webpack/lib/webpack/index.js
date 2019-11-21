const abilities = [
  require( './friendly-error' )
]

exports.extendWebpack = function ( config, context ) {
  abilities.forEach( ability => {
    if ( ability.extend ) {
      ability.extend( config, context )
    }
  } )
}

exports.exposeWebpack = function ( context = {} ) {
  abilities.forEach( ability => {
    if ( ability.expose ) {
      ability.expose( context )
    }
  } )
}
