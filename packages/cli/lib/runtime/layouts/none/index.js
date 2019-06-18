/* global document */

export default {
  name: 'layout-none',

  type: 'layout',

  async apply( ctx ) {
    let container
    let content

    await ctx.api.layout.register( {
      name: 'none',

      mount( node ) {
        container = document.createElement( 'div' )
        content = document.createElement( 'div' )
        container.appendChild( content )

        node.appendChild( container )
      },

      unmount( node ) {
        if ( node && container ) {
          node.removeChild( container )
        }
      },

      getMountNode() {
        return content
      },
    } )
  }
}
