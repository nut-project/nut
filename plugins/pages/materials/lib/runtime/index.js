/* global document, WebSocket */

import Vue from 'vue'
import App from './App'

export default async ( ctx, options ) => {
  const ws = new WebSocket( `ws://127.0.0.1:${ options.port }` )

  function send( message ) {
    ws.send( JSON.stringify( message ) )
  }

  const _actions = {}

  function action( type, handler ) {
    _actions[ type ] = handler
  }

  ws.addEventListener( 'open', () => {
    console.log( '[MS] Materials Server connected' )
    send( {
      type: 'client:ready'
    } )
  } )

  ws.addEventListener( 'message', e => {
    let json = {}

    try {
      json = JSON.parse( e.data )
    } catch ( e ) {
      json = {}
    }

    if ( typeof _actions[ json.type ] === 'function' ) {
      _actions[ json.type ]( json.data )
    }
  } )

  // actions
  action( 'blocks:ready', data => {
    if ( data && data.blocks ) {
      const id = 'nut-plugin-materials-root'

      const node = document.createElement( 'div' )
      node.id = id
      document.body.appendChild( node )
      new Vue( {
        render: h => h( App, {
          props: {
            blocks: data.blocks || []
          }
        } ),
      } ).$mount( '#' + id )
    }
  } )
}
