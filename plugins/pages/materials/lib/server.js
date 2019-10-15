const http = require( 'http' )
const WebSocket = require( 'ws' )

module.exports = class MaterialsServer {
  constructor() {
    this._actions = {}
  }

  async start( options ) {
    this.server = http.createServer()
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
        const handler = type && this._actions[ type ]
        if ( typeof handler === 'function' ) {
          handler( { data: json.data, sender: ws } )
        }
      } )
    } )

    await new Promise( resolve => {
      this.server.listen( options.port, resolve )
    } )
  }

  on( type, handler ) {
    this._actions[ type ] = handler
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
