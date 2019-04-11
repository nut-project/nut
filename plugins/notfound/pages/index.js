---
layout: none
---

export default function ( ctx, options = {} ) {

  return {
    mount( node ) {
      node.innerText = '404 ' + options.emoji
    },

    unmount( node ) {
      node.innerText = ''
    }
  }
}
