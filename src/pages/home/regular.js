---
title: regular
permission: [ 'admin' ]
cacheable: true
---

import Regular from 'regularjs'
import './regular.styl'

const Page = Regular.extend( {
  template: `
    <div class="stylus_test">
      page written by regular { count }
    </div>
  `,

  config() {
    this.data.count = 0
  },

  init() {
    setInterval( () => {
      this.data.count = this.data.count + 1
      this.$update()
    }, 1000 )
  }
} )

Page.$$nut = function ( ctx ) {
  let instance

  return {
    beforeEnter( { next } ) {
      next()
    },

    mount( node ) {
      if ( !instance ) {
        instance = new Page()
      }

      instance.$inject( node )
    },

    unmount( node ) {
      if ( !instance ) {
        return
      }

      instance.$inject( false )
    },

    destroy() {
      if ( !instance ) {
        return
      }

      instance.destroy()
      instance = null
    }
  }
}

export default Page
