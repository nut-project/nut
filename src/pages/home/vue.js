---
title: vue
---

import Vue from 'vue'

const Page = {
  render( h ) {
    return h( 'span', {}, [
      'page written by vue ' + this.count
    ] )
  },
  data() {
    return {
      count: 0,
    }
  },
  mounted() {
    setInterval( () => {
      this.count++
    }, 1000 )
  },
}

export default ctx => {
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
