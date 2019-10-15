const path = require( 'path' )
const detectPort = require( 'detect-port' )
const axios = require( 'axios' )
const Server = require( './server' )

const ID = 'materials'

exports.name = ID

exports.apply = async ( api, options ) => {
  api.hooks.beforeRun.tapPromise( ID, async () => {
    if ( api.env === 'development' ) {
      const port = await detectPort()

      api.addRuntimeModule( {
        file: path.join( __dirname, 'runtime/index.js' ),
        options: {
          port,
        }
      } )

      const server = new Server()
      await server.start( { port } )

      const url = options.url || ''

      server.on( 'client:ready', async ( { sender } ) => {
        if ( url ) {
          const response = await axios( url )
          server.send( sender, {
            type: 'blocks:ready',
            data: response.data || {},
          } )
        }
      } )

      api.logger.info( `Materials websocket server listening on ${ port }\n` )

      api.hooks.restart.tapPromise( ID, async () => {
        if ( server ) {
          await server.stop()
        }
      } )
    }
  } )
}
