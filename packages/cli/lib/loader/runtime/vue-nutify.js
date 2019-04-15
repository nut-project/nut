import Vue from 'vue';

export default function ( Page ) {
  Page.$$nut = ctx => {
    let instance
    let el

    return {
      mount( node ) {
        if ( !instance ) {
          instance = new Vue( {
            render: h => h( Page )
          } )
        }

        if ( !el ) {
          el = document.createElement( 'div' )
          node.appendChild( el )
          instance.$mount( el )
        } else {
          node.appendChild( instance.$el )
        }
      },

      unmount( node ) {
        if ( !instance ) {
          return
        }

        node.removeChild( instance.$el )
      },
    }
  }

  return Page
}
