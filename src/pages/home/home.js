---
title: home
---

import Regular from 'regularjs'

const Page = Regular.extend( {
  template: `
    home
  `
} )

Page.$$nut = function ( ctx ) {
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

export default Page
