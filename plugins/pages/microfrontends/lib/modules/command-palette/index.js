/* global location, WebSocket, document */

import Vue from 'vue'
import axios from 'axios'
import App from './App.vue'

function deferred() {
  const object = {}

  object.promise = new Promise( ( resolve, reject ) => {
    object.resolve = resolve
    object.reject = reject
  } )

  return object
}

class Service {
  constructor( { port } ) {
    this._listeners = {}

    const uri = `ws://${ location.hostname }:${ port }`
    const ws = this.ws = new WebSocket( uri )

    this._wsready = deferred()
    ws.addEventListener( 'open', () => {
      this._wsready.resolve()
    } )

    ws.addEventListener( 'message', e => {
      let json = {}

      try {
        json = JSON.parse( e.data )
      } catch ( e ) {
        json = {}
      }

      const listeners = this._listeners[ json.type ]
      if ( Array.isArray( listeners ) ) {
        listeners.forEach( listener => listener( json.data ) )
      }
    } )

    this.axios = axios.create( {
      baseURL: `//${ location.hostname }:${ port }`,
    } )
  }

  async call( type, data ) {
    const response = await this.axios( {
      url: `/service`,
      method: 'post',
      data: {
        type,
        data
      },
    } )

    return response.data
  }

  async send( message ) {
    await this._wsready.promise
    this.ws.send( JSON.stringify( message ) )
  }

  on( type, handler ) {
    if ( typeof handler !== 'function' ) {
      return
    }

    this._listeners[ type ] = this._listeners[ type ] || []
    this._listeners[ type ].push( handler )
  }
}

class CommandPalette {
  constructor() {
    this.menu = []
  }

  prepend( item ) {
    this.menu.unshift( item )
  }

  append( item ) {
    this.menu.push( item )
  }

  get() {
    return this.menu || []
  }
}

export default ( ctx, { port } = {} ) => {
  // expose to other plugins
  const palette = new CommandPalette()
  const service = new Service( { port } )

  ctx.expose( 'palette', palette )
  ctx.expose( 'service', service )

  ctx.events.on( 'system:before-startup', async () => {
    const id = 'nut-plugin-microfrontends-root'

    const node = document.createElement( 'div' )
    node.id = id
    document.body.appendChild( node )

    new Vue( {
      render: h => h( App, {
        props: {
          palette: palette.get(),
        }
      } ),
    } ).$mount( '#' + id )
  } )
}
