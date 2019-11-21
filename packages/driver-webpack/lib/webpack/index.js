const abilities = [
  require( './friendly-error' ),
  require( './image' ),
  require( './media' ),
  require( './font' ),
  require( './copy' ),
  require( './analyze' ),
  require( './mode' ),
  require( './minimize' ),
  require( './progress' ),
]

exports.extendWebpack = function ( config, context ) {
  abilities.forEach( ability => {
    if ( ability.extend ) {
      ability.extend( config, context )
    }
  } )
}

exports.exposeWebpack = function ( driver, context = {} ) {
  abilities.forEach( ability => {
    if ( ability.expose ) {
      ability.expose( driver, context )
    }
  } )
}
