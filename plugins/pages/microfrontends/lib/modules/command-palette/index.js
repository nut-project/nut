/* global location, WebSocket, document */

import Vue from 'vue'
import axios from 'axios'
import App from './App.vue'
import toast from './toast'

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

  async message( message ) {
    await this._wsready.promise
    this.ws.send( JSON.stringify( message ) )
  }

  onMessage( type, handler ) {
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
    this.emitter = new Vue()
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

  loadingStart() {
    this.emitter.$emit( 'loading-start' )
  }

  loadingEnd() {
    this.emitter.$emit( 'loading-end' )
  }
}

export default ( ctx, { port } = {} ) => {
  // expose to other plugins
  const palette = new CommandPalette()
  const service = new Service( { port } )
  let vm

  ctx.expose( 'palette', palette )
  ctx.expose( 'service', service )
  ctx.expose( 'toast', toast )
  ctx.expose( 'get-palette-node', () => {
    return vm && vm.$el
  } )

  ctx.events.on( 'system:before-startup', async () => {
    const paletteItems = palette.get()

    if ( !paletteItems || paletteItems.length === 0 ) {
      return
    }

    const node = document.createElement( 'div' )
    document.body.appendChild( node )

    const Ctor = Vue.extend( App )

    vm = new Ctor( {
      propsData: {
        palette: paletteItems,
      }
    } ).$mount( node )

    palette.emitter.$on( 'loading-start', () => {
      if ( vm ) {
        vm.loadingStart()
      }
    } )

    palette.emitter.$on( 'loading-end', () => {
      if ( vm ) {
        vm.loadingEnd()
      }
    } )
  } )
}
