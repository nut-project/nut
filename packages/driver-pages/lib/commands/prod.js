const path = require( 'path' )
const resolveFrom = require( 'resolve-from' )

async function prod( gatherer = {}, runtime, cliOptions = {} ) {
  await runtime.apply( {
    env: 'production',
    cli: {
      options: cliOptions,
    },
    api: {
      gatherer,
      require( id ) {
        const context = path.join( __dirname, '../../node_modules' )
        const resolved = resolveFrom( context, id )

        return require( resolved )
      }
    }
  } )
}

module.exports = prod
