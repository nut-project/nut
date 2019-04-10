---
layout: none
---

export default function ( ctx ) {
  return {
    mount( node ) {
      node.innerText = '404'
    },

    unmount( node ) {
      node.innerText = ''
    }
  }
}
