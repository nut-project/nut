const abilities = [
  require( './friendly-error' ),
  require( './html-plugin' ),
  require( './image' ),
  require( './media' ),
  require( './font' ),
  require( './copy' ),
  require( './analyze' ),
  require( './mode' ),
  require( './minimize' ),
  require( './progress' ),
  require( './envs' ),
  require( './public-path' ),
  require( './filename' ),
  require( './entry' ),
  require( './css' ),
  require( './mcss' ),
  require( './scss' ),
  require( './less' ),
  require( './stylus' ),
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
