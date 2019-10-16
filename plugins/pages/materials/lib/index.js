const path = require( 'path' )
const axios = require( 'axios' )

const ID = 'materials'

exports.name = ID

exports.apply = async ( api, options ) => {
  api.addRuntimeModule( {
    file: path.join( __dirname, 'runtime.js' ),
  } )

  api.hooks.beforeRun.tapPromise( ID, async () => {
    api.service.onCall( 'get-blocks', async ( data, sendResponse ) => {
      if ( options.url ) {
        try {
          const response = await axios.get( options.url )
          sendResponse( response.data )
        } catch ( e ) {
          sendResponse( {} )
        }
      }
    } )
  } )
}
