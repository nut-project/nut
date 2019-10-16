const http = require( 'http' )
const WebSocket = require( 'ws' )

module.exports = class MaterialsServer {
  constructor() {
    this._listeners = {}
    this._callListeners = {}
  }

  async start( options ) {
    this.server = http.createServer( ( request, response ) => {
      response.setHeader( 'Access-Control-Allow-Origin', '*' )
      response.setHeader( 'Access-Control-Request-Method', '*' )
      response.setHeader( 'Access-Control-Allow-Methods', 'OPTIONS, POST' )
      response.setHeader( 'Access-Control-Allow-Headers', '*' )

      if ( request.method === 'OPTIONS' ) {
        response.writeHead( 200 )
        response.end()
        return
      }

      if ( request.method === 'POST' && request.url === '/service' ) {
        let body = []

        request
          .on( 'error', err => {
            console.log( err )
          } )
          .on( 'data', chunk => {
            body.push( chunk )
          } )
          .on( 'end', () => {
            body = Buffer.concat( body ).toString()

            try {
              body = JSON.parse( body )
            } catch ( e ) {
              body = {}
            }

            response.on( 'error', err => {
              console.log( err )
            } )

            const { type, data } = body || {}

            const handler = this._callListeners[ type ]

            if ( typeof handler === 'function' ) {
              handler( data, message => {
                response.statusCode = 200
                response.setHeader( 'Content-Type', 'application/json' )
                response.write( JSON.stringify( message ) )
                response.end()
              } )
            }
          } )
      } else {
        response.statusCode = 404
        response.end()
      }
    } )

    const wss = this.wss = new WebSocket.Server( {
      server: this.server,
    } )

    wss.on( 'connection', ws => {
      ws.on( 'message', message => {
        let json = {}

        try {
          json = JSON.parse( message )
        } catch ( e ) {
          json = {}
        }

        const type = json.type
        const handler = type && this._listeners[ type ]
        if ( typeof handler === 'function' ) {
          handler( { data: json.data, sender: ws } )
        }
      } )
    } )

    await new Promise( ( resolve, reject ) => {
      this.server.listen( options.port, err => {
        if ( err ) {
          reject()
          return
        }

        resolve()
      } )
    } )
  }

  onCall( type, handler ) {
    this._callListeners[ type ] = handler
  }

  on( type, handler ) {
    this._listeners[ type ] = handler
  }

  send( client, data ) {
    client.send( JSON.stringify( data ) )
  }

  async stop() {
    if ( this.wss ) {
      this.wss.close()
    }

    if ( this.server ) {
      this.server.close()
    }
  }
}
