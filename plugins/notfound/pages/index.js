---
layout: none
---

export default function ( ctx, options = {} ) {

  return {
    mount( node ) {
      node.innerText = '404'
    },

    unmount( node ) {
      node.innerText = ''
    }
  }
}
