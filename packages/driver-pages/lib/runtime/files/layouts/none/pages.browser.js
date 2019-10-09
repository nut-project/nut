/* global document */

export default async ctx => {
  let container
  let mountNode

  await ctx.api.layout.register( {
    name: 'none',

    mount( node ) {
      container = document.createElement( 'div' )
      mountNode = document.createElement( 'div' )
      container.appendChild( mountNode )

      node.appendChild( container )
    },

    unmount( node ) {
      if ( node && container && ( container.parentNode === node ) ) {
        node.removeChild( container )
      }
    },

    getMountNode() {
      return mountNode
    },
  } )
}
