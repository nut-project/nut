---
title: 详情
---

import Regular from 'regularjs'

const Page = Regular.extend( {
  template: `
    <div>
      <a href="#/pages/home/foo/index">home/foo/{ $router.params.id }</a>
    </div>
  `,
  config() {

  },
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
