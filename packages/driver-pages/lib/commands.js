const path = require( 'path' )
const resolveFrom = require( 'resolve-from' )
const sao = require( 'sao' )
const Runtime = require( './runtime' )
const createGatherer = require( './gatherer' )

module.exports = function ( cli ) {
  cli
    .command( 'dev', 'Build in development mode' )
    .option( '--single-page <page>', 'Build single page to speed up' )
    .option( '--dynamic' )
    .action( createAction( 'development' ) )

  cli
    .command( 'build', 'Build in production mode' )
    .action( createAction( 'production' ) )

  cli
    .command( 'create [dir]', 'Generate a new project to target folder' )
    .action( async dir => {
      const outDir = path.join( process.cwd(), dir )

      const saoGenerator = sao( {
        generator: path.join( __dirname, './templates/simple' ),
        outDir,
        updateCheck: true,
        logLevel: 3
      } )

      await saoGenerator.run().catch( sao.handleError )
    } )
}

function createAction( env ) {
  return async function ( options ) {
    const runtime = new Runtime()
    const gatherer = await createGatherer( {
      name: 'pages',
      env,
    } )

    if ( options.singlePage ) {
      options.singlePage = options.singlePage.replace( /^\/+|\/+$/g, '' )
    }

    process.env.NODE_ENV = env

    await runtime.apply( {
      env,
      cli: {
        options,
      },
      api: {
        gatherer,
        require( id ) {
          const context = path.join( __dirname, '../node_modules' )
          const resolved = resolveFrom( context, id )

          return require( resolved )
        }
      }
    } )
  }
}
