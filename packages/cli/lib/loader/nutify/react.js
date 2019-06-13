import ReactDOM from 'react-dom'
import React from 'react'

export default function ( all = {} ) {
  const Page = all.default || {}
  const attributes = all.attributes || {}

  Page.$$nut = ctx => {
    let el
    let instance
    let mounted = false

    const definition = {
      attributes,

      mount( node ) {
        if ( !el ) {
          el = document.createElement( 'div' )
          node.appendChild( el )

          if ( !mounted ) {
            instance = ReactDOM.render( React.createElement( Page ), el )
            mounted = true
          }
        } else {
          node.appendChild( el )
        }
      },

      unmount( node ) {
        if ( !mounted ) {
          return
        }

        if ( el && ( el.parentNode === node ) ) {
          node.removeChild( el )
        }
      },

      destroy() {
        if ( !instance ) {
          return
        }

        ReactDOM.unmountComponentAtNode( el )
        el = null
      },
    }

    if ( Page.beforeEnter ) {
      definition.beforeEnter = ( ctx ) => {
        const oldnext = ctx.next

        ctx.next = function ( v ) {
          if ( typeof v === 'function' ) {
            return oldnext( () => {
              return v.call( instance, instance )
            } )
          }

          return oldnext( v )
        }

        return Page.beforeEnter( ctx )
      }
    }

    if ( Page.enter ) {
      definition.enter = ( ...args ) => {
        return Page.enter.call( instance, ...args )
      }
    }

    if ( Page.beforeLeave ) {
      definition.beforeLeave = ( ...args ) => {
        return Page.beforeLeave.call( instance, ...args )
      }
    }

    if ( Page.leave ) {
      definition.leave = ( ...args ) => {
        return Page.leave.call( instance, ...args )
      }
    }

    return definition
  }

  return Page
}
