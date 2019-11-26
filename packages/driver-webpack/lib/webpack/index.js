const abilities = [
  require( './envs' ),
  require( './public-path' ),
  require( './filename' ),
  require( './entry' ),
  require( './babel' ),
  require( './css' ),
  require( './html' ),
  require( './media' ),
  require( './font' ),
  require( './copy' ),
  require( './clean' ),
  require( './analyze' ),
  require( './mode' ),
  require( './minimize' ),
  require( './progress' ),
  require( './friendly-error' ),
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
