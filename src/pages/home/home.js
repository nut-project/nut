---
title: home
---

import Regular from 'regularjs'
import styles from './home.module.scss'

const Page = Regular.extend( {
  template: `
    <div class="${ styles.home_scss_test }">home</div>
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
