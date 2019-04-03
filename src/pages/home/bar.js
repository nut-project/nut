---
title: 订阅
---

import Regular from 'regularjs'

const Page = Regular.extend( {
  template: `
    订阅页
  `
} )

export default function ( ctx ) {
  let instance

  return {
    mount( node ) {
      if ( !instance ) {
        instance = new Page()
      }
      instance.$inject( node )
    },

    unmount( node ) {
      instance.$inject( false )
    },
  }
}
