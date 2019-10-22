/* global document */
import Vue from 'vue'
import '@zeit-ui/themes/index.css'
import * as Switcher from '@zeit-ui/vue/lib/switcher.common'
import * as Dialog from '@zeit-ui/vue/lib/dialog.common'
import '@zeit-ui/vue/lib/switcher.css'
import '@zeit-ui/vue/lib/dialog.css'
import MaterialsMarket from './materials-market.vue'
import styles from './index.module.less'

export default ctx => {
  Switcher.install( Vue )
  Dialog.install( Vue )

  const service = ctx.use( 'microfrontends', 'service' )
  const palette = ctx.use( 'microfrontends', 'palette' )
  const toast = ctx.use( 'microfrontends', 'toast' )

  palette.append( {
    text: '应用信息',
    click( { hide } ) {
      console.log( '应用信息' )
      hide()
    },
  } )

  const mountNode = document.createElement( 'div' )
  document.body.appendChild( mountNode )
  const Ctor = Vue.extend( MaterialsMarket )
  const market = new Ctor().$mount( mountNode )

  market.$on( 'add-block', async block => {
    const page = ctx.api.router.matchPage()
    const matched = ctx.pages.find( p => p.page === page )

    if ( !matched ) {
      return toast.danger( { text: '未匹配到页面' } )
    }

    palette.loadingStart()

    const response = await service.call( 'add-block', {
      page: {
        page: matched.page,
        location: matched.location,
      },
      block,
    } )

    palette.loadingEnd()

    if ( response.success ) {
      toast.success( '区块已添加' )
    } else {
      toast.danger( response.message )
    }
  } )

  service.onMessage( 'toast', data => {
    if ( data.success ) {
      toast.success( data.message )
    } else {
      toast.danger( data.message )
    }
  } )

  const $app = document.getElementById( 'app' )
  const transitionClass = styles.transition
  const offsetClass = styles.offset

  document.addEventListener( 'click', e => {
    const $palette = ctx.use( 'microfrontends', 'get-palette-node' )

    if ( !market.$el || !$palette ) {
      return
    }

    const isClickOutside = !market.$el.contains( e.target ) &&
      !$palette.contains( e.target )

    if ( isClickOutside ) {
      hideMarket()
    }
  }, false )

  function showMarket() {
    const $palette = ctx.use( 'microfrontends', 'get-palette-node' )

    $app.classList.add( transitionClass )
    if ( $palette ) {
      $palette.classList.add( transitionClass )
    }

    $app.classList.add( offsetClass )
    if ( $palette ) {
      $palette.classList.add( offsetClass )
    }

    market.show()
  }

  function hideMarket() {
    const $palette = ctx.use( 'microfrontends', 'get-palette-node' )

    $app.classList.remove( offsetClass )
    if ( $palette ) {
      $palette.classList.remove( offsetClass )
    }

    market.hide()
  }

  let blocks
  palette.append( {
    text: '物料市场',
    async click( { hide } ) {
      hide()

      if ( !blocks ) {
        const materials = await service.call( 'get-blocks' ) || {}
        blocks = ( materials && materials.blocks ) || []
        market.updateBlocks( blocks )
      }

      setTimeout( function () {
        showMarket()
      }, 0 )
    },
  } )

  palette.append( {
    text: '关于',
    click( { hide } ) {
      console.log( '关于' )
      hide()
    },
  } )
}
