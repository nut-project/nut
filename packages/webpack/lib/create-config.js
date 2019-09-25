const Config = require( 'webpack-chain' )
const base = require( './config/base' )
const dev = require( './config/dev' )
const prod = require( './config/prod' )

module.exports = function createConfig( env, options ) {
  const config = new Config()

  base( config, options )

  if ( env === 'production' ) {
    prod( config, options )
  } else {
    dev( config, options )
  }

  return config
}
